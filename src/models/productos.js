const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductosSchema = new Schema({
  nombre: String,
  cantidad: Number,
  precio: Number,
  ventas:Number,
  idCategoria: { type: Schema.Types.ObjectId, ref: "Categorias" },
});

module.exports = mongoose.model("Productos", ProductosSchema);
