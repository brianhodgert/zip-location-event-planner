const zipcodes = require("zipcodes-nearby");

class GetAvailablePlayers {
  constructor(db) {
    this.DB = db;
  }

  async getAvailablePlayers(gameQuery) {
    try {
      const availablePlayers = await this.getItems(gameQuery);
      return {
        statusCode: 200,
        body: JSON.stringify(availablePlayers),
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
    var year = gameQuery.dateStamp.substring(0, 4);
    var month = gameQuery.dateStamp.substring(4, 6);
    var day = gameQuery.dateStamp.substring(6, 8);

    var lastCompletionDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
    var dayOfWeek = lastCompletionDate.getDay();
    var availablePlayers = [];
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
      var values = {
        ":pk": `${gameQuery.activity}-${zipCode}-player`,
        ":sk": `${gameQuery.dateStamp}`,
      };
      var response = await this.DB.queryItem(expression, names, values);
      for (var item of response) {
        availablePlayers.push(item.playerID);
      }

      values = {
        ":pk": `${gameQuery.activity}-${zipCode}-player`,
        ":sk": `${dayOfWeek}`,
      };
      response = await this.DB.queryItem(expression, names, values);
      for (var item of response) {
        availablePlayers.push(item.playerID);
      }
    }
    return [...new Set(availablePlayers)];
  }
}
module.exports = GetAvailablePlayers;
