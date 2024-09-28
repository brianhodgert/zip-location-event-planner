class UpdateInvite {
  constructor(db) {
    this.DB = db;
  }

  async updateInvite(email, playerID, body) {
    try {
      if (body.didAccept) {
        var response = await this.acceptInvite(email, playerID, body);
      } else {
        var response = await this.rejectInvite(playerID, body);
      }
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

  async acceptInvite(email, playerID, invite) {
    var inviteID = invite.inviteID;

    if (invite.inviteType === "game") {
      await this.acceptGameInvite(playerID, inviteID);
      inviteID = inviteID.gameSK;
    } else if (invite.inviteType === "squad") {
      await this.acceptSquadInvite(email, playerID, inviteID);
    } else if (invite.inviteType === "friend") {
      await this.acceptFriendInvite(email, playerID, inviteID);
    }
    const inviteKey = { PK: `${playerID}-invite`, SK: inviteID };
    await this.DB.deleteItem(inviteKey);
  }
  async rejectInvite(playerID, invite) {
    var inviteID = invite.inviteID;

    if (invite.inviteType === "game") {
      inviteID = invite.inviteID.gameSK;
    }

    const inviteKey = { PK: `${playerID}-invite`, SK: inviteID };

    await this.DB.deleteItem(inviteKey);
    return true;
  }

  async incrementPlayerCount(gameKey, playerCount) {
    const key = gameKey;
    const expression = "SET #playerCount = :playerCount";
    const names = {
      "#playerCount": "playerCount",
    };
    const values = {
      ":playerCount": playerCount + 1,
    };
    await this.DB.updateItem(expression, key, names, values);
  }

  async acceptSquadInvite(email, playerID, squad) {
    const squadKey = { PK: `${squad}-squad`, SK: "squad" };
    const squadInfo = await this.DB.getItem(squadKey);
    var players = squadInfo?.players;
    players.push(playerID);
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

    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);

    var squads = profileInfo?.squads;
    if (!squads) {
      squads = [];
    }
    squads.push(squad);

    const profileExpression = "SET #squads = :squads";
    const profileNames = {
      "#squads": "squads",
    };
    const profileValues = {
      ":squads": squads,
    };
    await this.DB.updateItem(
      profileExpression,
      profileKey,
      profileNames,
      profileValues
    );
  }

  async acceptGameInvite(playerID, inviteID) {
    const gameKey = { PK: inviteID.gamePK, SK: inviteID.gameSK };
    const game = await this.DB.getItem(gameKey);

    const gamePlayer = {
      PK: inviteID.gameSK,
      SK: playerID,
      arrivalTime: game.startTime,
      lastUpdate: Date.now(),
      status: "joined",
    };
    const playerGame = {
      PK: `${playerID}-game`,
      SK: inviteID.gameSK,
      gamePK: inviteID.gamePK,
      gameSK: inviteID.gameSK,
    };

    await Promise.all([
      this.DB.putItem(gamePlayer),
      this.DB.putItem(playerGame),
      this.incrementPlayerCount(gameKey, game.playerCount),
    ]);
  }

  async incrementPlayerCount(gameKey, playerCount) {
    const key = gameKey;
    const expression = "SET #playerCount = :playerCount";
    const names = {
      "#playerCount": "playerCount",
    };
    const values = {
      ":playerCount": playerCount + 1,
    };
    await this.DB.updateItem(expression, key, names, values);
  }

  async acceptFriendInvite(email, playerID, friendID) {
    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);

    if (profileInfo?.friends) {
      var friendsList = profileInfo.friends;
      friendsList.push(friendID);
      await this.updateFriendsList(profileKey, friendsList);

      const friendEmailKey = { PK: friendID, SK: friendID };
      const friendEmail = await this.DB.getItem(friendEmailKey);

      if (friendEmail?.email) {
        const friendKey = {
          PK: `${friendEmail?.email}-profile`,
          SK: friendEmail?.email,
        };
        const friendProfileInfo = await this.DB.getItem(friendKey);
        if (friendProfileInfo?.friends) {
          var friendFriendsList = friendProfileInfo.friends;
          friendFriendsList.push(playerID);
          await this.updateFriendsList(friendKey, friendFriendsList);
        }
      }
    }
  }

  async updateFriendsList(key, friendsList) {
    const expression = "SET #friends = :friends";
    const names = {
      "#friends": "friends",
    };
    const values = {
      ":friends": friendsList,
    };
    await this.DB.updateItem(expression, key, names, values);
  }
}
module.exports = UpdateInvite;
