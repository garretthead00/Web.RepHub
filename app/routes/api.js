var User = require('../models/user');
var Exercise = require('../models/exercise');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var fs = require('fs-extra');
var secret = 'I solomly swear Im up to no good';

var todaysDate = function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd;
	} 
	if(mm<10) {
	    mm='0'+mm;
	} 
	today = mm+'/'+dd+'/'+yyyy;
	return today;
};


module.exports = function(router){

	// USER REGISTRATION ROUTE
	// Creates a new user
	router.post('/users', function(req, res){
		var user = new User();
		user.firstname = req.body.firstname;
		user.lastname = req.body.lastname;
		user.username = req.body.username;
		user.password = req.body.password;
		user.email = req.body.email;
		user.dateCreated = todaysDate();
		if (user.username == '' || user.username == null || user.password == '' || user.password == null || user.firstname == '' || user.firstname == null || user.lastname == '' || user.lastname == null || user.email == '' || user.email == null){
			res.json({ success: false, message:'ERROR! Ensure username and password are provided.' });
		} else {
			user.save(function(err){
				if (err){
					if (err.errors != null){
						if(err.errors.name){
							res.json({ success: false, message: err.errors.name.message });
						} else if(err.errors.email){
							res.json({ success: false, message: err.errors.email.message });
						} else if(err.errors.username){
							res.json({ success: false, message: err.errors.username.message });
						} else if(err.errors.password){
							res.json({ success: false, message: err.errors.password.message });
						} else {
							res.json({ success: false, message: err  });
						}
					} else if (err){
						// Duplicate error code
						if (err.code == 11000){
							res.json({success: false, message: "Username already taken."});
						} else {
							res.json({success: false, message: err});
						}
					}
				} else {
					// Once the user account has successfully been created,
					// create a file directory for this user to store files.
					var dir = './public/assets/uploads/' + user.username;
			    	if (!fs.existsSync(dir)){
			    		console.log("new directory made");
					    fs.mkdirSync(dir);
					}
					res.json({ success: true, message:'User account succesfully created!' });
				}
			});
		}
	});

	// USER LOGIN ROUTE
	router.post('/authenticate', function(req, res){
		User.findOne({username: req.body.username}).select('username password').exec(function(err, user){
			if (err) throw err;

			if(!user){
				res.json({ success : false, message: 'Could not authenticate user.'});
			} else if (user){
				if(req.body.password){
					var validPassword = user.comparePassword(req.body.password);
					if(!validPassword){
						res.json({ success : false, message: 'Could not authenticate password.'});
					} else {
						var token = jwt.sign({ _id: user._id, username: user.username }, secret, { expiresIn: '24h' });
						res.json({ success : true, message: 'User authenticated!', token: token});
					}
				} else {
					res.json({ success : false, message: 'No password provided.'});
				}

			}
		});
	});


	// Checks if the username provided already exists within the server.
	router.post('/checkusername', function(req, res){
		User.findOne({username: req.body.username}).select('username').exec(function(err, user){
			if (err) throw err;

			if(user){ 
				res.json({success:false , message: "Username already exists."});
			} else {
				res.json({success: true, message: "Valid username."});
			}

		});
	});

	// Checks if the email provided already exists within the server.
	router.post('/checkemail', function(req, res){
		User.findOne({email: req.body.email}).select('email').exec(function(err, user){
			if (err) throw err;

			if(user){ 
				res.json({success:false , message: "Email already exists."});
			} else {
				res.json({success: true, message: "Valid email."});
			}

		});
	});

	// Custom middleware to decrypt the token and send it to the user.
	router.use(function(req, res, next){
		var token = req.body.token || req.body.query || req.headers['x-access-token'];

		if(token){
			jwt.verify(token, secret, function(err, decoded){
				if (err) {
					res.json({ success: false, message: 'Token invalid' });
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.json({ success: false, message: "No token provided." });
		}
	});
	
	router.post('/me', function(req, res){
		res.send(req.decoded);
	});

	router.get('/permission', function(req,res){
		User.findOne({username: req.decoded.username }, function(err, user){
			if(err) throw err;

			if(!user){
				//console.log('no permissions found');
				res.json({success: false, message: "No user was found "})
			} else{
				//console.log('permissions found');
				res.json({success: true, permission: user.permissions})
			}
		})
	});

	// Route to get the user profile of username.
	router.get('/profile/:username', function(req,res){
		var username = req.params.username;
		var isMainUser = false;
		var isFollowing = false;
		User.findOne({username: req.decoded.username}, function(err, mainUser){
				if (err) throw err;

				if(!mainUser){
					res.json({success: false, message: "No user found"});
				} else {
					User.findOne({username: username}, function(err, user){
						if (err) throw err;

						if(!user){
							res.json({success: false, message: "User not found"});
						} else{

							// Check is this user is the currently logged in user.
							if(mainUser.username == user.username){
								isMainUser = true;
							} else {
								isMainUser = false;

								// check if the current user is following this user.
								for(var i=0; i < user.followers.length; i++){
									if(user.followers[i].username == mainUser.username){
										isFollowing = true;
									} else{
										isFollowing = false;
									}
								}
							}
							res.json({ success: true, user: user , isMainUser: isMainUser, isFollowing: isFollowing});
						}	
					});
				}
		});
	});

	// Route to update the user profile info
	router.put('/profile', function(req,res){

		// Find the user document with the matching id,
    	// update this document with the new data.
	    User.findOneAndUpdate({username: req.decoded.username},
	        {  
	            $set: {
	            	firstname: req.body.firstname,
	            	lastname: req.body.lastname,
	                email: req.body.email,
	                weight:{
	                	kg: req.body.weight.kg,
	                	lbs: req.body.weight.lbs
	                },
	                height:{
	                	in: req.body.height.in,
	                	cm: req.body.height.cm,
	                },
	                dateOfBirth: req.body.dateOfBirth,
	                profileImage: req.body.profileImage,
	                distanceUnit: req.body.distanceUnit,
	                weightUnit: req.body.weightUnit,
	                heightUnit: req.body.heightUnit,
	                calorieUnit: req.body.calorieUnit
	            }
	        }, function(err, user) {
	            if (err) throw err;

	            if (user) {
	            	res.json({success: true, message: 'User updated', user: user});
	          
	            } else {
	                res.json({message: 'User does not exist'});
	            }
	    });

	});

	router.get('/management', function(req, res){
		User.find({}, function(err, users){
			if (err) throw err;

			User.findOne({username: req.decoded.username}, function(err, mainUser){
				if (err) throw err;

				if(!mainUser){
					res.json({success: false, message: "No user found"});
				} else {
					if(mainUser.permissions === "Admin" || mainUser.permissions === "Mod"){

						if(!users){
							res.json({success: false, message: "Users not found"});
						} else{
							res.json({success: true, users: users, permission: mainUser.permissions});
						}

					} else{
						res.json({success: false, message: "Not authorized to read this."});
					}
				}
			});
		});
	});

	 // Route to delete a user
	router.delete('/management/:username', function(req, res){
		var userToDelete = req.params.username;

		// Check for the current user.
		User.findOne({username: req.decoded.username}, function(err, mainUser){
			if (err) throw err;

			// Check if the current user is in the DB
			if(!mainUser){
				res.json({success: false, message: "No user found"})
			} else {
				// Check if the current user is a 'Mod'
				// If so, then allow to delete.
				if(mainUser.permissions !== 'Admin'){
					res.json({success: false, message: "User does not have permission to delete."});
				} else{
					User.findOneAndRemove({username: userToDelete}, function(err, user){
						if (err) throw err;
						res.json({success: true});
					});
				}
			}
		});
	});

	 router.get('/edit/:id', function(req, res) {
	 	var editUser = req.params.id; // Assign the _id from parameters to variable
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) throw err;
            if(!mainUser){
            	res.json({success:false, message:"No user found!"});
            } else{
            	// Check if logged in user has editing privileges
                if (mainUser.permissions === 'Admin' || mainUser.permissions === 'Mod') {
	                // Find the user to be editted
	                User.findOne({ _id: editUser }, function(err, user) {
	                    if (err) throw err;

                        // Check if user to edit is in database
                        if (!user) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            res.json({ success: true, user: user }); // Return the user to be editted
                        }
                            
	                });
	            } else {
	            	res.json({success: false, message: "User does not have permission to edit."});
	            }
            }
        });
	 });

	  // Route to update/edit a user
    router.put('/edit', function(req, res) {
    	// Look for logged in user in database to check if have appropriate access
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) throw err;

            if(!mainUser){
            	res.json({success: false, message: "User not found."});
            } else{
            	// Check if logged in user has editing privileges
                if (mainUser.permissions === 'Admin' || mainUser.permissions === 'Mod') {
                	
                	// Find the user document with the matching id,
                	// update this document with the new data.
            	    User.findOneAndUpdate({_id: req.body._id},
				        {  
				            $set: {
				                username: req.body.username,
				                email: req.body.email,
				                permissions: req.body.permissions,
				                firstname: req.body.firstname,
	            				lastname: req.body.lastname,
				            }
				        }, function(err, user) {
				            if (err)
				                res.send(err);

				            if (user) {
				            	res.json({success: true, message: 'User updated'});
				          
				            } else {
				                res.json({message: 'User does not exist'});
				            }
				        });

                } else {
                	res.json({success: false, message: "User does not have permission to edit."});
                }
            }
        });

    });

    router.get('/photos/:username', function(req, res){
    	var username = req.params.username;
    	var dir = './public/assets/uploads/' + username;
		fs.readdir(__dirname + dir, (err, files) => {
		   console.log('filenames:');
		   if(files){
			  files.forEach(file => {
			    console.log(file);
			  });
			  res.json({success: true, message: 'Photos found', files: files});

		   }else{
		   	res.json({success: false, message: 'Not photos found'});
		   }
		});
		
    });
	

	// single file uploads to server
	var upload = multer({
	    storage: multer.diskStorage({
		    destination: function(req, file, cb) {
		        cb(null, './public/assets/uploads/');
		    },
		    filename: function(req, file, cb) {
		    	// Check whether the file uploaded is either .png, .jpeg, or .jpg formats
		        if (!file.originalname.match(/\.(png|jpeg|jpg)$/i)) {
		            var err = new Error();
		            err.code = 'filetype';
		            return cb(err);
		        } else {
		            cb(null, Date.now() + "_" + file.originalname);
		        }
		    }
		}),
	    limits: { fileSize: 25000000 } // max file size of 10MB.
	}).single('profilePic');

	// Multiple file uploads
	var multiUpload = multer({
		storage: multer.diskStorage({
		    destination: function(req, file, cb) {
		        cb(null, './public/assets/uploads/');
		    },
		    filename: function(req, file, cb) {

		    // Check whether the files uploaded is in the expected formats
		    if (!file.originalname.match(/\.(png|jpeg|jpg|mp4|mpg|mpeg|mp4|mov|avi|vlc|wmv)$/i)) {
		             var err = new Error();
		             err.code = 'filetype';
		             return cb(err);
		        } else {
		            cb(null, Date.now() + "_" + file.originalname);
		        }
		    }
		})
	}).array('gallery', 25);

	// Route to handle uploads to server.
	// This route uploads the media t the user's uploads file on the server and then
	// returns the list of file names back to the client side.
	router.post('/uploadToGallery', function(req, res) {
		var username = req.decoded.username;
	    multiUpload(req, res, function(err) {
	        if (err) {
	            if (err.code === 'LIMIT_FILE_SIZE') {
	                res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
	            } else if (err.code === 'filetype') {
		            res.json({ success: false, message: 'Filetype is invalid. Must be either a png, jpeg, jpg, mp4, mpg, mpeg, mp4, mov, avi, vlc, wmv format.' });
	            } else {
	                res.json({ success: false, message: 'Unable to upload file'});
	            }
	        } else {
	            if (!req.files) {
	                res.json({ success: false, message: 'No file was selected' });
	            } else {

	            	var newUploadsToGallery = [];
	            	// After the file has been uploaded successfully, move all to the user's folder.
	            	for (var i = 0, len = req.files.length; i < len; i++) {
	            		newUploadsToGallery.push(req.files[i].filename);
			            fs.move('./public/assets/uploads/' + req.files[i].filename, './public/assets/uploads/'+ username +'/' + req.files[i].filename, { overwrite: true }, err => {
						  if (err) throw err;
						});
			        }
	                res.json({ success: true, message: 'Files uploaded!', files : newUploadsToGallery });
	            }
	        }
	    });
	});

		// Route to handle uploads to server.
	router.post('/upload/:username', function(req, res) {
		var username = req.params.username;
	    upload(req, res, function(err) {
	        if (err) {
	            if (err.code === 'LIMIT_FILE_SIZE') {
	                res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
	            } else if (err.code === 'filetype') {
		            res.json({ success: false, message: 'Filetype is invalid. Must be either a .png, .jpg, or .jpeg format.' });
	            } else {
	                res.json({ success: false, message: 'Unable to upload file' });
	            }
	        } else {
	            if (!req.file) {
	                res.json({ success: false, message: 'No file was selected' });
	            } else {
	            	// After the file has been uploaded successfully, move it to the user's folder.
	                fs.move('./public/assets/uploads/' + req.file.filename, './public/assets/uploads/'+ username +'/' + req.file.filename, { overwrite: true }, err => {
					  if (err) throw err;
					})
	                res.json({ success: true, message: 'File uploaded!', filename : req.file.filename });
	            }
	        }
	    });
	});

	router.put('/addToGallery', function(req,res){
		var newPhotos = req.body;
		console.log("newPhotos: " + newPhotos);
		
		User.findOneAndUpdate({username: req.decoded.username},
		    { $push: { gallery: { $each: newPhotos } } },
		    {safe: true, upsert: true},
		    function(err, thisUser) {
		        if (err) throw err;
		        if(!thisUser){
					res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    res.json({ success: true, user: thisUser }); // Return the user to be editted
	            }
		});
	});

	router.put('/removeFromGallery/:photo', function(req,res){
		var photo = req.params.photo;
		User.findOneAndUpdate({username: req.decoded.username},
			{$pull: {gallery: photo}},
			function(err, mainUser){
				if (err) throw err;
                // Check if user to edit is in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    res.json({ success: true, message: "Photo removed from gallery." }); // Return the user to be editted
                }
			});
	});
	router.put('/follow', function(req,res){
		var username = req.body.username;
		var mainUser = req.decoded.username;
    	User.findOneAndUpdate(
		    {username: username},
		    {$push: {followers: {_id: req.decoded._id, username: mainUser, dateOfFollow: Date.now()}}},
		    {safe: true, upsert: true},
		    function(err, thisUser) {
		        if (err) throw err;

                // Check if user to edit is in database
                if (!thisUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {

                	// Once the mainUSer's username has successfully been added to this
                	// user's followers list, add this user's username to the mainUser's following list.
                	User.findOneAndUpdate(
					    {username: mainUser},
					    {$push: {following: {_id: req.body._id, username: username, dateOfFollow: Date.now()}}},
					    {safe: true, upsert: true},
					    function(err, mainUser) {
					        if (err) throw err;
			                // Check if user to edit is in database
			                if (!mainUser) {
			                    res.json({ success: false, message: 'No user found' }); // Return error
			                } else {
			                    res.json({ success: true, user: mainUser }); // Return the user to be editted
			                }
					});
                }
		});
	});

	router.put('/unfollow',function(req,res){
		var thisUsername = req.body.username;
		var mainUsername = req.decoded.username;
		console.log("main id: " + req.decoded._id + " main username: " + req.decoded.username);
		console.log("this id: " + req.body._id + " this username: " + req.body.username);

		User.findOneAndUpdate(
		    {username: thisUsername},
		    {$pull: {followers: {_id: req.decoded._id}}},
		    function(err, thisUser) {
		        if (err) throw err;

                // Check if user to edit is in database
                if (!thisUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                	// Once the mainUSer's username has successfully been added to this
                	// user's followers list, add this user's username to the mainUser's following list.
                	User.findOneAndUpdate(
					    {username: mainUsername},
					    {$pull: {following: {_id: req.body._id}}},
					    function(err, mainUser) {
					        if (err) throw err;
			                // Check if user to edit is in database
			                if (!mainUser) {
			                    res.json({ success: false, message: 'No user found' }); // Return error
			                } else {
			                    res.json({ success: true, user: mainUser }); // Return the user to be editted
			                }
					});
                }
		}); 
	});

	router.get('/exercises', function(req, res){
		// this calls the exercises for a list of exercises grouped by the musclegroup field.
		Exercise.aggregate([
			{ $group: {
	           	"_id":  "$musclegroup",
	           	"exercises": { $push:  { _id: "$_id", name: "$name"} }}
			}],
			function(err, doc){
				console.log("fetched exercises for each musclegorup aggregate successfully ");

				if (err) throw err;

                if (!doc) {
                    res.json({ success: false, message: 'No exercises found' }); // Return error
                } else {
                    res.json({ success: true, exercises: doc }); // Return the user to be editted
                }
			}
		);

	});

	router.get('/exercise/:id', function(req,res){
		Exercise.findOne({ _id: req.params.id}, function(err,exercise){
			if(err) throw err;

			if(exercise){
				res.json({success: true, exercise: exercise});
			} else{
				res.json({success: false, message: "No exercise found"});
			}

		});
	});


	// Call to edit the exercise with id and update with the exercise data.
	// Guilded exercises can only be updated by Admins.
	// Non-Guilded exercises can only be updated by the creator. exercise.createdby = user._id
	router.put('/editExercise', function(req,res){
		User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) throw err;
            if(!mainUser){
            	res.json({success:false, message:"No user found!"});
            } else{
            	if(req.body.isGuilded){
            		if (mainUser.permissions === 'Admin' || mainUser.permissions === 'Mod') {
            			Exercise.findOneAndUpdate({_id: req.body._id},
            			{
            				$set: {
            					name : req.body.name,
            					musclegroup: req.body.musclegroup,
            					type: req.body.type,
            					description: req.body.description
            				}
            			}, function(err, doc){
            				if(err) throw err;
            				if(doc){
            					Exercise.findOne({_id: req.body._id}, function(err,exercise){
									if(err) throw err;
									if(exercise) {
										res.json({success: true, exercise: exercise, message: 'Exercise updated successfully!'});
									} 
									else {
										res.json({ success: false, message: 'Exercise does not exists.'});
									}
								});
            				} else {
            					res.json({success:false, message: 'Exercise was not updated.'});
            				}

            			});
	                } else  {
	                	res.json({success: false, message: 'User does not have permission to edit this Exercise.'});
	                }
            	} else {
            		if (req.body.createdBy == req.decoded._id) {
            			Exercise.findOneAndUpdate({_id: req.body._id},
            			{
            				$set: {
            					name : req.body.name,
            					musclegroup: req.body.musclegroup,
            					type: req.body.type,
            					description: req.body.description
            				}
            			}, function(err, doc){
            				if (err) throw err;
            				if(doc){
            					Exercise.findOne({_id: req.body._id}, function(err,exercise){
									if(err) throw err;
									if(exercise) {
										res.json({success: true, exercise: exercise, message: 'Exercise updated successfully!'});
									} 
									else {
										res.json({ success: false, message: 'Exercise does not exists.'});
									}
								});
            				} else {
            					res.json({ success:false, message: "Exercise does not exist!"});
            				}

            			});
            		} else { res.json({ success:false, message: "User cannot edit this exercise!"}); }
            	}
            }
    	});

	});

	// Uploads the files to the uploads/exercises folder on the server.
	router.post('/uploadExerciseImages', function(req, res) {
	    multiUpload(req, res, function(err) {
	        if (err) {
	        	console.log('err');
	            if (err.code === 'LIMIT_FILE_SIZE') {
	                res.json({ success: false, message: 'File size is too large. Max limit is 10MB' });
	            } else if (err.code === 'filetype') {
		            res.json({ success: false, message: 'Filetype is invalid. Must be either a png, jpeg, jpg, mp4, mpg, mpeg, mp4, mov, avi, vlc, wmv format.' });
	            } else {
	                res.json({ success: false, message: 'Unable to upload file'});
	            }
	        } else {
	            if (!req.files) {
	                res.json({ success: false, message: 'No file was selected' });
	            } else {
	            	var newUploadsToGallery = [];
	            	// After the file has been uploaded successfully, move all to the user's folder.
	            	for (var i = 0, len = req.files.length; i < len; i++) {
	            		newUploadsToGallery.push(req.files[i].filename);
			            fs.move('./public/assets/uploads/' + req.files[i].filename, './public/assets/uploads/exercises/' + req.files[i].filename, { overwrite: true }, err => {
						  if (err) throw err;
						});
			        }
	                res.json({ success: true, message: 'Files uploaded!', files : newUploadsToGallery });
	            }
	        }
	    });
	});

	router.put('/addImagesToExercise', function(req, res){
		Exercise.findOneAndUpdate({_id: req.body._id},
			{ $push: { images: { $each: req.body.files }}},
			function(err, doc){
				if(err) throw err;
				if(doc){
					Exercise.findOne({_id: req.body._id}, function(err,exercise){
						if(err) throw err;
						if(exercise) {
							res.json({success: true, exercise: exercise});
						} 
						else {
							res.json({ success: false, message: 'Exercise does not exists.'});
						}
					});
				} else {
					res.json({ success: false, message: 'Images not added to Exercise.'});
				}
			});
	});

	router.post('/createExercise', function(req,res){
		console.log("/api/createExercise called!");
		var exercise = new Exercise();
		exercise.name = req.body.name;
		exercise.type = req.body.selectedExerciseType;
		exercise.musclegroup = req.body.selectedMusclegroup;
		exercise.dateCreated = todaysDate();
		exercise.description = req.body.description;
		exercise.isGuilded = req.body.isGuilded;
		exercise.createdBy = req.decoded._id;
		exercise.images = req.body.images;
		

		if (exercise.name == '' || exercise.name == null || exercise.type == '' || exercise.type== null || exercise.musclegroup == '' || exercise.musclegroup == null || exercise.description == '' || exercise.description == null ){
			res.json({ success: false, message:'ERROR! Ensure all values have been provided.' });
		} else {
			exercise.save(function(err){
				if (err){
					if (err.errors != null){
						if(err.errors.name){
							res.json({ success: false, message: err.errors.name.message });
						} else if(err.errors.type){
							res.json({ success: false, message: err.errors.type.message });
						} else if(err.errors.musclegroup){
							res.json({ success: false, message: err.errors.musclegroup.message });
						} else if(err.errors.description){
							res.json({ success: false, message: err.errors.description.message });
						} else {
							res.json({ success: false, message: err.message  });
						}
					} else if (err){
						// Duplicate error code
						if (err.code == 11000){
							res.json({success: false, message: "Exercise already exists."});
						} else {
							res.json({success: false, message: err.message});
						}
					}
				} else {
					res.json({ success: true, message:'Exercise succesfully created!' });
				}
			});

		}
	});

	return router;

};

