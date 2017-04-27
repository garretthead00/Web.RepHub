var app = angular.module('rephubRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){


	$routeProvider

	.when('/',{
		templateUrl: 'app/views/pages/home.html',
		authenticated: false
	})
	.when('/home',{
		templateUrl: 'app/views/pages/home.html',
		authenticated: false
	})
	.when('/about',{
		templateUrl: 'app/views/pages/about.html',
		authenticated: false
	})
	.when('/signup',{
		templateUrl: 'app/views/pages/users/signup.html',
		controller: 'signupCtrl',
		controllerAs: 'signup',
		authenticated: false
	})
	.when('/login',{
		templateUrl: 'app/views/pages/users/login.html',
		authenticated: false
	})
	.when('/logout',{
		templateUrl: 'app/views/pages/users/logout.html',
		authenticated: true
	})
	.when('/profile/:username',{
		templateUrl: 'app/views/pages/users/profile.html',
		controller: 'profileCtrl',
		controllerAs: 'profile',
		authenticated: true
	})
	.when('/management',{
		templateUrl: 'app/views/pages/management/management.html',
		controller: 'managementCtrl',
		controllerAs: 'management',
		authenticated: true,
		permission : ['Admin', 'Mod'] // restricts only admins and mods to view this page.

	})
	.when('/mod',{
		templateUrl: 'app/views/pages/management/mod.html',
		// controller: 'modCtrl',
		// controllerAs: 'mod',
		authenticated: true,
		permission : ['Admin', 'Mod'] // restricts only admins and mods to view this page.
		
	})
	.when('/edit/:id',{
		templateUrl: 'app/views/pages/management/editUser.html',
		controller: 'editUserCtrl',
		controllerAs: 'editUser',
		authenticated: true,
		permission : ['Admin', 'Mod'] // restricts only admins and mods to view this page.
		
	})
	.when('/workouts',{
		templateUrl: 'app/views/pages/workouts/workouts.html',
		controller: 'workoutCtrl',
		controllerAs: 'workouts',
		authenticated: true
		
	})
	.when('/exercises',{
		templateUrl: 'app/views/pages/exercises/exercises.html',
		controller: 'exerciseCtrl',
		controllerAs: 'exercises',
		authenticated: true
		
	})
	.when('/editExercise/:id',{
		templateUrl: 'app/views/pages/exercises/editExercise.html',
		controller: 'editExerciseCtrl',
		controllerAs: 'editExercise',
		authenticated: true
		
	})
	.when('/createExercise',{
		templateUrl: 'app/views/pages/exercises/createExercise.html',
		controller: 'createExerciseCtrl',
		controllerAs: 'createExercise',
		authenticated: true
		
	})
	.otherwise({ redirectTo: '/' });


	$locationProvider.html5Mode({
		enabled: true,
		requiredBase: false
	});
});

app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User){


	// Fire each time a route changes
	$rootScope.$on('$routeChangeStart', function(event, next, current){

		// Check if is a valid route
		if(next.$$route !== undefined){

			// If the route requires authentication,
			// prevent the user from accessing this route if the user is not logged in.
			if(next.$$route.authenticated === true){
				if(!Auth.isLoggedIn()){
					event.preventDefault();
					$location.path('/');
				}
				// check if the route requires permission.
				else if (next.$$route.permission) {
					User.getPermission().then(function(data){
						if (next.$$route.permission[0] !== data.data.permission){
							if (next.$$route.permission[1] !== data.data.permission){
								event.preventDefault();
								$location.path('/');
							}
						}
					});

				}

			}
			// If the route does not requires authentication,
			// prevent the user from accessing this route if the user is logged in.
			// else if (next.$$route.authenticated === false){
			// 	if(Auth.isLoggedIn()){
			// 		event.preventDefault(); // prevents user from going to the default route.
			// 		$location.path('/profile');
			// 	}

			// }
		}
	});

}]);