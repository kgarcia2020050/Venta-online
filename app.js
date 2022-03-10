const express = require("express");
const cors = require("cors");
var app = express();

const rutaCategorias=require("./src/routes/rutasCategoria")
const rutasUsuarios=require("./src/routes/rutasUsuario")
const rutasProductos=require("./src/routes/rutasProductos")
const rutasClientes=require("./src/routes/rutasClientes")
 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());
app.use("/api",rutaCategorias,rutasUsuarios,rutasProductos,rutasClientes)
module.exports = app;
