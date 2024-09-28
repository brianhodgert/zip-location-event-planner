const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const GetInvites = require("./getInvites");
const getInvites = new GetInvites(dbService);
const CreateInvite = require("./createInvite");
const createInvite = new CreateInvite(dbService);
const UpdateInvite = require("./updateInvite");
const updateInvite = new UpdateInvite(dbService);

const { authenticateToken } = require("../utils/authenticateToken");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const profile = authenticateToken(event.headers);
  const inviteID = event.pathParameters?.inviteID;
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
    response = await getInvites.getInvites(profile.playerID);
  } else if (event.httpMethod == "PUT") {
    response = await updateInvite.updateInvite(
      profile.email,
      profile.playerID,
      JSON.parse(event.body)
    );
  } else if (event.httpMethod == "POST") {
    response = await createInvite.createInvite(JSON.parse(event.body));
  }

  callback(null, response);
};
