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

      if (email != "test@test.com") {
        const otpKey = { PK: email, SK: "otp" };
        const otpResponse = await dbService.getItem(otpKey);
        const emailKey = { PK: email, SK: email };
        const existingUser = await dbService.getItem(emailKey);

        if (
          existingUser &&
          !isEmptyObject(existingUser) &&
          existingUser.failedAttempts > 5
        ) {
          body = JSON.stringify({ loginFailed: "locked" });
          statusCode = 200;
        } else if (
          existingUser &&
          otpResponse &&
          !isEmptyObject(otpResponse) &&
          !isEmptyObject(existingUser)
        ) {
          const hashedPassword = otpResponse.hashedOTP;
          const creationTime = new Date(otpResponse.createdAt);

          if (new Date() - creationTime > FIVE_MINUTES) {
            body = JSON.stringify({ loginFailed: "expired" });
            statusCode = 200;
          } else if (
            await bcrypt.compare(userCredentials.otp, hashedPassword)
          ) {
            token = { email: email };
            const profileKey = { PK: `${email}-profile`, SK: email };
            const existingProfile = await dbService.getItem(profileKey);
            if (existingProfile?.playerID) {
              token[playerID] = existingUser.playerID;
            }
            const accessToken = jwt.sign(token, ACCESS_TOKEN_SECRET, {
              expiresIn: "48h",
            });
            const refreshToken = jwt.sign(token, ACCESS_TOKEN_SECRET, {
              expiresIn: "100d",
            });
            body = JSON.stringify({
              accessToken: accessToken,
              refreshToken: refreshToken,
            });
            statusCode = 200;
            await userDB.updateFailedAttemptsCount(email, 0);
            await dbService.putItem({
              PK: `${email}`,
              SK: `otp`,
            });
          } else {
            body = JSON.stringify({ loginFailed: "incorrectOTP" });
            statusCode = 200;
            await userDB.updateFailedAttemptsCount(
              email,
              existingUser.failedAttempts + 1
            );
          }
        } else {
          body = JSON.stringify({ loginFailed: "User does not exist." });
          statusCode = 401;
        }
      } else {
        //test user logic
        if (userCredentials.otp == "1234") {
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
        } else {
          body = JSON.stringify({ loginFailed: "incorrectOTP" });
          statusCode = 200;
        }
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
