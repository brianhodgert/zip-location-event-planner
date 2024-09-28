class UpdateGameStatus {
  constructor(db) {
    this.DB = db;
  }

  async updateGameStatus(playerID, body) {
    try {
      var response = await this.updateStatus(playerID, body);

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

  async updateStatus(playerID, statusChange) {
    const gameKey = { PK: statusChange.gamePK, SK: statusChange.gameSK };
    const game = await this.DB.getItem(gameKey);

    if (game == null) {
      return "Game not found.";
    }

    if (statusChange.status == "leave") {
      const playerGameKey = { PK: `${playerID}-game`, SK: game.SK };
      await this.DB.deleteItem(playerGameKey);

      const gamePlayerKey = { PK: `${game.SK}`, SK: playerID };
      await this.DB.deleteItem(gamePlayerKey);

      if (game.playerCount <= 1) {
        await this.DB.deleteItem(gameKey);
      } else {
        await this.changePlayerCount(gameKey, game.playerCount - 1);
      }
    } else if (statusChange.status == "join") {
      if (game.playerCount < game.maxPlayers) {
        const gamePlayer = {
          PK: game.SK,
          SK: playerID,
          arrivalTime: statusChange.arrivalTime,
          lastUpdate: Date.now(),
          status: "joined",
        };
        await this.DB.putItem(gamePlayer);

        const playerGame = {
          PK: `${playerID}-game`,
          SK: game.SK,
          gamePK: game.PK,
          gameSK: game.SK,
        };
        await this.DB.putItem(playerGame);
        await this.changePlayerCount(gameKey, game.playerCount + 1);
      }
    } else {
      const gamePlayer = {
        PK: game.SK,
        SK: playerID,
        arrivalTime: statusChange.arrivalTime,
        lastUpdate: Date.now(),
        status: statusChange.status,
      };
      await this.DB.putItem(gamePlayer);
    }
  }

  async changePlayerCount(gameKey, playerCount) {
    const key = gameKey;
    const expression = "SET #playerCount = :playerCount";
    const names = {
      "#playerCount": "playerCount",
    };
    const values = {
      ":playerCount": playerCount,
    };
    await this.DB.updateItem(expression, key, names, values);
  }
}
module.exports = UpdateGameStatus;
