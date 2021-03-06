import { HttpsError, CallableContext } from 'firebase-functions/lib/providers/https';
import { getGroup, updateGroup } from '../database/group';
import { getUser, updateUser } from '../database/user';
import { User } from '../models/user';
import { IGroup } from '../models/group';
import { IResult } from '../models/action-result';
import { initUserVotes } from '../database/votes';

export function joinGroupImpl(data: any, context: CallableContext): Promise<IResult> {
  if (context.auth.uid && context.auth.uid.length > 0) {
    const sanitizedGroupCode = data.groupCode.replace(/\.|#|\$|\[|\]/g, '');
    const groupPromise: Promise<IGroup> = getGroup(sanitizedGroupCode);
    const userPromise: Promise<User> = getUser(context.auth.uid);
    return Promise.all([groupPromise, userPromise]).catch((err: HttpsError) => err)
      .then((results: Array<IGroup|User>|HttpsError): Promise<any> => {
        const group: IGroup = results[0] as IGroup;
        const user: User = results[1] as User;

        if (group && user) {
          if (user.created_groups && user.created_groups[sanitizedGroupCode] ||
            (user.joined_groups && user.joined_groups[sanitizedGroupCode])) {
            return Promise.resolve({
              error: 'Hey! You\'ve already joined this group!',
            });
          }

          const businessIds: Array<string> = Object.keys(group.matches);
          const matchIds: Array<string> = [];
          for(const businessId of businessIds) {
            matchIds.push(sanitizedGroupCode + '|' + businessId);
          }
          group.members[context.auth.uid] = true;
          return Promise.all([
            initUserVotes(context.auth.uid, matchIds),
            updateGroup(sanitizedGroupCode, group),
          ]).then((updateResults: boolean[]): Promise<any> => {
            if (!updateResults[0] || !updateResults[1]) {
              return Promise.resolve({error: 'Error joining the group!'});
            }

            if (!user.joined_groups) {
              user.joined_groups = {};
            }
            user.joined_groups[sanitizedGroupCode] = true;
            return updateUser(context.auth.uid, user).then(() => {
              return {data: sanitizedGroupCode};
            });
          });
        } else if (group && !user) {
          return Promise.resolve({
            error: 'Error retrieving user information',
          });
        } else {
          return Promise.resolve({
            error: 'Aww, shucks, ' + sanitizedGroupCode + ' doesn\'t exist',
          });
        }
      });
  } else {
    return Promise.resolve({
      error: 'Error authenticating the user',
    });
  }
}
