var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case'); // Title cases the fileds ex. my name is ==> My Name Is
var validate = require('mongoose-validator'); // required for backend regex validation


var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [2, 25],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters.'
  }),
  validate({
    validator: 'matches',
    arguments: /^([a-zA-Z]{2,25})+$/,
    message: 'Name must be at least 2 characters, max 25, no special characters or digits.'
  })
];


var passwordValidator = [
  validate({
    validator: 'isLength',
    arguments: [8, 25],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters.'
  }),
  validate({
    validator: 'matches',
    arguments: /^(?=[A-Za-z0-9!@%&#]{8,25}$)(?=.*\d)(?=.*[A-Za-z]).*$/,
    message: 'Password must be at least 8 characters, max 25, at least one uppercase, lowercase, and number with an optional special characters (!, @, %, &, or #). Ex: Password1 or Password1!'
  })
];

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Not a valid email.'
  }),
    validate({
    validator: 'isLength',
    arguments: [3,25],
    message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters.'
  })
]

var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters.'
  }),
  validate({
    validator: 'isAlphanumeric',
    passIfEmpty: true,
    message: 'Username should contain alpha-numeric characters only.'
  })
]


var UserSchema = new Schema({
	firstname : {type: String, required: true, validate: nameValidator},
  lastname : {type: String, required: true, validate: nameValidator},
	username : { type: String, required: true, unique: true, validate: usernameValidator },
	email : { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
	password : {type: String, required: true, validate: passwordValidator},
  permissions : {type: String, required: true, default: 'user'},
  dateCreated : {type: Date, required:true},
  dateOfBirth : {type: Date, default: null},
  profileImage : {type: String, default: null},
  followers : {type: Array, default: null},
  following : {type: Array, default: null},
  gallery : {type: Array, default: null},
  weight : {
    lbs:{type: Number, default: null},
    kg:{type: Number, default: null}
  },
  height : {
    in:{type: Number, default: null},
    cm:{type: Number, default: null}
  },
  weightUnit : {type: String, default: 'lbs'},
  heightUnit : {type: String, default: 'in'},
  distanceUnit : {type: String, default: 'mi'},
  calorieUnit : {type: String, default: 'kcal'},
  // workouts: {type: Array, default: null},
  // exercises: {type: Array, default: null}
});

// Before saving the new UserScheman "presave", create a hash for this users password.
UserSchema.pre('save', function(next){

    var user = this;

    // Function to encrypt password 
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err); // Exit if error is found
        user.password = hash; // Assign the hash to the user's password so it is saved in database encrypted
        next(); // Exit Bcrypt function
    });
});

// Mongoose title case plugin to perform title casing on the supplied fields.
UserSchema.plugin(titlize, {
  paths: [ 'firstname', 'lastname']
});

/** 
	Custom method to compare passwords.
 	Returns the comparison between the provided param password with the current password.
**/
UserSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);

