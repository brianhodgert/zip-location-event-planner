const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const GetAvailabilities = require("./getAvailabilities");
const getAvailabilities = new GetAvailabilities(dbService);
const CreateAvailability = require("./createAvailability");
const createAvailability = new CreateAvailability(dbService);
const DeleteAvailability = require("./deleteAvailability");
const deleteAvailability = new DeleteAvailability(dbService);

const { authenticateToken } = require("../utils/authenticateToken");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const profile = authenticateToken(event.headers);
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
    response = await getAvailabilities.getAvailabilities(profile.email);
  } else if (event.httpMethod == "DELETE") {
    response = await deleteAvailability.deleteAvailability(profile.email);
  } else if (event.httpMethod == "POST") {
    response = await createAvailability.createAvailability(
      profile.email,
      profile.playerID,
      JSON.parse(event.body)
    );
  }

  callback(null, response);
};
