const jwt = require("jsonwebtoken");

module.exports = (context) => {
  let token;

  if (context?.req && context?.req.headers.authorization) {
    token = context.req.headers.authorization;
  } else if (context.connection && context.connection.context.Authorization) {
    token = context.connection.context.Authorization.split("Bearer ")[1];
  }

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
      context.user = decode;
    });
  }

  return context;
};
