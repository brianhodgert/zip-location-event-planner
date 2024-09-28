const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const GetFriends = require("./getFriends");
const getFriends = new GetFriends(dbService);
const DeleteFriend = require("./deleteFriend");
const deleteFriend = new DeleteFriend(dbService);

const { authenticateToken } = require("../utils/authenticateToken");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const profile = authenticateToken(event.headers);
  const friendID = event.pathParameters?.friendID;
  var response;

  if (!profile?.email || !profile?.playerID) {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify("Unauthorized"),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  }

  if (event.httpMethod == "GET") {
    response = await getFriends.getFriends(profile.email);
  } else if (event.httpMethod == "DELETE") {
    response = await deleteFriend.deleteFriend(
      profile.email,
      profile.playerID,
      friendID
    );
  }

  callback(null, response);
};
