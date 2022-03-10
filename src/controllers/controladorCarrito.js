/* function agregarRespuestaEncuesta(req, res) {
    var idEnc = req.params.idEncuesta;
    var parametros = req.body;

    Encuesta.findByIdAndUpdate(idEnc, { $push: { respuestas: { textoRespuesta: parametros.textoRespuesta,
        idUsuarioRespuesta: req.user.sub } } }, {new: true}, (err, respuestaAgregada) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!respuestaAgregada) return res.status(500).send({ mensaje: 'Error al agregar la Respuesta'});

            return res.status(200).send({ respuesta: respuestaAgregada })
    })
} */


function carritoAfactura(req, res){

    // const facturaModel = new Factura();

    /* Usuario.findById(req.user.sub, (err, usuarioEncontrado)=>{
        
        facturaModel.listaProductos = usuarioEncontrado.carrito;
        facturaModel.idUsuario = req.user.sub;
        facturaModel.totalFactura = usuarioEncontrado.totalCarrito;
        for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
            Producto.findByOneAndUpdate({nombre: usuarioEncontrado.carrito[i].nombreProducto} , 
                {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada * -1, 
                    vendido: usuarioEncontrado.carrito[i].cantidadComprada }})
        }
    }) */

    Usuario.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, 
        (err, carritoVacio)=>{
            return res.status(200).send({ usuario: carritoVacio })
        })

}


function agregarProductoCarrito(req, res) {
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

    Producto.findOne({ nombre: parametros.nombreProducto }, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
        if(!productoEncontrado) return res.status(404).send({ mensaje: 'Error al obtener el Producto'});

        Usuario.findByIdAndUpdate(usuarioLogeado, { $push: { carrito: { nombreProducto: parametros.nombreProducto,
            cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio } } }, { new: true}, 
            (err, usuarioActualizado)=>{
                if(err) return res.status(500).send({ mensaje: "Error en la peticion de Usuario"});
                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});

                let totalCarritoLocal = 0;

                for(let i = 0; i < usuarioActualizado.carrito.length; i++){
                    // totalCarritoLocal = totalCarritoLocal + usuarioActualizado.carrito[i].precioUnitario;
                    totalCarritoLocal += usuarioActualizado.carrito[i].precioUnitario;
                }

                Usuario.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                    (err, totalActualizado)=> {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});

                        return res.status(200).send({ usuario: totalActualizado })
                    })
            })
    })


    
}