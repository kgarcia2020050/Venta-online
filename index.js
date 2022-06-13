const mongoose = require("mongoose");
const { proppatch } = require("./app");
const app = require("./app");
const Usuarios = require("./src/controllers/controladorUsuario");

mongoose.Promise = global.Promise;
mongoose
  .connect(
    "mongodb+srv://takeru:ellanomeama@cluster0.ppw9e.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Conexion exitosa.");

    const port = process.env.PORT;

    app.listen(port || 3030, function () {
      return console.log("Corriendo en el puerto " + port);
    });
  })
  .catch((error) => console.log(error));

app.get("/", function (req, res) {
  return res.status(200).send("Hola mundo");
});

Usuarios.crearAdmin();
