const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.autenticarUsuario = async (req, res)=>{
    // revisar si hay correos
    const errores = validationResult(req); 
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array() });
    }

    // extraer el email y password
    const {email, password} =req.body;

    try {
        // Revisar que se un usuario registrado
        let usuario = await Usuario.findOne({email});
        if(!usuario){
            return res.status(400).json({msg: 'El Usuario no existe'});
        }
        // Revisar el password
        const passCorrecto = await bcryptjs.compare(password, usuario.password);
        if(!passCorrecto){
            return res.status(400).json({msg: 'Password Incorrecto'})
        }

        // Si todo es correcto crear y firmar el JWT
        const payload = {
            usuario:{
                id: usuario.id,
            }
        };
        // firmar el JWT
        jwt.sign(payload, process.env.SECRETA,{
            expiresIn: 3600
        }, (error, token)=>{
            if(error) throw error;

            // Mensaje de confirmacion
            res.json({token});
        });

    } catch (error) {
       console.log(error); 
    }
}

// Obtiene usuario autenticado
exports.usuarioAutenticado = async (req, res)=>{
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        res.json({usuario});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Hubo un error'});
    }
}