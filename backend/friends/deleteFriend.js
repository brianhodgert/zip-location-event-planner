class DeleteFriend {
  constructor(db) {
    this.DB = db;
  }

  async deleteFriend(email, playerID, friendID) {
    try {
      const response = await this.delete(email, playerID, friendID);

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

  async delete(email, playerID, friendID) {
    const profileKey = { PK: `${email}-profile`, SK: email };
    const profileInfo = await this.DB.getItem(profileKey);

    if (profileInfo?.friends) {
      var friendsList = profileInfo.friends;

      var index = friendsList.indexOf(friendID);
      if (index > -1) {
        friendsList.splice(index, 1);
      }
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
          var index = friendFriendsList.indexOf(playerID);
          if (index > -1) {
            friendFriendsList.splice(index, 1);
          }
          friendFriendsList.filter((player) => player === playerID);
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
module.exports = DeleteFriend;
