class GetProfile {
  constructor(db) {
    this.DB = db;
  }

  async getProfile(email) {
    try {
      const profileInfo = await this.getItem(email);
      return {
        statusCode: 200,
        body: JSON.stringify(profileInfo),
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

  async getItem(email) {
    const response = await this.DB.getItem({
      PK: `${email}-profile`,
      SK: `${email}`,
    });
    return response;
  }
}
module.exports = GetProfile;
