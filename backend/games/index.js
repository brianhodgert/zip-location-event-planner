const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const GetGame = require("./getGame");
const getGame = new GetGame(dbService);
const CreateGame = require("./createGame");
const createGame = new CreateGame(dbService);
const UpdateGame = require("./updateGame");
const updateGame = new UpdateGame(dbService);

const { authenticateToken } = require("../utils/authenticateToken");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const profile = authenticateToken(event.headers);
  const gameID = event.pathParameters?.gameID;
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
    response = await getGame.getGame(event.queryStringParameters);
  } else if (event.httpMethod == "PUT") {
    response = await updateGame.updateGame(
      profile.playerID,
      JSON.parse(event.body)
    );
  } else if (event.httpMethod == "POST") {
    response = await createGame.createGame(
      profile.playerID,
      JSON.parse(event.body)
    );
  }

  callback(null, response);
};
