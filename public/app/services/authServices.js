angular.module('authServices', [])


.factory('Auth', function($http, AuthToken){

	var authFactory = {};

	// Auth.login();
	// Logs the user into the application server using the input params.
	authFactory.login = function(loginData){
		return $http.post('/api/authenticate', loginData).then(function(data){
			AuthToken.setToken(data.data.token);
			return data;
		});
	};

	// Auth.getUser();
	authFactory.getUser = function(){
		if(AuthToken.getToken()){
			return $http.post('/api/me');
		} else {
			$q.reject({ message: 'User has no token.'});
		}
	};

	// Auth.logout
	// Logs the user out of the application server.
	authFactory.logout = function(){
		AuthToken.setToken();
	};

	// Auth.isLoggedIn();
	// Checks whether the user is currently logged in.
	authFactory.isLoggedIn = function(){
		if(AuthToken.getToken()){
			return true;
		} else {
			return false;
		}
	};

	return authFactory;
})

// Handles the user tokens for log in data.
// Helps manage the user's data while logged in.
.factory('AuthToken', function($window){
	var authTokenFactory = {};

	// AuthToken.setToken(token);
	// Sets or removes the authentication token into the browser's local storage.
	// If the token param is provided then set the token
	// Else remove the token.
	authTokenFactory.setToken = function(token){
		if(token){
			$window.localStorage.setItem('token', token);
		} else {
			$window.localStorage.removeItem('token');
		}
	};

	// AuthToken.getToken();
	// returns the token from the browser's localStorage.
	authTokenFactory.getToken = function(){
		return $window.localStorage.getItem('token');
	};

	return authTokenFactory;
})

// Checks for tokens on each page request so that tokens aren't lost.
.factory('AuthInterceptors', function(AuthToken){

	var authInterceptorsFactory = {};

	authInterceptorsFactory.request = function(config){
		var token = AuthToken.getToken();

		// if the token exists the assign the token to the headers.
		if (token) config.headers['x-access-token'] = token;

		return config;
	};

	return authInterceptorsFactory;
});