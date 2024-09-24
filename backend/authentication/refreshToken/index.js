const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../../utils/authenticateToken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const user = authenticateToken(event.headers);

  if (!user?.email) {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify("Unauthorized"),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    });
  }
  token = { email: email };
  if (user.playerID) {
    token[playerID] = user.playerID;
  }

  const accessToken = jwt.sign(token, ACCESS_TOKEN_SECRET, {
    expiresIn: "48h",
  });

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ accessToken: accessToken }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  });
};
