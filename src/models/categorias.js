const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CategoriasSchema = new Schema({
  nombre: String,
});

module.exports = mongoose.model("Categorias", CategoriasSchema);
