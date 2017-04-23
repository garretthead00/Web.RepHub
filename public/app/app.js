angular.module('rephubApp', ['rephubRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'managementController', 'profileController', 'fileModelDirective', 'checkImageDirective', 'workoutController', 'workoutServices', 'exerciseServices','exerciseController'])


// configure the app to intercept all http request with the AuthInterceptors factory.
.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
});