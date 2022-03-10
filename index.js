const mongoose = require("mongoose");
const app = require("./app");
const Usuarios = require("./src/controllers/controladorUsuario");

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/VentaOnline", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexion exitosa.");

    app.listen(3030, function () {});
  })
  .catch((error) => console.log(error));

Usuarios.crearAdmin();
