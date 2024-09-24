class DeleteGame {
  constructor(db) {
    this.DB = db;
  }

  async updateGame(playerID, body) {
    try {
      var response = await this.updateGameDetails(playerID, body);
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

  async updateGameDetails(playerID, gameDetails) {
    if (playerID == gameDetails.gameCreator) {
      const key = { PK: gameDetails.PK, SK: gameDetails.SK };
      const expression =
        "SET #activity = :activity, #startTime = :startTime, #endTime = :endTime, #coordinates = :coordinates, #isOpen = :isOpen, #name = :name, #playerCount = :playerCount, #description = :description, #minPlayers = :minPlayers, #maxPlayers = :maxPlayers, #level = :level";
      const names = {
        "#activity": "activity",
        "#startTime": "startTime",
        "#endTime": "endTime",
        "#coordinates": "coordinates",
        "#isOpen": "isOpen",
        "#name": "name",
        "#playerCount": "playerCount",
        "#description": "description",
        "#minPlayers": "minPlayers",
        "#maxPlayers": "maxPlayers",
        "#level": "level",
      };
      const values = {
        ":activity": gameDetails.activity,
        ":startTime": gameDetails.startTime,
        ":endTime": gameDetails.endTime,
        ":playerCount": gameDetails.playerCount,
        ":coordinates": gameDetails.coordinates,
        ":isOpen": gameDetails.isOpen,
        ":name": gameDetails.name,
        ":playerCount": gameDetails.playerCount,
        ":description": gameDetails.description,
        ":minPlayers": gameDetails.minPlayers,
        ":maxPlayers": gameDetails.maxPlayers,
        ":level": gameDetails.level,
      };
      await this.DB.updateItem(expression, key, names, values);
    }
  }
}
module.exports = DeleteGame;
