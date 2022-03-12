const Usuarios = require("../models/usuario");
const encriptar = require("bcrypt-nodejs");

function verPerfil(req, res) {
  var idPerfil = req.user.sub;

  Usuarios.findById(idPerfil, (error, informacion) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!informacion)
      return res
        .status(404)
        .send({ Error: "Tu perfil no existe." });
    return res.status(200).send({ Mi_perfil: informacion });
  });
}

function registro(req, res) {
  var datos = req.body;
  var modeloClientes = new Usuarios();
  if (datos.nombre && datos.usuario && datos.password) {
    modeloClientes.nombre = datos.nombre;
    modeloClientes.usuario = datos.usuario;
    modeloClientes.rol = "Cliente";

    Usuarios.find(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, usuarioEncontrado) => {
        if (usuarioEncontrado.length == 0) {
          encriptar.hash(
            datos.password,
            null,
            null,
            (error, claveEncriptada) => {
              modeloClientes.password = claveEncriptada;
              modeloClientes.save((error, usuarioGuardado) => {
                if (error)
                  return res
                    .status(500)
                    .send({ Error: "Error en la peticion." });
                if (!usuarioGuardado)
                  return res.status(404).send({
                    Error: "No se te pudiste añadir al sistema.",
                  });
                return res.status(200).send({ Tus_datos: usuarioGuardado });
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
      Error: "Debes llenar los campos solicitados.(Nombre, usuario y password)",
    });
  }
}

function cambiarClave(req, res) {

  var datos = req.body;

  if(datos.nombre||datos.usuario){
    return res.status(500).send({Error:"Estos valores no pueden ser modificados desde aqui. (Nombre y usuario)"})
  }

  if(req.user.rol=="Cliente"&&datos.rol){
    return res.status(500).send({Error:"No puedes modificar tu rol."})
  }

  if (datos.password) {
    Usuarios.findByIdAndUpdate(
      { _id: req.user.sub },
      datos,
      { new: true },
      (error, datoEditado) => {
        encriptar.hash(datos.password, null, null, (error, claveEncriptada) => {
          datoEditado.password = claveEncriptada;

          Usuarios.findByIdAndUpdate(
            req.user.sub,
            datoEditado,
            { new: true },
            (error, perfilEditado) => {
              if (error)
                return res.status(500).send({ Error: "Error en la peticion." });
              if (!perfilEditado)
                return res.status(400).send({
                  Error: "Tu perfil no existe.",
                });
              return res
                .status(200)
                .send({ Mensaje: "Clave cambiada con exito." });
            }
          );
        });
      }
    );
  } else {
    return res.status(500).send({ Error: "Ingresa tu nueva password." });
  }
}

function editarPerfil(req, res) {
  var datos = req.body;


  if(datos.password){
    return res.status(500).send({Error:"Estos valores no pueden ser modificados desde aqui."})
  } 

  if(req.user.rol=="Cliente"&&datos.rol){
    return res.status(500).send({Error:"No puedes modificar tu rol."})
  }


  if (datos.nombre && datos.usuario) {
    Usuarios.findByIdAndUpdate(
      { _id: req.user.sub },
      datos,
      { new: true },
      (error, nuevosDatos) => {
        if (error)
          return res.status(500).send({ Error: "Error en la peticion." });
        if (!nuevosDatos)
          return res
            .status(500)
            .send({ Error: "Tu perfil no existe." });
        return res.status(200).send({ Nuevos_datos: nuevosDatos });
      }
    );
  } else {
    return res.status(500).send({
      Error: "Debes llenar los campos solicitados. (Nombre y usuario)",
    });
  }
}

function eliminarPerfil(req, res) {
  var idPerfil = req.user.sub;

  Usuarios.findByIdAndDelete(idPerfil, (error, perfilEliminado) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!perfilEliminado)
      return res.status(500).send({ Error: "Tu perfil no existe." });
    return res.status(200).send({ Perfil_eliminado: perfilEliminado });
  });
}

module.exports = {
  registro,
  editarPerfil,
  eliminarPerfil,
  verPerfil,
  cambiarClave,
};
