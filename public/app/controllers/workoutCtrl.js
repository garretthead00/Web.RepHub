angular.module('workoutController', ['workoutServices', 'exerciseServices'])


.controller('workoutCtrl', function($scope, $routeParams, User, $timeout, $window, $route, Workout, Exercise) {

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

});