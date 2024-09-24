const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const DbUtils = require("../databaseManager");
const tableName = process.env.ATL_PLAYER_TABLE_NAME;
const DB = DynamoDBDocument.from(new DynamoDB());
const dbService = new DbUtils(DB, tableName);
const ProcessMessages = require("./processMessages");

const EmailDB = require("../../utils/emailDB");
const emailDB = new EmailDB(dbService);
const messageProcess = new ProcessMessages(emailDB);

module.exports.handler = async (event) => {
  const messages = getEventMessages(event.Records);
  await messageProcess.process(messages);
};

function getEventMessages(records) {
  messages = [];

  records.forEach((record) => {
    const body = JSON.parse(record.body);
    messages.push(JSON.parse(body.Message));
  });

  return messages;
}
