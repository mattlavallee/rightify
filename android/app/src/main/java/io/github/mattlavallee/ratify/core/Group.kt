package io.github.mattlavallee.ratify.core

import com.google.android.gms.location.places.Place
import java.util.*

class Group {
    var name: String
    var description: String
    var activity: String
    var placeName: String = ""
    var placeLatitude: Double = -1.0
    var placeLongitude: Double = -1.0
    var maxResults: Int = -1
    var expirationDays: Int = -1
    var voteConclusion: Date = Date(0)

    constructor(name: String, descr: String, activity: String, location: Place?, numResults: Int,
                conclusion: Date, expiration: Int) {
        this.name = name
        this.description = descr
        this.activity = activity
        if (location != null) {
            this.placeName = location.name.toString()
            this.placeLatitude = location.latLng.latitude
            this.placeLongitude = location.latLng.longitude
        }

        this.maxResults = numResults
        this.voteConclusion = conclusion
        this.expirationDays = expiration
    }

    fun populateParams(params: MutableMap<String, Any>): MutableMap<String, Any> {
        params["name"] = this.name
        params["description"] = this.description
        params["activity"] = this.activity
        params["startingLocation"] = this.placeName
        params["latitude"] = this.placeLatitude
        params["longitude"] = this.placeLongitude
        params["results"] = this.maxResults
        params["expiration"] = this.expirationDays
        params["conclusion"] = this.voteConclusion.time
        return params
    }
}