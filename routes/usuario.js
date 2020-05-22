var express = require('express');
var bcrypt = require('bcryptjs');

var autenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ====================================================
// Obtener todos los usuarios
// ====================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error bbdd cargando usuarios',
                        errors: err
                    });

                    return;
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            });
});

// =========================================================
// Verificar TOKEN >> Se puede hacer asi, pero es mas cutre
// =========================================================
// app.use('/', (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify(token, SEED, (err, decoded) => {

//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token no valido',
//                 errors: err
//             });
//         }

//         next();
//     });

// });

// asi tambien funcion
// app.use('/', (req, res, next) => {
//     autenticacion.verificaToken(req, res, next);
// });


// ====================================================
// Crear usuarios
// ====================================================
app.post('/', [autenticacion.verificaToken], (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error bbdd al crear usuario',
                errors: err
            });

            return;
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});


// ====================================================
// Eliminar usuarios por id
// ====================================================
app.delete('/:id', [autenticacion.verificaToken], (req, res) => {

    var id = req.params.id;


    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });

            return;
        }

        if (!usuarioBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe (id: ' + id + ')',
                errors: { message: 'No existe un usuario con ese ID' }
            });

            return;
        }

        res.status(200).json({
            ok: true,
            id: id,
            body: usuarioBorrado
        });

    });
});

// ====================================================
// Actualizar usuarios
// ====================================================
app.put('/:id', [autenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });

            return;
        }

        if (!usuario) {
            res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe (id: ' + id + ')',
                errors: { message: 'No existe un usuario con ese ID' }
            });

            return;
        }

        // llegado aqui existe el usuario
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error bbdd al actualizar usuario',
                    errors: err
                });

                return;
            }

            usuarioGuardado.password = ";-)";

            res.status(200).json({
                ok: true,
                body: usuarioGuardado
            });

        });

    });


});



module.exports = app;