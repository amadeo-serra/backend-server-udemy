var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ====================================================
// Busqueda por coleccion
// ====================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    // expresion regular params
    //    busqueda insensible
    var regExpr = new RegExp(busqueda, 'i');


    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regExpr);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regExpr);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regExpr);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'La busqueda para la coleccion ' + tabla + ' no está disponible',
            });

            return;
    }

    promesa
        .then(resultados => {
            try {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Busqueda de ' + tabla + ' correcta',
                    [tabla]: resultados
                });
            } catch (err) {
                res.status(500).json({
                    ok: false,
                    mensajes: '1-Error al realizar busqueda de ' + tabla,
                    error: err.message
                });
            }

        })
        .catch(err => {
            res.status(500).json({
                ok: false,
                mensajes: '2-Error al realizar busqueda de ' + tabla,
                error: err
            });
        });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Busqueda de ' + tabla + ' correcta',
    // });


});



// ====================================================
// Busqueda general
// ====================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    // expresion regular params
    //    busqueda insensible
    var regExpr = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regExpr),
            buscarMedicos(busqueda, regExpr),
            buscarUsuarios(busqueda, regExpr)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                mensaje: 'Peticion busqueda correctamente',
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2],
            });

        })
        .catch(err => {
            res.status(500).json({
                ok: false,
                mensajes: "Error al realizar busqueda",
                error: err
            });
        });


    // buscarHospitales(busqueda, regExpr)
    //     .then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             mensaje: 'Peticion busqueda correctamente',
    //             resultados: hospitales
    //         });
    //     })
    //     .catch(err => {
    //         res.status(500).json({
    //             ok: false,
    //             mensajes: "Error al realizar busqueda",
    //             error: err
    //         });
    //     });

});

function buscarHospitales(busqueda, regExpr) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regExpr })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            });

    });

}

function buscarMedicos(busqueda, regExpr) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regExpr })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos);
                }
            });

    });

}

function buscarUsuarios(busqueda, regExpr) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, ' nombre email role')
            .or([{ nombre: regExpr }, { email: regExpr }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios');
                } else {
                    resolve(usuarios);
                }
            });

    });

}

module.exports = app;