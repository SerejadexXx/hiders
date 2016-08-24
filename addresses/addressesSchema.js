var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    code:    String,
    data:   Schema.Types.Mixed
});
var Address = mongoose.model('Info', schema);

module.exports = Address;