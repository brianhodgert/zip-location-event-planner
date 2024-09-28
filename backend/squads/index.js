const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const GetSquads = require("./getSquads");
const getSquads = new GetSquads(dbService);
const GetSquad = require("./getSquad");
const getSquad = new GetSquad(dbService);
const CreateSquad = require("./createSquad");
const createSquad = new CreateSquad(dbService);
const DeleteSquad = require("./deleteSquad");
const deleteSquad = new DeleteSquad(dbService);

const { authenticateToken } = require("../utils/authenticateToken");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const profile = authenticateToken(event.headers);
  const squadID = event.pathParameters?.squadID;
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
    if (squadID) {
      response = await getSquad.getSquad(squadID);
    } else {
      response = await getSquads.getSquads(profile.email);
    }
  } else if (event.httpMethod == "POST") {
    response = await createSquad.createSquad(
      profile.email,
      profile.playerID,
      JSON.parse(event.body)
    );
  } else if (event.httpMethod == "DELETE") {
    response = await deleteSquad.deleteSquad(
      profile.email,
      profile.playerID,
      squadID
    );
  }

  callback(null, response);
};
