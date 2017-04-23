 angular.module('exerciseServices', [])

.factory('Exercise', function($http){

	var exerciseFactory = {};

	exerciseFactory.getExercises = function(){
		return $http.get('/api/exercises');
	};

	exerciseFactory.getExerciseWithId = function(id){
		return $http.get('/api/exercise/' + id);
	};

	exerciseFactory.getMuscleGroups = function(){
		return $http.get('/api/musclegroups');
	};

	exerciseFactory.getexerciseTypes = function(){
		return $http.get('/api/exerciseTypes');
	};

	exerciseFactory.create = function(data){
		console.log("createExercise called!");
		return $http.post('/api/createExercise', data);
	};

	exerciseFactory.removeExerciseWithId = function(id){
		return $http.delete('/api/exercise/' + id);
	};

	exerciseFactory.editExercise = function(data){
		return $http.put('/api/editExercise', data);
	};

	exerciseFactory.uploadExerciseImages = function(files){
        var fd = new FormData();
        for (var i = 0, len = files.length; i < len; i++) {
            fd.append("gallery", files[i]);
        }
        return $http.post('/api/uploadExerciseImages', fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        });
    };

    // Adds the newly uploaded filenames to the Exercise's image list.
    exerciseFactory.addImagesToExercise = function(data){
    	return $http.put('/api/addImagesToExercise', data);
    };

	return exerciseFactory;
});