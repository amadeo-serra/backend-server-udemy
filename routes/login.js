var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

var Usuario = require('../models/usuario');

// GOOGLE
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// =======================================
// Autenticacion Google
// =======================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    // return payload;

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {

    var tokenGoogle = req.body.token;

    var googleUser = await verify(tokenGoogle)
        .catch(e => {

            tokenGoogle = null;
            return res.status(403).json({
                ok: false,
                mensaje: 'Token google no valido',
                errors: e
            });
        });

    if (tokenGoogle === null) {
        return;
    }


    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });

            return;
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario ya existe sin estar ligado a google. Debe usar su autenticación local',
                });

                return;
            }

            var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4horas

            usuarioBD.password = ';-)';

            res.status(200).json({
                ok: true,
                id: usuarioBD.id,
                token: token,
                usuario: usuarioBD,
                menu: obtenerMenu(usuarioBD.role)
            });

            return;
        } else {
            // El usuario no existe en nuestra BBDD todavia, lo creamos

            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ';-)';

            usuario.save((err, usuarioBD) => {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4horas

                usuarioBD.password = ';-)';

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    id: usuarioBD.id,
                    token: token,
                    menu: obtenerMenu(usuarioBD.role)
                });

                return;
            });

        }
    });

});


// =======================================
// Autenticacion normal
// =======================================
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
                    menu: obtenerMenu(usuarioBD.role)
                });

            });

});


// =======================================
// Autenticacion normal
// =======================================
function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgessBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' },
            ]
        },

        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}



module.exports = app;