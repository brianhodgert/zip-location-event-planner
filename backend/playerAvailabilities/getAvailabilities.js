class GetAvailabilities {
  constructor(db) {
    this.DB = db;
  }

  async getAvailabilities(email) {
    try {
      const availabilities = await this.getItems(email);
      return {
        statusCode: 200,
        body: JSON.stringify(availabilities),
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

  async getItems(email) {
    var availabilities = [];

    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);
    if (profileInfo) {
      for (var activity of profileInfo.activities) {
        for (var availability of profileInfo.availabilities) {
          const availabilityKey = {
            PK: `${activity.activity}-${profileInfo.location}-player`,
            SK: `${availability.dayOfWeek}-${profileInfo.playerID}-${availability.timeOfDay}`,
          };
          var availability = await this.DB.getItem(availabilityKey);
          if (availability) {
            availabilities.push(availability);
          }
        }
      }

      if (profileInfo.draftCard && profileInfo.draftCard != "") {
        var currentAvailabilityKey = {
          PK: `${profileInfo.draftCard.activity}-${profileInfo.draftCard.location}-player`,
          SK: `${profileInfo.draftCard.dateStamp}-${profileInfo.playerID}`,
        };
        var currentAvailability = await this.DB.getItem(currentAvailabilityKey);
        if (availability) {
          availabilities.push(currentAvailability);
        }
      }
    }
    return availabilities;
  }
}
module.exports = GetAvailabilities;
