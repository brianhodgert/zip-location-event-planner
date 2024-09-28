class GetGame {
  constructor(db) {
    this.DB = db;
  }

  async getGame(gameKey) {
    try {
      const game = await this.getItem(gameKey);
      return {
        statusCode: 200,
        body: JSON.stringify(game),
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

  async getItem(gameKey) {
    const key = { PK: gameKey.gamePK, SK: gameKey.gameSK };
    const gameResponse = await this.DB.getItem(key);

    const expression = "#pk = :pk";
    const names = {
      "#pk": "PK",
    };
    const values = {
      ":pk": gameKey.gameSK,
    };
    const playerResponse = await this.DB.queryItem(expression, names, values);
    if (gameResponse) {
      return [gameResponse, playerResponse];
    } else {
      return [];
    }
  }
}
module.exports = GetGame;
