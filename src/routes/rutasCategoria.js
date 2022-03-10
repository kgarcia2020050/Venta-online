const express = require("express");
const controlador = require("../controllers/controladorCategoria");

const md_autenticacion=require("../middlewares/autenticacion");

var api = express.Router();
api.get("/verCategorias",md_autenticacion.Auth,controlador.verCategorias)
api.post("/agregarCategorias",md_autenticacion.Auth,controlador.agregarCategoria)
api.put("/editarCategoria/:ID",md_autenticacion.Auth,controlador.editarCategorias)
api.delete("/eliminarCategorias/:ID",md_autenticacion.Auth,controlador.eliminarCategoria)
api.get("/buscarCategoria",md_autenticacion.Auth,controlador.buscarCategoria)

module.exports = api;