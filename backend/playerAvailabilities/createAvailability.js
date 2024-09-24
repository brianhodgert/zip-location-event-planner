class CreateAvailability {
  constructor(db) {
    this.DB = db;
  }

  async createAvailability(email, playerID, body) {
    try {
      await this.deleteOldAvailability(email);
      const response = await this.create(email, playerID, body);

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

  async deleteOldAvailability(email) {
    const key = { PK: email, SK: email };
    const profileInfo = await this.DB.getItem(key);
    if (profileInfo && profileInfo.draftCard && profileInfo.draftCard != "") {
      const key = {
        PK: `${profileInfo.draftCard.activity}-${profileInfo.draftCard.location}-player`,
        SK: `${profileInfo.draftCard.dateStamp}-${profileInfo.playerID}`,
      };
      await this.DB.deleteItem(key);
    }
  }

  async create(email, playerID, draftCard) {
    const data = {
      PK: `${draftCard.activity}-${draftCard.location}-player`,
      SK: `${draftCard.dateStamp}-${playerID}`,
      playerID: playerID,
      dateStamp: draftCard.dayOfWeek,
      startTime: draftCard.startTime,
      endTime: draftCard.endTime,
      activity: draftCard.activity,
      location: draftCard.location,
      skill: draftCard.skill,
    };

    await this.DB.putItem(data);

    const key = {
      PK: `${email}-profile`,
      SK: email,
    };
    const expression = "SET #draftCard = :draftCard";
    const names = {
      "#draftCard": "draftCard",
    };
    const values = {
      ":draftCard": draftCard,
    };

    await this.DB.updateItem(expression, key, names, values);
  }
}
module.exports = CreateAvailability;
