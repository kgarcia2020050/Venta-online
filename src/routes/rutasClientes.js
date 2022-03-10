const express = require("express");
const controlador = require("../controllers/controladorCliente");

const md_autenticacion=require("../middlewares/autenticacion");

var api = express.Router();
api.post("/registro",controlador.registro)
api.put("/editarPerfil",md_autenticacion.Auth,controlador.editarPerfil)
api.delete("/eliminarPerfil",md_autenticacion.Auth,controlador.eliminarPerfil)
api.get("/verPerfil",md_autenticacion.Auth,controlador.verPerfil)
api.put("/cambiarClave",md_autenticacion.Auth,controlador.cambiarClave)
module.exports = api; 