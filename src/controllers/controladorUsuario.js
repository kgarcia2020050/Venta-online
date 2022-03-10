const Usuarios = require("../models/usuario");

const encriptar = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const cli = require("nodemon/lib/cli");
const { rmSync } = require("fs");

function crearAdmin() {
  var modeloUsuarios = new Usuarios();
  Usuarios.find({ rol: "Admin" }, (error, admin) => {
    if (admin.length == 0) {
      modeloUsuarios.nombre = "Kenneth";
      modeloUsuarios.usuario = "ADMIN";
      modeloUsuarios.rol = "Admin";
      clave = "123456";

      encriptar.hash(clave, null, null, (error, encripada) => {
        modeloUsuarios.password = encripada;
        modeloUsuarios.save((error, admin) => {
          if (error) console.log("Error en la peticion.");
          if (!admin) console.log("No se pudo crear al administrador.");
          console.log("Administrador: " + admin);
        });
      });
    } else {
      console.log("Los datos del administrador son " + admin);
    }
  });
}

function Login(req, res) {
  var datos = req.body;
  Usuarios.findOne({ usuario: datos.usuario }, (error, usuarioEncontrado) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (usuarioEncontrado) {
      encriptar.compare(
        datos.password,
        usuarioEncontrado.password,
        (error, verificacionDePassword) => {
          if (verificacionDePassword) {
            if (datos.obtenerToken === "true") {
              return res
                .status(200)
                .send({ token: jwt.crearToken(usuarioEncontrado) });
            } else {
              usuarioEncontrado.password = undefined;
              return res.status(500).send({ Usuario: usuarioEncontrado });
            }
          } else {
            return res.status(500).send({ Error: "La clave no coincide." });
          }
        }
      );
    } else {
      return res.status(500).send({ Error: "Los datos de inicio no existen." });
    }
  });
}

function registrarUsuarios(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede añadir a mas usuarios." });
  }

  var datos = req.body;

  var modeloUsuarios = new Usuarios();

  if (datos.nombre && datos.usuario && datos.password && datos.rol) {
    modeloUsuarios.nombre = datos.nombre;
    modeloUsuarios.usuario = datos.usuario;
    modeloUsuarios.rol = datos.rol;

    Usuarios.find(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, usuarioEncontrado) => {
        if (usuarioEncontrado == 0) {
          encriptar.hash(
            datos.password,
            null,
            null,
            (error, claveEncriptada) => {
              modeloUsuarios.password = claveEncriptada;
              modeloUsuarios.save((error, clienteNuevo) => {
                if (error)
                  return res
                    .status(500)
                    .send({ Error: "Error en la peticion." });
                if (!clienteNuevo)
                  return res
                    .status(404)
                    .send({ Error: "No se pudo agregar al usuario." });
                return res.status(200).send({ Tus_datos: clienteNuevo });
              });
            }
          );
        } else {
          return res
            .status(500)
            .send({ Error: "Ya existe un usuario con el mismo nombre." });
        }
      }
    );
  } else {
    return res.status(500).send({
      Error:
        "Debes llenar los campos obligatorios. (Nombre, usuario, password y rol)",
    });
  }
}

function cambiarPasswordUsuarios(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error: "Solo el administrador puede editar la clave de otros clientes.",
    });
  }

  var idCliente = req.params.ID;

  var datos = req.body;

  Usuarios.findById(idCliente, (error, clienteEncontrado) => {
    if (clienteEncontrado == null) {
      return res.status(500).send({ Error: "Este cliente no existe." });
    } else if (clienteEncontrado.rol == "Admin") {
      return res
        .status(500)
        .send({ Error: "No puedes modificar la clave de otro administrador." });
    } else {
      if (datos.password) {
        Usuarios.findByIdAndUpdate(
          idCliente,
          datos,
          { new: true },
          (error, datoEditado) => {
            encriptar.hash(
              datos.password,
              null,
              null,
              (error, claveEncriptada) => {
                if (error)
                  return res
                    .status(500)
                    .send({ Error: "Error en la peticion." });
                if (!datoEditado)
                  return res.status(404).send({
                    Error:
                      "Este cliente no se encuentra. \nRevise si el cliente se encuentra registrado o si el cliente fue promovido a administrador. En ese caso no podra modificar su clave.",
                  });
                datoEditado.password = claveEncriptada;

                Usuarios.findByIdAndUpdate(
                  idCliente,
                  datoEditado,
                  { new: true },
                  (error, perfilEditado) => {
                    if (error)
                      return res
                        .status(500)
                        .send({ Error: "Error en la peticion." });
                    if (!perfilEditado)
                      return res.status(400).send({
                        Error:
                          "Este cliente no se encuentra. \nRevise si el cliente se encuentra registrado o si el cliente fue promovido a administrador. En ese caso no podra modificar su clave.",
                      });
                    return res
                      .status(200)
                      .send({ Mensaje: "Clave modificada con exito." });
                  }
                );
              }
            );
          }
        );
      } else {
        return res.status(500).send({ Error: "Ingresa la nueva password." });
      }
    }
  });
}

