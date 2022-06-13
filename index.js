const mongoose = require("mongoose");
const { proppatch } = require("./app");
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


    const port=process.env.PORT;

    app.listen(port||3030, function () {

      console.log("Corriendo en el puerto "+port)

    });
  })
  .catch((error) => console.log(error));

Usuarios.crearAdmin();
