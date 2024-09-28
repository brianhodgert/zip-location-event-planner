class GetSquads {
  constructor(db) {
    this.DB = db;
  }

  async getSquad(squadID) {
    try {
      const squad = await this.getItem(squadID);
      return {
        statusCode: 200,
        body: JSON.stringify(squad),
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

  async getItem(squadID) {
    const squad = await this.DB.getItem({
      PK: `${squadID}-squad`,
      SK: "squad",
    });
    return squad;
  }
}
module.exports = GetSquads;
