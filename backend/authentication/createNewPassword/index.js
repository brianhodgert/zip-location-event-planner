const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../../utils/databaseManager");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

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
        const hashedTempPassword = tempPasswordResponse.hashedTempPassword;
        const creationTime = new Date(tempPasswordResponse.createdAt);

        if (new Date() - creationTime > FIVE_MINUTES) {
          body = JSON.stringify({ loginFailed: "expired" });
          statusCode = 200;
        } else if (tempPasswordResponse.failedAttempts > 4) {
          body = JSON.stringify({ loginFailed: "locked" });
          statusCode = 200;
          await dbService.deleteItem(tempPasswordKey);
        } else if (
          await bcrypt.compare(userCredentials.tempPassword, hashedTempPassword)
        ) {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(
            userCredentials.password,
            saltRounds
          );

          await userDB.updatePassword(email, hashedPassword);

          const accessToken = jwt.sign({ email: email }, ACCESS_TOKEN_SECRET, {
            expiresIn: "48h",
          });
          const refreshToken = jwt.sign({ email: email }, ACCESS_TOKEN_SECRET, {
            expiresIn: "100d",
          });
          body = JSON.stringify({
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
          statusCode = 200;
          await userDB.updateFailedAttemptsCount(email, 0);
          await dbService.deleteItem(tempPasswordKey);
        } else {
          body = JSON.stringify({ loginFailed: "incorrect" });
          statusCode = 200;
          await dbService.deleteItem(tempPasswordKey);
        }
      } else {
        body = JSON.stringify({
          loginFailed: "User did not request new password.",
        });
        statusCode = 401;
      }
    }
    callback(null, {
      statusCode: statusCode,
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
