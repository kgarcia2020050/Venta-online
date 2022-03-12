const Facturas = require("../models/facturas");
const Usuarios = require("../models/usuario");
const Productos = require("../models/productos");
const PDFDocument = require("../PDF/TablasPdf");
const { ignore } = require("nodemon/lib/rules");
const { send } = require("express/lib/response");
const fs = require("fs");
const { list } = require("pdfkit");

function agregarAlCarrito(req, res) {
  const datos = req.body;

  if (datos.nombre && datos.cantidad) {
    Productos.findOne(
      { nombre: { $regex: datos.nombre, $options: "i" } },
      (error, productoEncontrado) => {
        if (error)
          return res.status(500).send({
            Error: "Error en la peticion de buscar el producto a agregar.",
          });
        if (!productoEncontrado)
          return res.status(404).send({ Error: "Este producto no existe." });

        if (productoEncontrado.cantidad < datos.cantidad) {
          return res
            .status(500)
            .send({ Error: "No hay suficiente inventario de este producto." });
        } else {
          Usuarios.findOne(
            { _id: req.user.sub },
            { carrito: { $elemMatch: { nombreProducto: datos.nombre } } },
            (error, productoExistente) => {
              if (error)
                return res.status(500).send({
                  Error: "Error al buscar el producto en mi carrito.",
                });
              if (productoExistente.carrito == "") {
                Usuarios.findByIdAndUpdate(
                  { _id: req.user.sub },
                  {
                    $push: {
                      carrito: {
                        nombreProducto: productoEncontrado.nombre,
                        cantidadProducto: datos.cantidad,
                        precioProducto: productoEncontrado.precio,
                        totalProducto:
                          datos.cantidad * productoEncontrado.precio,
                      },
                    },
                  },
                  { new: true },
                  (error, carritoActualizado) => {
                    if (error)
                      return res.status(500).send({
                        Error:
                          "Error en la peticion de agregar productos al carrito.",
                      });
                    if (!carritoActualizado)
                      return res.status(500).send({
                        Error: "Error al agregar el producto al carrito.",
                      });

                    var totalCarrito = 0;

                    for (
                      var i = 0;
                      i < carritoActualizado.carrito.length;
                      i++
                    ) {
                      totalCarrito =
                        totalCarrito +
                        carritoActualizado.carrito[i].totalProducto;
                    }

                    Usuarios.findByIdAndUpdate(
                      { _id: req.user.sub },
                      { precioTotal: totalCarrito },
                      { new: true },
                      (error, totalActualizado) => {
                        if (error)
                          return res.status(500).send({
                            Error: "Error en la peticion. (TotalCarrito)",
                          });
                        if (!totalActualizado)
                          return res.status(500).send({
                            Error: "Error al establecer el total de la compra.",
                          });

                        return res.status(200).send({
                          Mi_carrito: totalActualizado,
                        });
                      }
                    );
                  }
                );
              } else {
                /*                 var nuevaCantidad=0;
                for (var i = 0; productoExistente.carrito.length > i; i++) {
                  nuevaCantidad =
                    datos.cantidad +
                    productoExistente.carrito[i].cantidadProducto;
                  var nuevoTotalCarrito;
                  Usuarios.findOneAndUpdate(
                    {
                      carrito: {
                        $elemMatch: { _id: productoExistente.carrito[i]._id },
                      },
                    },
                    {
                      $inc: {
                        "carrito.$.cantidadProducto": datos.cantidad,
                        "carrito.$.totalProducto":
                          nuevaCantidad * productoEncontrado.precio,
                      },
                    },
                    { new: true },
                    (error, nuevoTotal) => {
                      if (error)
                        return res.status(500).send({
                          Error:
                            "Error en la peticion de aumentar total. (Producto ya agregado)",
                        });
                      if (!nuevoTotal)
                        return res.status(500).send({
                          Error:
                            "No se pudo aumentar la cantidad del producto ya agregado.",
                        });

                      for (var a = 0; nuevoTotal.carrito.length > a; a++) {
                        nuevoTotalCarrito =
                          nuevoTotalCarrito +
                          nuevoTotal.carrito[a].cantidadProducto;
                      }

                      Usuarios.findByIdAndUpdate(
                        { _id: req.user.sub },
                        { precioTotal:nuevoTotalCarrito },
                        { new: true },
                        (error, totalDeCompra) => {
                          if (error)
                          console.log(error)
                            return res.status(500).send({
                              Error:
                                "Error en la peticion de modificar el total. (Producto ya agregado)"
                            });
                          if (!totalDeCompra)
                            return res.status(500).send({
                              Error: "No se pudo modificar el nuevo total.",
                            });
                          return res.status(500).send({
                            Mi_carrito: totalDeCompra,
                          });
                        }
                      );
                    }
                  );
                } */
              }
            }
          );
        }
      }
    );
  } else {
    return res.status(500).send({
      Error: "Ingresa el nombre del producto y la cantidad que deseas.",
    });
  }
}

