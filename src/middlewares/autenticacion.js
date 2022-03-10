const jwt_simple = require("jwt-simple");
const moment = require("moment");
const secret = "clave_secreta";

exports.Auth = function (req, res, next) {
  if (!req.headers.authorization) {
    return res
      .status(404)
      .send({ Mensaje: "No posee la cabecera de la autenticacion" });
  }

  var token = req.headers.authorization.replace(/['']+/g, "");

  try {
    var payload = jwt_simple.decode(token, secret);

    if (payload.exp <= moment().unix()) {
      return res.status(404).send({ Mensaje: "El token ya expiro" });
    }
  } catch (error) {
    return res.status(500).send({ Mensaje: "El token no es valido" });
  }

  req.user = payload;
  next();
};
