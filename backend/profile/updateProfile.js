const { availabilityCollector } = require("../utils/availabilityCollector");
const { availabilityGenerator } = require("../utils/availabilityGenerator");

class UpdateProfile {
  constructor(db) {
    this.DB = db;
  }

  async updateProfile(email, playerID, body) {
    try {
      await this.updateInfo(email, playerID, body);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      };
    } catch (e) {
      console.log(e);
      return {
        statusCode: 500,
        body: JSON.stringify("Request failed"),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      };
    }
  }

  async updateInfo(email, playerID, profileInfo) {
    const profileKey = { PK: `${email}-profile`, SK: `${email}` };

    const expression =
      "SET #location = :location, #activities = :activities, #availabilities = :availabilities, #friends = :friends";
    const names = {
      "#location": "location",
      "#activities": "activities",
      "#availabilities": "availabilities",
      "#friends": "friends",
    };
    const values = {
      ":location": profileInfo.location,
      ":activities": profileInfo.activities,
      ":availabilities": profileInfo.availabilities,
      ":friends": profileInfo.friends,
    };

    const profile = await this.DB.getItem(profileKey);
    if (profile) {
      await availabilityCollector(
        playerID,
        profile.activities,
        profile.availabilities,
        profile.location,
        this.DB
      );
      await Promise.all([
        this.DB.updateItem(expression, profileKey, names, values),

        availabilityGenerator(
          playerID,
          profileInfo.activities,
          profileInfo.availabilities,
          profileInfo.location,
          this.DB
        ),
      ]);
    }
  }
}
module.exports = UpdateProfile;
