const { v1: uuidv1 } = require("uuid");

class CreateGame {
  constructor(db) {
    this.DB = db;
  }

  async createGame(playerID, body) {
    try {
      const response = await this.create(playerID, body);

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

  async create(playerID, game) {
    const gameID = uuidv1();
    const gameData = {
      PK: `${game.location}-game`,
      SK: `${game.dateStamp}-${gameID}`,
      activity: game.activity,
      startTime: game.startTime,
      endTime: game.endTime,
      coordinates: game.coordinates,
      isOpen: game.isOpen,
      name: game.name,
      playerCount: 1,
      description: game.description,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      isOpen: game.isOpen,
      level: game.level,
      gameID: gameID,
      gameCreator: playerID,
    };
    const gamePlayer = {
      PK: `${game.dateStamp}-${gameID}`,
      SK: playerID,
      arrivalTime: game.startTime,
      lastUpdate: Date.now(),
      status: "joined",
    };
    const playerGame = {
      PK: `${playerID}-game`,
      SK: `${game.dateStamp}-${gameID}`,
      gamePK: `${game.activity}-${game.location}`,
      gameSK: `${game.dateStamp}-${gameID}`,
    };

    await Promise.all([
      this.DB.putItem(gameData),
      this.DB.putItem(gamePlayer),
      this.DB.putItem(playerGame),
    ]);
  }
}
module.exports = CreateGame;
