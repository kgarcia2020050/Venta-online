const express = require("express");
const controlador = require("../controllers/controladorProducto");

const md_autenticacion=require("../middlewares/autenticacion");

var api = express.Router();
api.get("/verProductos",md_autenticacion.Auth,controlador.verProductos)
api.post("/agregarProducto",md_autenticacion.Auth,controlador.agregarProductos)
api.put("/editarProducto/:ID",md_autenticacion.Auth,controlador.editarProductos)
api.get("/buscarProducto",md_autenticacion.Auth,controlador.buscarProducto)
api.delete("/borrarProducto/:ID",md_autenticacion.Auth,controlador.eliminarProducto)
api.put("/modificarInventario/:ID",md_autenticacion.Auth,controlador.modificarInventario)
api.put("/cambiarCategoria/:ID",md_autenticacion.Auth,controlador.cambiarCategoria)

api.get("/masVendidos",md_autenticacion.Auth,controlador.masVendidos)
api.get("/agotados",md_autenticacion.Auth,controlador.productosAgotados)
module.exports = api; 