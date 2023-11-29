const oauth = require('../data/oauth');
const _ = require('lodash');
const moment = require('moment');

module.exports = function (req, res, next) {
  const key = req.method + ":" + req.path;
  const input = _.get(req.headers, 'authorization', '').split(' ')[1];

  if (key === "POST:/v1/partner/auth/token") {
    const authPair = Buffer.from(input, "base64").toString("utf8").split(':');
    const client = authPair[0];
    const secret = authPair[1];
    if (!oauth.credentials[client] || oauth.credentials[client].secret !== secret) {
      return res.status(401).send({
        "statusCode": 401,
        "error": "Unauthorized",
        "message": "Unable to authorize the request"
      })
    }
  } else {
    const tokenFound = _.find(oauth.tokens, { token: input });
    if (!tokenFound || moment(tokenFound.validThru).isBefore(moment())) {
      return res.status(401).send({
        "statusCode": 401,
        "error": "Unauthorized",
        "message": "Token Expired"
      })
    }
  }
  next();
}