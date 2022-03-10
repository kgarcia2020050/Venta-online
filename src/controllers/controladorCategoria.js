const { send } = require("express/lib/response");
const { rmSync } = require("fs");
const Categoria = require("../models/categorias");
const Productos = require("../models/productos");

function agregarCategoria(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede agregar categorias." });
  }

  var datos = req.body;
  var modelCategoria = new Categoria();

  if (datos.nombre) {
    modelCategoria.nombre = datos.nombre;
    Categoria.find(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, categoriaEncontrada) => {
        if (categoriaEncontrada == 0) {
          modelCategoria.save((error, categoriaEncontrada) => {
            if (error)
              return res.status(500).send({ Error: "Error en la peticion." });

            if (!categoriaEncontrada)
              return res
                .status(404)
                .send({ Error: "No se pudo crear la categoria." });

            Categoria.find((error, totalCategorias) => {
              if (error)
                return res.status(500).send({ Error: "Error en la peticion." });
              if (!totalCategorias)
                return res.status(404).send({
                  Error: "No se pudo obtener el total de categorias.",
                });
              return res.status(200).send({
                Nueva_categoria: categoriaEncontrada,
                Total_de_categorias: totalCategorias.length,
              });
            });
          });
        } else {
          return res.status(500).send({ Error: "Esta categoria ya existe." });
        }
      }
    );
  } else {
    return res
      .status(500)
      .send({ Error: "Debes ingresar el nombre de la nueva categoria." });
  }
}

function verCategorias(req, res) {
  Categoria.find((error, categoriasEncontradas) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!categoriasEncontradas)
      return res
        .status(404)
        .send({ Error: "No se pudo obtener el listado de categorias." });
    return res
      .status(200)
      .send({ Listado_de_categorias: categoriasEncontradas });
  });
}

function editarCategorias(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede modificar las categorias." });
  }

  var datos = req.body;

  var idCategoria = req.params.ID;

  if (datos.nombre) {
    Categoria.find(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, categoriaEncontrada) => {
        if (categoriaEncontrada.length == 0) {
          Categoria.findByIdAndUpdate(
            idCategoria,
            datos,
            { new: true },
            (error, categoriaEditada) => {
              if (error)
                return res.status(500).send({ Error: "Error en la peticion." });
              if (!categoriaEditada)
                return res.status(400).send({
                  Error: "Esta categoria no existe.",
                });
              return res
                .status(200)
                .send({ Categoria_actualizada: categoriaEditada });
            }
          );
        } else {
          return res
            .status(500)
            .send({ Error: "Ya hay una categoria con el mismo nombre." });
        }
      }
    );
  } else {
    return res.status(500).send({ Error: "No hay valores para modificar" });
  }
}

function eliminarCategoria(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede eliminar las categorias." });
  }
  const idCategoria = req.params.ID;

  Categoria.findOne(
    { nombre: { $regex: "Default", $options: "i" } },
    (err, categoriaEncontrada) => {
      if (!categoriaEncontrada) {
        const modelCategoria = new Categoria();
        modelCategoria.nombre = "Default";

        modelCategoria.save((err, categoriaGuardada) => {
          if (err)
            return res
              .status(500)
              .send({ Error: "Error en la peticion de la categoria Default." });
          if (!categoriaGuardada)
            return res
              .status(404)
              .send({ Error: "No se pudo agregar la categoria Default." });

          Productos.updateMany(
            { idCategoria: idCategoria },
            { idCategoria: categoriaGuardada._id },
            (error, categoriasEditadas) => {
              if (error)
                return res.status(500).send({
                  Error: "Error al actualizar categorias.",
                });
              if (!categoriasEditadas)
                return res.status(404).send({
                  Error:
                    " No se pudo actualizar las categorias de los productos.",
                });

              Categoria.findByIdAndDelete(
                idCategoria,
                (error, categoriaEliminada) => {
                  if (error)
                    return res.status(500).send({
                      Error: "Error en la peticion.",
                    });
                  if (!categoriaEliminada)
                    return res
                      .status(404)
                      .send({ Error: "Error al eliminar la categoria." });

                  return res.status(200).send({
                    Categoria_eliminada: categoriaEliminada,
                  });
                }
              );
            }
          );
        });
      } else {
        Productos.updateMany(
          { idCategoria: idCategoria },
          { idCategoria: categoriaEncontrada._id },
          (error, categoriasEditadas) => {
            if (error)
              return res.status(500).send({
                Error: "Error al actualizar categorias.",
              });
            if (!categoriasEditadas)
              return res.status(404).send({
                Error:
                  " No se pudo actualizar las categorias de los productos.",
              });

            Categoria.findByIdAndDelete(
              idCategoria,
              (error, categoriaEliminada) => {
                if (error)
                  return res.status(500).send({
                    Error: "Error en la peticion.",
                  });
                if (!categoriaEliminada)
                  return res
                    .status(404)
                    .send({ Error: "Error al eliminar la categoria." });

                return res.status(200).send({
                  Categoria_eliminada: categoriaEliminada,
                });
              }
            );
          }
        );
      }
    }
  );
}

function buscarCategoria(req, res) {
  var categoriaBuscada = req.body;

  Categoria.findOne(
    { nombre: { $regex: categoriaBuscada.categoria, $options: "i" } },
    (error, categoriaEncontrada) => {
      if (error)
        return res.status(500).send({ Error: "Error en la peticion." });
      if (!categoriaEncontrada)
        return res.status(500).send({ Error: "La categoria no existe." });
      return res
        .status(200)
        .send({ Categoria_encontrada: categoriaEncontrada });
    }
  );
}

module.exports = {
  agregarCategoria,
  verCategorias,
  editarCategorias,
  eliminarCategoria,
  buscarCategoria
};
