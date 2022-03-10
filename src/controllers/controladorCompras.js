const Facturas = require("../models/facturas");
const Usuarios = require("../models/usuario");
const Productos = require("../models/productos");
const PDF = require("../PDF/TablasPdf");
const { ignore } = require("nodemon/lib/rules");
const { send } = require("express/lib/response");

function agregarAlCarrito(req, res) {
  const datos = req.body;

  if (datos.nombreProducto && datos.cantidadProducto) {
    Productos.findOne(
      { nombre: datos.nombreProducto },
      (err, productoEncontrado) => {
        if (err)
          return res.status(500).send({ Error: "Error en la peticion." });
        if (!productoEncontrado)
          return res.status(404).send({ Error: "Este producto no existe." });

        if (productoEncontrado.cantidad < datos.cantidad) {
          return res
            .status(500)
            .send({ Error: "No hay suficiente inventario de este producto." });
        }

        Usuarios.findOne(
          { _id: req.user.sub },
          {
            carrito: {
              $elemMatch: {
                nombreProducto: datos.nombreProducto,
              },
            },
          },
          (error, productoExistente) => {
            if (error)
              return res.status(500).send({ Error: "Error en la peticion." });
            if (productoExistente == null) {
              Usuarios.findByIdAndUpdate(
                { _id: req.user.sub },
                {
                  $push: {
                    carrito: {
                      nombreProducto: datos.nombreProducto,
                      cantidadProducto: datos.cantidad,
                      precioProducto: productoEncontrado.precio,
                      totalProducto: datos.cantidad * productoEncontrado.precio,
                    },
                  },
                },
                { new: true },
                (error, carritoActualizado) => {
                  if (error)
                    return res
                      .status(500)
                      .send({ Error: "Error en la peticion." });
                  if (!carritoActualizado)
                    return res.status(500).send({
                      Error: "Error al cargar el producto.",
                    });

                  Productos.findOneAndUpdate(
                    { nombre: datos.nombreProducto },
                    { $inc: { cantidad: datos.cantidad * -1 } },
                    { new: true },
                    (error, productoActualizado) => {
                      if (error)
                        return res.status(500).send({
                          Error: "Error al modificar la cantidad del producto.",
                        });
                      if (!productoActualizado)
                        return res.status(500).send({
                          Error:
                            "No se pudo modificar la cantidad del producto.",
                        });
                      var cantidad;
                      var totalCarrito;

                      for (
                        let i = 0;
                        i < carritoActualizado.carrito.length;
                        i++
                      ) {
                        cantidad =
                          cantidad +
                          carritoActualizado.carrito[i].cantidadProducto;
                        totalCarrito =
                          totalCarrito +
                          carritoActualizado.carrito[i].precioProducto *
                            cantidad;
                      }

                      Usuarios.findByIdAndUpdate(
                        { _id: req.user.sub },
                        { precioTotal: totalCarrito },
                        { new: true },
                        (error, totalActualizado) => {
                          if (err)
                            return res.status(500).send({
                              Error: "Error en la peticion.",
                            });
                          if (!totalActualizado)
                            return res.status(500).send({
                              Error: "Error al establecer el precio total.",
                            });

                          return res.status(200).send({
                            Mi_carrito: carritoActualizado,
                            Total_a_pagar: totalActualizado,
                          });
                        }
                      );
                    }
                  );
                }
              );
            } else {
              Productos.findOneAndUpdate({nombre:datos.nombreProducto},
                { $inc: { cantidad: datos.cantidad * -1 } },
                {new:true},
                (error,productoActualizado)=>{
                  if(error)return res.status(500).send({Error:"Error al modificar la cantidad del producto."})
                  if(!productoActualizado)return res.status(500).send({Error:"No se pudo modificar la cantidad del producto."})

                }
                )
              Usuarios.findByIdAndUpdate({ _id: req.user.sub },{$push:{carrito:{
                
              }}});
            }
          }
        );
      }
    );
  } else {
    return res.status(500).send({
      Error: "Ingresa el nombre del producto y la cantidad que deseas.",
    });
  }
}
