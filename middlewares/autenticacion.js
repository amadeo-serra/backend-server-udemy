var express = require('express');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

// ====================================================
// Verificar TOKEN
// ====================================================

exports.verificaToken = function(req, res, next) {
    //var token = req.query.token;
    var token = req.header('token');

    // console.log('token:');
    // console.log(token);
    // console.log('/token:');


    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido ¿?',
                token: token,
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
};

// ====================================================
// Verificar ADMIN
// ====================================================

exports.verificaADMIN_ROLE = function(req, res, next) {


    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Acceso no autorizado',
            errors: {
                message: 'No tienes permiso para la peticion realizada'
            }
        });
    }
};

// ====================================================
// Verificar ADMIN o mismo usuario
// ====================================================

exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {


    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === req.params.id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Acceso no autorizado',
            errors: {
                message: 'No tienes permiso para la peticion realizada'
            }
        });
    }
};