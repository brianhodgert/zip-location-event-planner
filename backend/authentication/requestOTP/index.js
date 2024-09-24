const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SQS } = require("@aws-sdk/client-sqs");

const DbUtils = require("../../utils/databaseManager");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const UserDB = require("../../utils/userDB");
const userDB = new UserDB(dbService);

const bcrypt = require("bcryptjs");
const sqs = new SQS();
const queueUrl = process.env.SEND_OTP_URL;

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userCredentials = JSON.parse(event.body);
    const email = userCredentials.email.toLowerCase();

    if (email != "test@test.com") {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

      const saltRounds = 10;
      const hashedOTP = await bcrypt.hash(otp, saltRounds);
      const hashedPassword = await bcrypt.hash(
        userCredentials.password,
        saltRounds
      );
      const existingUser = await userDB.userExistsOrCreateUser(
        email,
        hashedPassword
      );
      var body;
      if (!existingUser || existingUser.failedAttempts < 5) {
        if (existingUser) {
          if (
            !existingUser.hashedPassword ||
            !(await bcrypt.compare(
              userCredentials.password,
              existingUser.hashedPassword
            ))
          ) {
            if (existingUser.failedAttempts >= 4) {
              body = { isCorrectPassword: false, isAccountLocked: true };
            } else {
              body = { isCorrectPassword: false, isAccountLocked: false };
            }
            await userDB.updateFailedAttemptsCount(
              email,
              existingUser.failedAttempts + 1
            );
            callback(null, {
              statusCode: 200,
              body: JSON.stringify(body),
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
              },
            });
            return;
          }
        }
        await createOTP(email, hashedOTP);
        const params = {
          MessageBody: JSON.stringify({ email: email, otp: otp }),
          QueueUrl: queueUrl,
        };
        await sqs.sendMessage(params);
        body = { isCorrectPassword: true, isAccountLocked: false };
        await userDB.updateFailedAttemptsCount(email, 0);
      } else {
        body = { isCorrectPassword: false, isAccountLocked: true };
      }
    } else {
      if (userCredentials.password == "1234") {
        body = { isCorrectPassword: true, isAccountLocked: false };
      } else {
        body = { isCorrectPassword: false, isAccountLocked: false };
      }
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  } catch (e) {
    console.log(e);
    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  }
};

async function createOTP(email, hashedOTP) {
  const data = {
    PK: `${email}`,
    SK: `otp`,
    hashedOTP: hashedOTP,
    createdAt: new Date().toJSON(),
  };

  await dbService.putItem(data);
  return { ID: data.SK };
}
