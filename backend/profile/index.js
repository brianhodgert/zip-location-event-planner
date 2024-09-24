const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const GetProfile = require("./getProfile");
const getProfile = new GetProfile(dbService);
const CreateProfile = require("./createProfile");
const createProfile = new CreateProfile(dbService);
const UpdateProfile = require("./updateProfile");
const updateProfile = new UpdateProfile(dbService);

const { authenticateToken } = require("../utils/authenticateToken");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const profile = authenticateToken(event.headers);
  var response;

  if (!profile?.email) {
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
    response = await getProfile.getProfile(profile?.email);
  } else if (event.httpMethod == "POST" && !profile.playerID) {
    response = await createProfile.createProfile(
      profile,
      JSON.parse(event.body)
    );
  } else if (event.httpMethod == "PUT" && profile.playerID) {
    response = await updateProfile.updateProfile(
      profile.email,
      profile.playerID,
      JSON.parse(event.body)
    );
  } else {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify("Bad request"),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  }

  callback(null, response);
};
