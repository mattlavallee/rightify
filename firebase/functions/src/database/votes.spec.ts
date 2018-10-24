import * as dbInstance from './db-instance';

let childOnceHasInstance = true;
let limitOnceHasInstance = true;
const dbMock = {
  ref: () => {
    return {
      limitToFirst: () => {
        return {
          once: () => Promise.resolve({
            val: () => {
              return limitOnceHasInstance ? {} : null;
            },
          }),
        };
      },
      set: () => Promise.resolve(),
      child: () => {
        return {
          set: () => Promise.resolve(),
          once: () => {
            if (childOnceHasInstance) {
              return Promise.resolve({val: () => { return {}; }});
            }
            return Promise.resolve({val: () => null});
          },
        };
      }
    };
  },
};

describe('Votes Database Handler', () => {
  describe('initUserVotes - ', () => {
    it('properly resolves for all votes', (done) => {
      childOnceHasInstance = true;
      jest.spyOn(dbInstance, 'getDatabase').mockReturnValueOnce(dbMock);
      const {initUserVotes} = require('./votes');

      initUserVotes('foo', ['v1', 'v2']).then((response) => {
        expect(response).toEqual(true);
        done();
      });
    });

    it('throws an error if a vote returns undefined', (done) => {
      childOnceHasInstance = false;
      jest.spyOn(dbInstance, 'getDatabase').mockReturnValueOnce(dbMock);
      const {initUserVotes} = require('./votes');

      initUserVotes('foo', ['v1']).then((response) => {
        expect(response).toEqual(false);
        done();
      });
    });
  });

  describe('insertUserVotes', () => {
    it('properly resolves for all votes', (done) => {
      limitOnceHasInstance = true;
      jest.spyOn(dbInstance, 'getDatabase').mockReturnValueOnce(dbMock);
      const {insertUserVotes} = require('./votes');

      insertUserVotes({
        v1: { u1: true },
        v2: { u1: true },
      }).then((response) => {
        expect(response).toEqual(true);
        done();
      });
    });

    it('updates votes if no instance found', (done) => {
      limitOnceHasInstance = false;
      jest.spyOn(dbInstance, 'getDatabase').mockReturnValueOnce(dbMock);
      const {insertUserVotes} = require('./votes');

      insertUserVotes({
        v1: { u1: true },
      }).then((response) => {
        expect(response).toEqual(true);
        done();
      });
    });
  });
});