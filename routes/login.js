var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


app.post('/', (req, res) => {

    var body = req.body;

    var email = body.email;
    var password = body.password;
    var passwordEcrypted = bcrypt.hashSync(password, 10);


    Usuario.find({ email: email })
        .exec(
            (err, usuariosBD) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error en login de usuario',
                        errors: err
                    });

                    return;
                }

                if (usuariosBD.length === 0) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario no existe: ' + email,
                    });

                    return;
                }

                var usuarioBD = usuariosBD[0];
                var passwordEncryptedBD = usuarioBD.password;

                // if (passwordEcrypted !== passwordEncryptedBD) {
                if (!bcrypt.compareSync(password, passwordEncryptedBD)) {
                    res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario/contraseña es incorrecto',
                        // contraseñaRecibida: password + '-' + passwordEcrypted,
                        // contraseñaBBDD: passwordEncryptedBD,
                    });

                    return;
                }

                // TOKEN!!!
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4horas

                usuarioBD.password = ';-)';

                res.status(200).json({
                    ok: true,
                    message: "login post correcto!!!!",
                    usuario: usuarioBD,
                    id: usuarioBD.id,
                    token: token,
                });

            });

});






module.exports = app;