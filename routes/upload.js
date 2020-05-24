var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());


app.put('/:tabla/:id', function(req, res, next) {
    try {
        var tabla = req.params.tabla;
        var id = req.params.id;

        // tipos de tabla validos
        var tablasValidas = ['hospitales', 'usuarios', 'medicos'];

        if (tablasValidas.indexOf(tabla) < 0) {
            return res.status(400).json({
                ok: false,
                message: 'Tabla no valida',
                errors: {
                    message: 'Las tablas validas son ' + tablasValidas.join(','),
                }
            });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'No selecciono nada',
                errors: {
                    message: 'No selecciono nada',
                }
            });
        }

        // Obtener nombre del archivo
        var archivo;
        if (req.files.imagen instanceof Array) {
            archivo = req.files.imagen[0];
        } else {
            archivo = req.files.imagen;
        }

        var nombreCortado = archivo.name.split('.');
        var extensionArchivo = nombreCortado[nombreCortado.length - 1]

        // Solo aceptamos estas extensiones
        var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']

        if (extensionesValidas.indexOf(extensionArchivo) < 0) {
            return res.status(400).json({
                ok: false,
                archivo: archivo.name,
                message: 'Extension no valida: ' + extensionArchivo,
                errors: {
                    message: 'Las extensiones validas son ' + extensionesValidas.join(','),
                }
            });
        }

        // Nombre de archivo personalizado (id + numero random)
        var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

        // Mover archivo del temporal a path
        var path = `./uploads/${tabla}/${nombreArchivo}`;

        archivo.mv(path, function(err) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al mover el archivo a la carpeta del servidor',
                    errors: err
                });
            }

            subirPorTipo(tabla, id, nombreArchivo, res);

            // res.status(200).json({
            //     ok: true,
            //     mensaje: 'Archivo subido correctamente',
            //     nombreCortado: nombreCortado,
            //     extensionArchivo: extensionArchivo,
            //     // req: req.files,
            // });
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Error inesperado',
            errors: {
                message: error.message,
                error: Object.keys(req.files.imagen),
            }
        });
    }


});

function subirPorTipo(tabla, id, nombreArchivo, res) {

    try {

        var modeloDatos;

        switch (tabla) {

            case 'usuarios':
                modeloDatos = Usuario;
                break;

            case 'hospitales':
                modeloDatos = Hospital;
                break;

            case 'medicos':
                modeloDatos = Medico;
                break;

        }

        modeloDatos.findById(id, (err, registro) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error bbdd al buscar el id ' + id + ' en coleccion ' + tabla,
                    errors: err
                });
            }

            if (!registro) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El id ' + id + ' no existe en la coleccion ' + tabla,
                    errors: err
                });
            }

            var pathViejo = `./uploads/${tabla}/${registro.img}`;

            if (fs.existsSync(pathViejo)) {
                // existe el archivo antiguo...lo elimino
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        console.log('Pues eso, error al borrar archivo ' + pathViejo);
                    }
                });
            }


            registro.img = nombreArchivo;

            registro.save((err, registroGuardado) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error bbdd al actualizar imagen del registro',
                        errors: err
                    });

                    return;
                }

                if (registroGuardado.password) {
                    registroGuardado.password = ";-)";
                }

                return res.status(200).json({
                    ok: true,
                    message: 'archivo subido con éxito',
                    [tabla]: registroGuardado
                });

            });

        });


        // if (tabla === 'usuarios') {

        //     Usuario.findById(id, (err, usuario) => {

        //         var pathViejo = `./uploads/${tabla}/${usuario.img}`;

        //         if (fs.existsSync(pathViejo)) {
        //             // existe el archivo antiguo...lo elimino
        //             fs.unlink(pathViejo, (err) => {
        //                 if (err) {
        //                     console.log('Pues eso, error al borrar archivo ' + pathViejo);
        //                 }
        //             });
        //         }


        //         usuario.img = nombreArchivo;

        //         usuario.save((err, usuarioGuardado) => {

        //             if (err) {
        //                 res.status(400).json({
        //                     ok: false,
        //                     mensaje: 'Error bbdd al actualizar imagen del usuario',
        //                     errors: err
        //                 });

        //                 return;
        //             }

        //             usuarioGuardado.password = ";-)";

        //             return res.status(200).json({
        //                 ok: true,
        //                 message: 'archivo subido con éxito',
        //                 usuario: usuarioGuardado
        //             });

        //         });

        //     });
        // }

        // if (tabla === 'medicos') {

        // }

        // if (tabla === 'hospitales') {

        // }

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Erro en subirPorTipo',
            err: error.message
        });
    }

}

module.exports = app;