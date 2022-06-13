const express = require("express");
const controlador = require("../controllers/controladorUsuario");

const md_autenticacion=require("../middlewares/autenticacion");

var api = express.Router();
api.post("/login",controlador.Login)
api.post("/registroAdmin",md_autenticacion.Auth,controlador.registrarUsuarios)
api.get("/verClientes",md_autenticacion.Auth,controlador.verClientes)
api.get("/verAdmins",md_autenticacion.Auth,controlador.verAdministradores)
api.put("/editarUsuario/:ID",md_autenticacion.Auth,controlador.editarUsuario)
api.put("/editarRol/:ID",md_autenticacion.Auth,controlador.editarRolUsuario)
api.put("/editarPassword/:ID",md_autenticacion.Auth,controlador.cambiarPasswordUsuarios)


api.get("/",function(req,res){
    console.log("Hola mundo")
})


module.exports = api; 