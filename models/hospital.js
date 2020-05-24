var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// var rolesValidos = {
//     values: ['ADMIN_ROLE', 'USER_ROLE'],
//     message: '{VALUE} no es un rol valido'
// }

var hospitalSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es obligatorio'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }

}, { collection: 'hospitales' });

hospitalSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser único. {VALUE} ya existe' });

module.exports = mongoose.model('Hospital', hospitalSchema);