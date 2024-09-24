const zipcodes = require("zipcodes-nearby");

class GetAvailableGames {
  constructor(db) {
    this.DB = db;
  }

  async getAvailableGames(gameQuery) {
    try {
      const availableGames = await this.getItems(gameQuery);
      return {
        statusCode: 200,
        body: JSON.stringify(availableGames),
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

  async getItems(gameQuery) {
    var availableGames = [];
    var proximity = Math.ceil(gameQuery.proximity * 1609.34);
    var zipCodes = await zipcodes.near(
      gameQuery.location.toString(),
      proximity,
      { datafile: "/var/task/utils/zipcodes.csv" }
    );
    for (var zipCode of zipCodes) {
      const expression = "#pk = :pk AND begins_with(#sk, :sk)";
      const names = {
        "#pk": "PK",
        "#sk": "SK",
      };
      const values = {
        ":pk": `${zipCode}-game`,
        ":sk": `${gameQuery.dateStamp}`,
      };
      const response = await this.DB.queryItem(expression, names, values);
      for (var game of response) {
        if (game.isOpen) {
          if (gameQuery.activity && gameQuery.activity === game.activity) {
            availableGames.push(game);
          }
        }
      }
    }
    return availableGames;
  }
}
module.exports = GetAvailableGames;
