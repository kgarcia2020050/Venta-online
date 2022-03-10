const mongoose=require("mongoose")
var Schema=mongoose.Schema

var UsuariosSchema=new Schema({
    nombre:String,
    usuario:String,
    password:String,
    rol:String,
    carrito:[{
        nombreProducto:String,
        cantidadProducto:Number,
        precioProducto:Number,
        totalProducto:Number
    }],
    precioTotal:Number
})


module.exports=mongoose.model("Usuarios",UsuariosSchema)