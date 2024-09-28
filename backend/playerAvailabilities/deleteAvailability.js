class DeleteAvailability {
  constructor(db) {
    this.DB = db;
  }

  async deleteAvailability(email) {
    try {
      const response = await this.delete(email);

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

  async delete(email) {
    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);
    if (profileInfo && profileInfo.draftCard && profileInfo.draftCard != "") {
      const availabilityKey = {
        PK: `${profileInfo.draftCard.activity}-${profileInfo.draftCard.location}-player`,
        SK: `${profileInfo.draftCard.dateStamp}-${profileInfo.playerID}`,
      };
      const expression = "SET #draftCard = :draftCard";
      const names = {
        "#draftCard": "draftCard",
      };
      const values = {
        ":draftCard": "",
      };

      await Promise.all([
        this.DB.deleteItem(availabilityKey),
        this.DB.updateItem(expression, profileKey, names, values),
      ]);
    }
  }
}
module.exports = DeleteAvailability;
