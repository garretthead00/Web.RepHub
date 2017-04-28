angular.module('exerciseController', ['exerciseServices'])

.controller('exerciseCtrl', function(Exercise, $scope){

    $scope.exercises = [];
    $scope.selectedExercise = {};
    Exercise.getExercises().then(function(data){
        if(data.data.success){
            $scope.exercises = data.data.exercises;
            // set the default exercise to display. First exercise in the list.
            Exercise.getExerciseWithId($scope.exercises[0].exercises[0]._id).then(function(data){
                if(data.data.success){
                    $scope.selectedExercise = data.data.exercise;
                } else {
                    console.log("No exercise returned!");
                }
            });
        } else{
            console.log("Exercises returned unsuccessfully");
        }
    });

    
    $scope.showExercise = function(exerciseID){
        $scope.selectedExercise.images = [];
        Exercise.getExerciseWithId(exerciseID).then(function(data){
            if(data.data.success){
                $scope.selectedExercise = data.data.exercise;
            } else {
                console.log("No exercise returned!");
            }
        });
    };

    // function to remove the exercise from the db.
    $scope.removeExercise = function(exerciseID){

    }
})

.controller('editExerciseCtrl', function(Exercise, $scope, $routeParams, $timeout, $route, $window) {
	
	var app = this;
	$scope.exerciseToEdit = {};

	// GET THE FILE INFORMATION.
    // This function takes in the list of files and reads the contents of the specified files
    // using the FileReader. Then, the function pushes the files onto the galleryuploads array to be uploaded to the
    // user's gallery.
    $scope.galleryUploads = false;
    $scope.getFileDetails = function (e) {

        $scope.galleryUploads = [];
        $scope.galleryThumbnails = [];
        $scope.$apply(function () {

            // STORE THE FILE OBJECT IN AN ARRAY.
            // Using fileReader fill the galleryThumbnails with the target results
            // which display the list of file items back to the user.
            for (var i = 0; i < e.files.length; i++) {
                if (e.files[0].name.match(/\.(png|jpeg|jpg)$/i)) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(e.files[i]);
                    fileReader.onload = function(file) {
                        $timeout(function() {
                            $scope.galleryThumbnails.push(file.target.result);
                        });
                    };
                    $scope.galleryUploads.push(e.files[i]);
                }
            }
        });
    };

	// get the data for the exercise 
	Exercise.getExerciseWithId($routeParams.id).then(function(data){
		if(data.data.success) {
			$scope.exerciseToEdit = data.data.exercise;
			$scope.selectedMusclegroup = $scope.exerciseToEdit.musclegroup;
			$scope.selectedExerciseType = $scope.exerciseToEdit.type;
		} else {
			console.log("No exercise returned from db");
		}
	});

	this.edit = function(valid){

        if (valid){

            $scope.uploading = true;
            $scope.exerciseToEdit.musclegroup = $scope.selectedMusclegroup;
            $scope.exerciseToEdit.type = $scope.selectedExerciseType;
            console.log("name: " + $scope.exerciseToEdit.name);
            console.log("type: " + $scope.exerciseToEdit.type);
            console.log("musclegroup: " + $scope.exerciseToEdit.musclegroup);
    		Exercise.editExercise($scope.exerciseToEdit).then(function(data){
            	if (data.data.success){
            		$scope.exerciseToEdit = data.data.exercise;
                    $scope.selectedMusclegroup = $scope.exerciseToEdit.musclegroup;
                    $scope.selectedExerciseType = $scope.exerciseToEdit.type;

                    // if new images are to be uploaded
                    if($scope.galleryUploads.length > 0){
                        var files = $scope.galleryUploads;
                        Exercise.uploadExerciseImages(files).then(function(uploadData){
                            if(uploadData.data.success){
                                console.log("Images uploaded!");
                                $scope.galleryUploads = [];
                                $scope.galleryThumbnails = [];
                                $scope.files = {};
                                var exerciseData = {
                                    _id: $scope.exerciseToEdit._id,
                                    files: uploadData.data.files
                                };
                                Exercise.addImagesToExercise(exerciseData).then(function(addData){
                                    if(addData.data.success){
                                        $scope.exerciseToEdit = addData.data.exercise;
                                        $scope.selectedMusclegroup = $scope.exerciseToEdit.musclegroup;
                                        $scope.selectedExerciseType = $scope.exerciseToEdit.type;
                                        $scope.successMsg = data.data.message;
                                        
                                    } else {
                                        console.log("Images not added to User's list");
                                        $scope.errorMsg = data.data.message;
                                    }
                                });
                            } else {
                                console.log("Images not uploaded");
                                $scope.errorMsg = data.data.message;
                                $scope.galleryUploads = [];
                                $scope.galleryThumbnails = [];
                                $scope.files = {};
                            }
                        });
                    }
                    $scope.successMsg = data.data.message;
            	} else {
                    $scope.errorMsg = data.data.message;
                }
            });
            $scope.uploading = false;
        } else {
            $scope.errorMsg = "Form is not valid.";
        }

	};
})

.controller('createExerciseCtrl', function(Exercise, $scope, $timeout) {
	console.log("Hello from createExerciseCtrl");

    var app = this;
    $scope.uploading = false;
    $scope.exercise = {};

    // GET THE FILE INFORMATION.
    // This function takes in the list of files and reads the contents of the specified files
    // using the FileReader. Then, the function pushes the files onto the galleryuploads array to be uploaded to the
    // user's gallery.
    $scope.galleryUploads = false;
    $scope.getFileDetails = function (e) {

        $scope.galleryUploads = [];
        $scope.galleryThumbnails = [];
        $scope.$apply(function () {

            // STORE THE FILE OBJECT IN AN ARRAY.
            // Using fileReader fill the galleryThumbnails with the target results
            // which display the list of file items back to the user.
            for (var i = 0; i < e.files.length; i++) {
                if (e.files[0].name.match(/\.(png|jpeg|jpg)$/i)) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(e.files[i]);
                    fileReader.onload = function(file) {
                        $timeout(function() {
                            $scope.galleryThumbnails.push(file.target.result);
                        });
                    };
                    $scope.galleryUploads.push(e.files[i]);
                }
            }
        });
    };

    // Function to create the new exercise.
    this.create = function(){
        this.errorMsg = false;

        console.log("create!");
        console.log("exercise--");
        console.log("name: " + app.exercise.name);
        console.log("type: " + app.exercise.selectedExerciseType);
        console.log("musclegroup: " + app.exercise.selectedMusclegroup);
        console.log("description: " + app.exercise.description);
        Exercise.create(app.exercise).then(function(data){
            if(data.data.success){
                console.log("Exercise created!");
            } else {
                console.log("Exercise not created with err.msg: " + data.data.message);
                this.errorMsg = data.data.message;
            }
        });
    };
});