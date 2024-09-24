const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { SQS } = require("@aws-sdk/client-sqs");

const DbUtils = require("../../utils/databaseManager");
const { isEmptyObject } = require("../../utils//objectUtils");

const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);

const UserDB = require("../../utils/userDB");
const userDB = new UserDB(dbService);

const bcrypt = require("bcryptjs");
const sqs = new SQS();
const queueUrl = process.env.SEND_OTP_URL;

const generator = require("generate-password");

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const userCredentials = JSON.parse(event.body);

    const email = userCredentials.email.toLowerCase();
    const tempPassword = generator.generate({
      length: 10,
      numbers: true,
    });

    const saltRounds = 10;
    const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);
    const emailKey = { PK: email, SK: email };
    const existingUser = await dbService.getItem(emailKey);
    if (existingUser && !isEmptyObject(existingUser)) {
      await createHashedPassword(email, hashedTempPassword);

      const params = {
        MessageBody: JSON.stringify({
          email: email,
          tempPassword: tempPassword,
        }),
        QueueUrl: queueUrl,
      };
      await sqs.sendMessage(params);
      await userDB.updateFailedAttemptsCount(0);
    }

    callback(null, {
      statusCode: 200,
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

async function createHashedPassword(email, hashedTempPassword) {
  const data = {
    PK: `${email}`,
    SK: `tempPassword`,
    hashedTempPassword: hashedTempPassword,
    createdAt: new Date().toJSON(),
    failedAttempts: 0,
  };

  await dbService.putItem(data);
  return { ID: data.SK };
}
