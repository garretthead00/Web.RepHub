 angular.module('workoutServices', [])

.factory('Workout', function($http){

	var workoutFactory = {};

	workoutFactory.getExercises = function(){
		return $http.get('/api/exercises');
	};

	workoutFactory.getExercise = function(id){
		return $http.get('/api/exercise/' + id);
	};

	return workoutFactory;
});