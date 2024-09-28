class CreateGame {
  constructor(db) {
    this.DB = db;
  }

  async createInvite(body) {
    try {
      await this.create(body);

      return {
        statusCode: 200,
        body: JSON.stringify("Invite sent"),
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

  async create(invite) {
    var inviteSK = invite.inviteID;
    if (invite.inviteType == "game") {
      inviteSK = invite.inviteID.gameSK;
    }
    const squadData = {
      PK: `${invite.playerID}-invite`,
      SK: inviteSK,
      inviteType: invite.inviteType,
      inviteID: invite.inviteID,
    };
    await this.DB.putItem(squadData);
  }
}
module.exports = CreateGame;
