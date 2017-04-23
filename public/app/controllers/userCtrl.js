angular.module('userControllers', ['userServices', 'authServices'])

.controller('signupCtrl', function($http, $location, $timeout, User, Auth){

	var app = this;

	this.signupUser = function(userData, valid){

		app.errorMsg = false;

		if (valid){
			// send POST to create the new user.
			// Then if the user account was created successfully auto-Login the user.
			User.create(app.userData).then(function(data){
				if(data.data.success){
					Auth.login(app.userData).then(function(data){
						if(data.data.success){
							app.successMsg = data.data.message + "...Redirecting.";
							$timeout(function(){
								$location.path('/profile');
								app.userData = '';
								app.successMsg = false;
							}, 2000);
						} else{
							app.errorMsg = data.data.message;
						}
					});
				} else{
					app.errorMsg = data.data.message;
				}
			});
		} else {
			app.errorMsg = "Form submitted with errors.";
		}
	};

	this.checkUsername = function(userData){
		app.usernameMsg = false;
		app.isUsernameInvalid = false;

		User.checkUsername(app.userData).then(function(data){
			if(data.data.success){
				app.isUsernameInvalid = false;
				app.usernameMsg = data.data.message;
			} else {
				app.isUsernameInvalid = true;
				app.usernameMsg = data.data.message;
			}
		});
	};
	
	this.checkEmail = function(userData){
		app.emailMsg = false;
		app.isEmailInvalid = false;

		User.checkEmail(app.userData).then(function(data){
			if(data.data.success){
				app.isEmailInvalid = false;
				app.emailMsg = data.data.message;
			} else {
				app.isEmailInvalid = true;
				app.emailMsg = data.data.message;
			}
		});
	};
})

.directive('match', function(){
	return {
		restrict : 'A',
		controller: function($scope){

			$scope.confirmed = false;

			$scope.doConfirm = function(values){
				values.forEach(function(el){
					if($scope.confirm == el){
						$scope.confirmed = true;
					} else {
						$scope.confirmed = false;
					}
				});
			}
		},
		link: function(scope, element, attrs){
			attrs.$observe('match', function(){
				scope.matches = JSON.parse(attrs.match);
				scope.doConfirm(scope.matches);
			});
			scope.$watch('confirm', function(){
				scope.matches = JSON.parse(attrs.match);
				scope.doConfirm(scope.matches);
			});
		}
	}
});