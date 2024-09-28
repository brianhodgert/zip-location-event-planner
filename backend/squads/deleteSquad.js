class DeleteSquad {
  constructor(db) {
    this.DB = db;
  }

  async deleteSquad(email, playerID, squadID) {
    try {
      const response = await this.delete(email, playerID, squadID);

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

  async delete(email, playerID, squadID) {
    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);

    if (profileInfo?.squads) {
      var squads = profileInfo.squads;

      var index = squads.indexOf(squadID);
      if (index > -1) {
        squads.splice(index, 1);
      }
      await this.updateSquadsList(profileKey, squads);

      const squadKey = { PK: `${squadID}-squad`, SK: "squad" };
      const squadInfo = await this.DB.getItem(squadKey);
      if (squadInfo?.players) {
        var players = squadInfo?.players;
        index = players.indexOf(playerID);
        if (index > -1) {
          players.splice(index, 1);
        }
        const squadExpression = "SET #players = :players";
        const squadNames = {
          "#players": "players",
        };
        const squadValues = {
          ":players": players,
        };
        await this.DB.updateItem(
          squadExpression,
          squadKey,
          squadNames,
          squadValues
        );
      }
    }
  }

  async updateSquadsList(key, squadsList) {
    const expression = "SET #squads = :squads";
    const names = {
      "#squads": "squads",
    };
    const values = {
      ":squads": squadsList,
    };
    await this.DB.updateItem(expression, key, names, values);
  }
}
module.exports = DeleteSquad;
