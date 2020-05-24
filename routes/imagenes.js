var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');


app.get('/:tabla/:img', (req, res, next) => {

    try {

        var tabla = req.params.tabla;
        var imagen = req.params.img;

        var pathImagen = path.resolve(__dirname, `../uploads/${tabla}/${imagen}`);

        if (fs.existsSync(pathImagen)) {
            res.sendFile(pathImagen);
        } else {
            var pathNoImnage = path.resolve(__dirname, '../assets/no-img.jpg')
            res.sendFile(pathNoImnage);
        }

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Peticion realizada correctamente'
        // });

    } catch (error) {

        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener imagen',
            err: error.message
        });

    }

});


module.exports = app;