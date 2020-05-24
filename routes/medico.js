var express = require('express');

var autenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ====================================================
// Obtener todos los medicos
// ====================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img hospital usuario')
        .skip(desde)
        .limit(3)
        .populate('hospital')
        .populate('usuario', 'nombre email')
        .exec(
            (err, medicos) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error bbdd cargando medicos',
                        errors: err
                    });

                    return;
                }

                Medico.count({}, (err, conteo) => {

                    if (err) {
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error bbdd contando medicos',
                            errors: err
                        });

                        return;
                    }

                    res.status(200).json({
                        ok: true,
                        cuenta: conteo,
                        medicos: medicos
                    });

                });
            });
});

// ====================================================
// Crear medico
// ====================================================
app.post('/', [autenticacion.verificaToken], (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        //img: body.img,
        hospital: body.hospitalId,
        usuario: req.usuario._id

    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error bbdd al crear medico',
                errors: err
            });

            return;
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });

    });


});


// ====================================================
// Eliminar medico por id
// ====================================================
app.delete('/:id', [autenticacion.verificaToken], (req, res) => {

    var id = req.params.id;


    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });

            return;
        }

        if (!medicoBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'El medico no existe (id: ' + id + ')',
                errors: { message: 'No existe un medico con ese ID' }
            });

            return;
        }

        res.status(200).json({
            ok: true,
            id: id,
            body: medicoBorrado
        });

    });
});

// ====================================================
// Actualizar medico
// ====================================================
app.put('/:id', [autenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });

            return;
        }

        if (!medico) {
            res.status(400).json({
                ok: false,
                mensaje: 'El medico no existe (id: ' + id + ')',
                errors: { message: 'No existe un medico con ese ID' }
            });

            return;
        }

        // llegado aqui existe el hospital
        medico.nombre = body.nombre;
        //medico.img = body.img;
        medico.hospital = body.hospitalId;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error bbdd al actualizar medico',
                    errors: err
                });

                return;
            }

            res.status(200).json({
                ok: true,
                body: medicoGuardado
            });

        });

    });


});



module.exports = app;