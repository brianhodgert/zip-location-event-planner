class GetFriends {
  constructor(db) {
    this.DB = db;
  }

  async getFriends(email) {
    try {
      const friends = await this.getItems(email);
      return {
        statusCode: 200,
        body: JSON.stringify(friends),
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

  async getItems(email) {
    const response = await this.DB.getItem({
      PK: `${email}-profile`,
      SK: `${email}`,
    });
    return response?.friends;
  }
}
module.exports = GetFriends;
