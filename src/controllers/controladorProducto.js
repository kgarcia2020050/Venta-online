const Productos = require("../models/productos");
const Categorias = require("../models/categorias");

function verProductos(req, res) {
  Productos.find((error, listadoProductos) => {
    if (error) return res.status(500).send({ Error: "Error en la peticion." });
    if (!listadoProductos) return res.status({ Error: "No hay productos." });
    return res.status(200).send({
      Lista_de_productos: listadoProductos,
      Cantidad_de_productos: listadoProductos.length,
    });
  }).populate("idCategoria", "nombre");
}

function agregarProductos(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede agregar nuevos productos." });
  }
  var datos = req.body;
  if (datos.nombre && datos.cantidad && datos.precio && datos.categoria) {
    Productos.find({ nombre: { $regex: datos.nombre, $options: "i" } }).exec(
      (error, productoEncontrado) => {
        if (productoEncontrado.length != 0)
          return res.status(500).send({
            Error: "Este producto ya existe.",
          });

        Categorias.findOne(
          { nombre: { $regex: datos.categoria, $options: "i" } },
          (error, categoriaEncontrada) => {
            if (error)
              return res
                .status(500)
                .send({ Error: "Error al obtener las categorias." });
            if (!categoriaEncontrada)
              return res
                .status(500)
                .send({ Error: "Esta categoria no existe." });

            var modeloProductos = new Productos();
            modeloProductos.nombre = datos.nombre;
            modeloProductos.cantidad = datos.cantidad;
            modeloProductos.precio = datos.precio;
            modeloProductos.idCategoria = categoriaEncontrada._id;
            modeloProductos.ventas = 0;

            modeloProductos.save((error, productoGuardado) => {
              if (error)
                return res.status(500).send({
                  Error: "Error al guardar el producto.",
                });
              if (!productoGuardado)
                return res
                  .status(404)
                  .send({ Error: "No se pudo guardar el producto." });
              Productos.find(
                { idCategoria: categoriaEncontrada._id },
                (error, cantidad) => {
                  if (error)
                    return res
                      .status(500)
                      .send({ Error: "Error en la peticion." });
                  if (!cantidad)
                    return res.status(500).send({
                      Error: "No se pudo obtener el total de productos.",
                    });
                  return res.status(200).send({
                    Producto_nuevo: productoGuardado,
                    Total_de_productos_de_esta_categoria: cantidad.length,
                  });
                }
              );
            });
          }
        );
      }
    );
  } else {
    return res
      .status(500)
      .send({ Error: "Debes llenar los datos obigatorios." });
  }
}

function editarProductos(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error:
        "Solo el administrador puede modificar la informacion de los productos.",
    });
  }

  var idProducto = req.params.ID;
  var datos = req.body;
  if (datos.nombre && datos.precio) {
    Productos.find(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, productoEncontrado) => {
        if (productoEncontrado.length == 0) {
          Productos.findByIdAndUpdate(
            idProducto,
            datos,
            { new: true },
            (error, productoActualizado) => {
              if (error)
                return res.status(500).send({ Error: "Error en la peticion." });
              if (!productoActualizado)
                return res.status(400).send({
                  Error: "Este producto no existe.",
                });
              return res
                .status(200)
                .send({ Producto_actualizado: productoActualizado });
            }
          );
        } else {
          return res
            .status(500)
            .send({ Error: "Ya existe un producto con el mismo nombre." });
        }
      }
    );
  } else {
    return res.status(500).send({
      Error: "Debes llenar los campos obligatorios. (Nombre y precio)",
    });
  }
}

function cambiarCategoria(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error: "Solo el administrador puede cambiar la categoria de un producto.",
    });
  }

  var idProducto = req.params.ID;

  var nuevaCategoria = req.body;

  if (nuevaCategoria.categoria) {
    Categorias.findOne(
      { nombre: { $regex: nuevaCategoria.categoria, $options: "i" } },
      (error, categoriaEncontrada) => {
        if (error)
          return res
            .status(500)
            .send({ Error: "Error al obtener las categorias." });
        if (!categoriaEncontrada)
          return res.status(500).send({ Error: "Esta categoria no existe." });

        Productos.findById(
          idProducto,
          { new: true },
          (error, productoEncontrado) => {
            if (error)
              return res.status(500).send({ Error: "Error en la peticion." });
            if (!productoEncontrado)
              return res
                .status(404)
                .send({ Error: "Este producto no existe." });

            productoEncontrado.idCategoria = categoriaEncontrada._id;

            Productos.findByIdAndUpdate(
              idProducto,
              productoEncontrado,
              { new: true },
              (error, productoModificado) => {
                if (error)
                  return res
                    .status(500)
                    .send({ Error: "Error en la peticion" });
                if (!productoModificado)
                  return res.status(400).send({
                    Error: "Error al editar la categoria del producto.",
                  });

                return res
                  .status(200)
                  .send({ Producto_modificado: productoModificado });
              }
            );
          }
        );
      }
    );
  } else {
    return res
      .status(500)
      .send({ Error: "Ingresa la categoria para el producto." });
  }
}

function modificarInventario(req, res) {
  if (req.user.rol == "Cliente") {
    return res.status(500).send({
      Error:
        "Solo el administrador puede modificar el inventario de un producto.",
    });
  }

  var inventario = req.body;

  var idProducto = req.params.ID;
  if (inventario.cantidad) {
    Productos.findByIdAndUpdate(
      idProducto,
      { $inc: { cantidad: inventario } },
      { new: true },
      (error, productoModificado) => {
        if (error)
          return res.status(500).send({ Error: "Este producto no existe." });
        if (!productoModificado)
          return res
            .status(400)
            .send({ Error: "Error al editar la cantidad del producto." });

        return res
          .status(200)
          .send({ Producto_modificado: productoModificado });
      }
    );
  } else {
    return res.status(500).send({
      Error:
        "Ingresa la cantidad de productos que quieres agregar (+) o disminuir (-)",
    });
  }
}

function buscarProducto(req, res) {
  var dato = req.body;

  if (dato.nombre == null) {
    return res.status(500).send({
      Error: "Debes ingresar el nombre del producto que quieres buscar.",
    });
  }

  Productos.findOne(
    { nombre: { $regex: dato.nombre, $options: "i" } },
    (error, productoEncontrado) => {
      if (error)
        return res.status(500).send({ Error: "Error en la peticion." });

      if (!productoEncontrado)
        return res.status(500).send({ Error: "Este producto no existe." });

      return res.status(200).send({ Producto_buscado: productoEncontrado });
    }
  );
}

function eliminarProducto(req, res) {
  var idProducto = req.params.ID;

  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({ Error: "Solo el administrador puede eliminar los productos." });
  }

  Productos.findByIdAndDelete(idProducto, (error, productoEliminado) => {
    if (error)
      return res.status(500).send({ Error: "Este producto no existe." });
    if (!productoEliminado)
      return res
        .status(404)
        .send({ Error: "No se pudo eliminar al producto." });
    return res.status(200).send({ Producto_eliminado: productoEliminado });
  });
}

module.exports = {
  agregarProductos,
  editarProductos,
  verProductos,
  buscarProducto,
  eliminarProducto,
  modificarInventario,
  cambiarCategoria,
};
