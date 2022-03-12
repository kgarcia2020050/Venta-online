const express = require("express");
const controlador = require("../controllers/controladorFactura");

const md_autenticacion=require("../middlewares/autenticacion");

var api = express.Router();
api.post("/agregarAlCarro",md_autenticacion.Auth,controlador.agregarAlCarrito)
api.post("/comprar",md_autenticacion.Auth,controlador.generarFactura)
api.get("/verFacturas",md_autenticacion.Auth,controlador.verFacturas)
api.get("/facturasUsuario/:ID",md_autenticacion.Auth,controlador.verFacturasUsuario)
api.get("/productosFactura/:ID",md_autenticacion.Auth,controlador.verProductosDeUnaFactura)

module.exports = api;