function editarRolUsuario(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error: "Solo el administrador puede modificar el rol de otros clientes.",
    });
  }

  var datos = req.body;
  var idCliente = req.params.ID;

  Usuarios.findById(idCliente, (error, clienteEncontrado) => {
    if (clienteEncontrado == null) {
      return res.status(500).send({ Error: "Este cliente no existe." });
    } else if (clienteEncontrado.rol == "Admin") {
      return res
        .status(500)
        .send({ Error: "No puedes editar el rol de otro administrador." });
    } else {
      if (datos.rol) {
        Usuarios.findByIdAndUpdate(
          idCliente,
          datos,
          { new: true },
          (error, rolCambiado) => {
            if (error)
              return res.status(500).send({ Error: "Error en la peticion." });
            if (!rolCambiado)
              return res.status(404).send({
                Error:
                  "Este cliente no se encuentra. \nRevise si el cliente se encuentra registrado o si el cliente fue promovido a administrador. En ese caso no podra modificar su rol.",
              });
            return res.status(200).send({ Rol_actualizado: rolCambiado });
          }
        );
      } else {
        return res
          .status(500)
          .send({ Error: "Ingrese el rol que desea establecer al cliente." });
      }
    }
  });
}

function editarUsuario(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede editar a otros clientes." });
  }

  var datos = req.body;

  var idCliente = req.params.ID;

  if (datos.password || datos.rol) {
    return res
      .status(500)
      .send({ Error: "Estos datos no pueden ser modificados desde aqui." });
  }

  Usuarios.findById(idCliente, (error, clienteEncontrado) => {
    if (clienteEncontrado == null) {
      return res.status(500).send({ Error: "Este cliente no existe." });
    } else if (clienteEncontrado.rol == "Admin") {
      return res.status(500).send({
        Error: "No puedes modificar la informacion de otros administradores.",
      });
    } else {
      if (datos.nombre && datos.usuario) {
        Usuarios.find(
          { nombre: { $regex: datos.nombre, $options: "i" } },
          (error, usuarioEncontrado) => {
            if (usuarioEncontrado.length == 0) {
              Usuarios.findByIdAndUpdate(
                idCliente,
                datos,
                { new: true },
                (error, usuarioActualizado) => {
                  if (error)
                    return res
                      .status(500)
                      .send({ Error: "Error en la peticion." });
                  if (!usuarioActualizado)
                    return res.status(404).send({
                      Error:
                        "Este cliente no se encuentra. \nRevise si el cliente se encuentra registrado o si el cliente fue promovido a administrador. En ese caso no podra modificar su informacion.",
                    });
                  return res
                    .status(200)
                    .send({ Datos_actualizados: usuarioActualizado });
                }
              );
            } else {
              return res
                .status(500)
                .send({ Error: "Ya existe un usuario con el mismo nombre." });
            }
          }
        );
      } else {
        return res.status(500).send({
          Error: "Ingrese los campos obligatorios. (Nombre y usuario)",
        });
      }
    }
  });
}

function verClientes(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error: "Solo el administrador puede visualizar a los otros clientes.",
    });
  }

  Usuarios.find({ rol: "Cliente" }, (error, listadoClientes) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!listadoClientes)
      return res.status(500).send({ Error: "No hay clientes registrados." });
    return res.status(200).send({ Lista_de_clientes: listadoClientes });
  });
}

function verAdministradores(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error: "Solo los administradores pueden ver al resto de administradores.",
    });
  }

  Usuarios.find({ rol: "Admin" }, (error, listadoAdmins) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!listadoAdmins)
      return res.status(404).send({ Error: "No hay administradores." });
    return res.status(200).send({ Administradores: listadoAdmins });
  });
}

module.exports = {
  crearAdmin,
  Login,
  registrarUsuarios,
  cambiarPasswordUsuarios,
  editarRolUsuario,
  editarUsuario,
  verClientes,
  verAdministradores,
};
