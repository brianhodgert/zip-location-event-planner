const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const { availabilityGenerator } = require("../utils/availabilityGenerator");
const jwt = require("jsonwebtoken");

class CreateProfile {
  constructor(db) {
    this.DB = db;
  }

  async createProfile(user, body) {
    try {
      const response = await this.create(user.email, body);

      return {
        statusCode: 200,
        body: JSON.stringify(response),
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

  async create(email, profileInfo) {
    const playerIDKey = { PK: profileInfo.playerID, SK: profileInfo.playerID };
    const profileKey = { PK: `${email}-profile`, SK: email };
    const currentProfileInfo = await this.DB.getItem(profileKey);
    const playerID = await this.DB.getItem(playerIDKey);
    if (playerID || typeof currentProfileInfo?.playerID !== "undefined") {
      return {
        usernameTaken: true,
      };
    }

    const key = { PK: `${email}-profile`, SK: `${email}` };
    const expression =
      "SET #location = :location, #activities = :activities, #availabilities = :availabilities, #playerID = :playerID";
    const names = {
      "#location": "location",
      "#activities": "activities",
      "#availabilities": "availabilities",
      "#playerID": "playerID",
    };
    const values = {
      ":location": profileInfo.location,
      ":activities": profileInfo.activities,
      ":availabilities": profileInfo.availabilities,
      ":playerID": profileInfo.playerID,
    };
    await Promise.all([
      this.DB.updateItem(expression, key, names, values),
      this.DB.putItem(playerIDKey),
      availabilityGenerator(
        profileInfo.playerID,
        profileInfo.activities,
        profileInfo.availabilities,
        profileInfo.location,
        this.DB
      ),
    ]);

    const accessToken = jwt.sign(
      { email: email, playerID: profileInfo.playerID },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "48h",
      }
    );
    const refreshToken = jwt.sign(
      { email: email, playerID: profileInfo.playerID },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "100d",
      }
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
module.exports = CreateProfile;
