var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var titlize = require('mongoose-title-case'); // Title cases the fileds ex. my name is ==> My Name Is

var ExerciseSchema = new Schema({
	name : { type: String, required: true, unique:true},
  	musclegroup : { type: String, required: true},
  	type : { type: String, required: true},
  	createdBy : { type: String, required: true},
  	dateCreated : { type: Date, required: true},
  	images: { type: Array},
  	description : { type: String, required: true},
  	isGuilded: { type: Boolean, default: false}

});

// Mongoose title case plugin to perform title casing on the supplied fields.
ExerciseSchema.plugin(titlize, {
  paths: [ 'name']
});


module.exports = mongoose.model('Exercise', ExerciseSchema);