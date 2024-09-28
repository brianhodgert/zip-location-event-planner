const { v1: uuidv1 } = require("uuid");

class CreateSquad {
  constructor(db) {
    this.DB = db;
  }

  async createSquad(email, playerID, body) {
    try {
      const squadExists = await this.create(email, playerID, body.squadID);
      if (squadExists) {
        return {
          statusCode: 200,
          body: JSON.stringify({ nameTaken: true }),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({ nameTaken: false }),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
        };
      }
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

  async create(email, playerID, squadID) {
    const existingSquad = await this.DB.getItem({
      PK: `${squadID}-squad`,
      SK: "squad",
    });
    if (!existingSquad) {
      const squadData = {
        PK: `${squadID}-squad`,
        SK: `squad`,
        games: [],
        players: [playerID],
      };
      await this.DB.putItem(squadData);
      await this.updateSquadList(email, squadID);
      return false;
    } else {
      return true;
    }
  }

  async updateSquadList(email, squad) {
    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);
    var squads = profileInfo?.squads;
    if (!squads) {
      squads = [];
    }
    squads.push(squad);

    const expression = "SET #squads = :squads";
    const names = {
      "#squads": "squads",
    };
    const values = {
      ":squads": squads,
    };
    await this.DB.updateItem(expression, profileKey, names, values);
  }
}
module.exports = CreateSquad;
