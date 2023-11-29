const schema = require('../include/schema');

module.exports = function (req, res, next) {
  const key = req.method + ":" + req.path;
  if (schema[key]) {
    const { error, value } = schema[key].validate(req.body);
    if (error) {
      return res.status(422).send({
        "statusCode": 422,
        "error": error.name,
        "message": error.details[0].message
      })
    }
  }
  next();
}