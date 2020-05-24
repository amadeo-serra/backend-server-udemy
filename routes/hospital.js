var express = require('express');

var autenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ====================================================
// Obtener todos los hospitales
// ====================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(3)
        .populate('usuario', ' nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error bbdd cargando hospitales',
                        errors: err
                    });

                    return;
                }

                Hospital.count({}, (err, conteo) => {

                    if (err) {
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error bbdd contando hospitales',
                            errors: err
                        });

                        return;
                    }

                    res.status(200).json({
                        ok: true,
                        cuenta: conteo,
                        hospitales: hospitales
                    });

                });
            });
});

// ====================================================
// Crear hospital
// ====================================================
app.post('/', [autenticacion.verificaToken], (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        //img: body.img,
        usuario: req.usuario._id

    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error bbdd al crear hospital',
                errors: err
            });

            return;
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });

    });


});


// ====================================================
// Eliminar hospital por id
// ====================================================
app.delete('/:id', [autenticacion.verificaToken], (req, res) => {

    var id = req.params.id;


    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });

            return;
        }

        if (!hospitalBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'El hospital no existe (id: ' + id + ')',
                errors: { message: 'No existe un hospital con ese ID' }
            });

            return;
        }

        res.status(200).json({
            ok: true,
            id: id,
            body: hospitalBorrado
        });

    });
});

// ====================================================
// Actualizar hospital
// ====================================================
app.put('/:id', [autenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });

            return;
        }

        if (!hospital) {
            res.status(400).json({
                ok: false,
                mensaje: 'El hospital no existe (id: ' + id + ')',
                errors: { message: 'No existe un hospital con ese ID' }
            });

            return;
        }

        // llegado aqui existe el hospital
        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error bbdd al actualizar hospital',
                    errors: err
                });

                return;
            }

            res.status(200).json({
                ok: true,
                body: hospitalGuardado
            });

        });

    });


});



module.exports = app;