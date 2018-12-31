package io.github.mattlavallee.ratify.core

import java.io.Serializable
import java.text.SimpleDateFormat

class DetailedGroup(
    private val details: Group,
    val matches: ArrayList<YelpResult>,
    private val votes: Map<String, UserVote>
) : Serializable {
    private val conclusionFormatter: SimpleDateFormat = SimpleDateFormat("MMM d yyyy h:mm a")
    fun isConcluded(): Boolean {
        return this.details.isConcluded()
    }

    fun getName(): String {
        return this.details.name
    }

    fun getDescription(): String {
        return this.details.description
    }

    fun getVoteConclusion(): String {
        return conclusionFormatter.format(this.details.voteConclusion)
    }

    companion object {
        fun fromJsonHashMap(groupId: String, userId: String, model: HashMap<String, Any>): DetailedGroup {
            val groupDetails = Group.fromJsonHashMap(groupId, model)
            val matches = YelpResult.fromHashMap(model["matches"] as HashMap<String, HashMap<String, Any>>)
            val userVotesMap = (model["userVotes"] as HashMap<String, Any>)[userId] as HashMap<String, Any>
            val userVotes: Map<String, UserVote> = UserVote.fromHashMap(userVotesMap)
            return DetailedGroup(groupDetails, matches, userVotes)
        }
    }
}