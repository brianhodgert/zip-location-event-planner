const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const UserDB = require("../../utils/userDB");
const userDB = new UserDB(dbService);

const { isEmptyObject } = require("../../utils/objectUtils");

const FIVE_MINUTES = 5 * 60 * 1000;

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  var body = "";

  try {
    if (event.body) {
      const userCredentials = JSON.parse(event.body);
      const email = userCredentials.email.toLowerCase();
      const tempPasswordKey = { PK: email, SK: "tempPassword" };
      const tempPasswordResponse = await dbService.getItem(tempPasswordKey);

      if (tempPasswordResponse && !isEmptyObject(tempPasswordResponse)) {
        if (tempPasswordResponse.failedAttempts < 5) {
          const hashedTempPassword = tempPasswordResponse.hashedTempPassword;
          const creationTime = new Date(tempPasswordResponse.createdAt);

          if (new Date() - creationTime > FIVE_MINUTES) {
            body = JSON.stringify({ requestNewTempPassword: "expired" });
          } else if (
            await bcrypt.compare(
              userCredentials.tempPassword,
              hashedTempPassword
            )
          ) {
            body = JSON.stringify({
              requestNewTempPassword: false,
              passwordMatch: true,
            });
          } else {
            body = JSON.stringify({
              requestNewTempPassword: false,
              passwordMatch: false,
            });
            await failedAttempt(email, tempPasswordResponse.failedAttempts);
          }
        } else {
          body = JSON.stringify({
            requestNewTempPassword: "locked",
            passwordMatch: false,
          });
        }
      } else {
        body = JSON.stringify({
          requestNewTempPassword: "empty",
          passwordMatch: false,
        });
      }
    }
    callback(null, {
      statusCode: 200,
      body: body,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  } catch (e) {
    console.log(e);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify("Request failed"),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  }
};

async function failedAttempt(email, count) {
  const key = { PK: `${email}`, SK: `tempPassword` };
  const expression = "SET #failedAttempts = :failedAttempts";
  const names = {
    "#failedAttempts": "failedAttempts",
  };
  const values = {
    ":failedAttempts": count + 1,
  };

  await dbService.updateItem(expression, key, names, values);
}
