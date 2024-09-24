const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const jwt = require("jsonwebtoken");

function authenticateToken(headers) {
  const authHeader = headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return null;

  var authorizedUser;
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      authorizedUser = null;
    } else {
      authorizedUser = user;
    }
  });
  return authorizedUser;
}
module.exports.authenticateToken = authenticateToken;