function generarFactura(req, res) {
  const modeloFactura = new Facturas();

  Usuarios.findById({ _id: req.user.sub }, (error, miUsuario) => {
    if (error)
      return res
        .status(500)
        .send({ Error: "Error en la peticion de comprar productos." });
    if (miUsuario.carrito == "") {
      return res
        .status(500)
        .send({ Error: "Aun no tienes ningun producto en tu carrito." });
    }
    modeloFactura.idUsuario = req.user.sub;
    modeloFactura.nombreUsuario = req.user.nombre;
    modeloFactura.listado = miUsuario.carrito;
    modeloFactura.precioTotal = miUsuario.precioTotal;
    modeloFactura.save((error, facturaGenerada) => {
      if (error)
        return res
          .status(500)
          .send({ Error: "Error en la peticion para guardar la factura." });
      if (!facturaGenerada)
        return res.status(500).send({ Error: "Error al guardar la factrua." });

      Usuarios.findByIdAndUpdate(
        { _id: req.user.sub },
        { $set: { carrito: [] }, totalCarrito: 0 },
        { new: true },
        (error, reinicioDelCarrito) => {
          for (var i = 0; miUsuario.carrito.length > i; i++) {
            Productos.findOneAndUpdate(
              { nombre: miUsuario.carrito[i].nombreProducto },
              {
                $inc: {
                  cantidad: miUsuario.carrito[i].cantidadProducto * -1,
                  ventas: miUsuario.carrito[i].cantidadProducto,
                },
              },
              (error, actualizacionDeProductos) => {
                if (error)
                  return res
                    .status(500)
                    .send({ Error: "Error en la peticion." + " " + error });
                if (!actualizacionDeProductos)
                  return res.status(500).send({
                    Error: "Error al modificar la informacion del producto.",
                  });

                generarPDF(req, res, facturaGenerada);
              }
            );
          }
        }
      );
    });
  });
}

function generarPDF(req, res, facturaGenerada) {
  if (req.user.rol == "Admin") {
    return res.status(500).send({
      Error: "Solo los clientes pueden realizar compras.",
    });
  }

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("Factura de " + req.user.nombre + ".pdf"));
  doc.pipe(res);
  doc
    .fillColor("#141414")
    .strokeColor("#22366B")
    .fontSize(20)
    .text("Factura de " + req.user.nombre, { align: "center" })
    .text("Total a pagar:" + facturaGenerada.precioTotal)
    .fontSize(10)
    .moveDown();

  const table = {
    headers: [
      "Productos",
      "Cantidad",
      "Precio unitario",
      "Total por productos",
    ],
    rows: [],
  };

  for (var i = 0; facturaGenerada.listado.length > i; i++) {
    table.rows.push([
      facturaGenerada.listado[i].nombreProducto,
      facturaGenerada.listado[i].cantidadProducto,
      facturaGenerada.listado[i].precioProducto,
      facturaGenerada.listado[i].totalProducto,
    ]);
  }
  doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold"),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
  });

  doc.end();
}

function verFacturasUsuario(req, res) {
  if (req.user.sub == "Cliente") {
    return res.status(500).send({
      Error:
        "Solo el administrador puede visualizar las facturas de otros usuarios.",
    });
  }
  var idUsuario = req.params.ID;
  Facturas.find({ idUsuario: idUsuario }, (error, listado) => {
    if (error)
      return res
        .status(500)
        .send({ Error: "Error en la peticion de buscar facturas." });
    if (listado.length == 0) {
      return res.status(500).send({ Error: "Este usuario no tiene facturas." });
    } else {
      return res.status(500).send({ Facturas_del_usuario: listado });
    }
  });
}

function verFacturas(req, res) {
  if (req.user.rol == "Cliente") {
    return res
      .status(500)
      .send({
        Error: "Solo los administradores pueden visualizar las facturas.",
      });
  }
  Facturas.find((error, facturas) => {
    if (error)
      return res
        .status(500)
        .send({ Error: "Error en la peticion de buscar facturas." });
    if (facturas.length == 0) {
      return res.status(500).send({ Error: "No hay ninguna factura." });
    } else {
      return res
        .status(200)
        .send({ Facturas: facturas, Total_de_facturas: facturas.length });
    }
  });
}

function verProductosDeUnaFactura(req,res){
  var idFactura=req.params.ID;
  if(req.user.rol=="Cliente"){
    return res.status(500).send({Error:"Solo los administradores pueden visualizar los productos de una factura."})

  }

  
  Facturas.findById({_id:idFactura},(error,productosEnFactura)=>{
    if(error)return res.status(500).send({Error:"Error al obtener los productos de una factura."})
    if(!productosEnFactura)return res.status(500).send({Error:"No se pudo obtener los productos de la factura."})

    return res.status(200).send({Productos:productosEnFactura.listado})


  })
}

module.exports = {
  agregarAlCarrito,
  generarFactura,
  verFacturasUsuario,
  verFacturas,
  verProductosDeUnaFactura
};
