const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FacturasSchema = new Schema({
  idUsuario: { type: Schema.Types.ObjectId, ref: "Usuarios" },
  nombreUsuario: { type: Schema.Types.String, ref: "Usuarios" },
  listado: [
    {
      nombreProducto: String,
      cantidadProducto: Number,
      precioProducto: Number,
      totalProducto:Number
    },
  ],
  precioTotal: Number,
});

module.exports = mongoose.model("Facturas", FacturasSchema);
