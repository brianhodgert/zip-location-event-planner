const zipcodes = require("zipcodes-nearby");
const moment = require("moment");
class GetSuggestedGames {
  constructor(db) {
    this.DB = db;
  }

  async getSuggestedGames(email, dateStamp) {
    try {
      const suggestedGames = await this.getItems(email, dateStamp);
      return {
        statusCode: 200,
        body: JSON.stringify(suggestedGames),
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

  async getItems(email, dateStamp) {
    const profileResponse = await this.DB.getItem({
      PK: `${email}-profile`,
      SK: `${email}`,
    });
    const profile = profileResponse;

    var games = [];
    var proximity = 50000;

    const zipCodesLocal = zipcodes.near(
      profile.location.toString(),
      proximity,
      {
        datafile: "/var/task/utils/zipcodes.csv",
      }
    );
    const zipCodesDraft = zipcodes.near(
      profile.draftCard.location.toString(),
      proximity,
      {
        datafile: "/var/task/utils/zipcodes.csv",
      }
    );

    const [zipCodesLocalResponse, zipCodesDraftResponse] = await Promise.all([
      zipCodesLocal,
      zipCodesDraft,
    ]);

    const zipCodesList = [...zipCodesLocalResponse, ...zipCodesDraftResponse];
    const zipCodes = [...new Set(zipCodesList)];

    for (var zipCode of zipCodes) {
      const expression = "#pk = :pk AND begins_with(#sk, :sk)";
      const names = {
        "#pk": "PK",
        "#sk": "SK",
      };
      const values = {
        ":pk": `${zipCode}-game`,
        ":sk": `${dateStamp}`,
      };
      const gameResponse = await this.DB.queryItem(expression, names, values);
      for (var game of gameResponse) {
        if (game.isOpen) {
          if (
            profile.activities.some((e) => e.activity === game.activity) ||
            profile.draftCard?.activity === game.activity
          ) {
            games.push(game);
          }
        }
      }
    }
    return games;
  }
}
module.exports = GetSuggestedGames;
