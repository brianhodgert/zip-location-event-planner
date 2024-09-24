class GetRegisteredGames {
  constructor(db) {
    this.DB = db;
  }

  async getRegisteredGames(playerID) {
    try {
      const registeredGames = await this.getItems(playerID);
      return {
        statusCode: 200,
        body: JSON.stringify(registeredGames),
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

  async getItems(playerID) {
    const expression = "#pk = :pk";
    const names = {
      "#pk": "PK",
    };
    const values = {
      ":pk": `${playerID}-game`,
    };
    const response = await this.DB.queryItem(expression, names, values);
    return response;
  }
}
module.exports = GetRegisteredGames;
