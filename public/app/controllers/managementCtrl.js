angular.module('managementController',[])

.controller('managementCtrl', function(User){
	
	
	var app = this;
	app.accessDenied = true;
	app.userDisplayLimit = 25; // sets the default limit of user documents to be displayed to the user.
	
	function getUsers(){

		User.getUsers().then(function(data){
			if(data.data.success){
				if(data.data.permission === "Admin" || data.data.permission === "Mod"){
					//console.log("permissions granted");
					app.users = data.data.users;
					app.accessDenied = false;
				} else{
					//console.log("no permissions granted");
					app.errorMsg = "Insufficient permission."
				}
			} else{
				app.errorMsg = data.data.message;
			}
		});
	}
	getUsers();

	// Allows to display all of the user data to the management table.
	app.showAll = function(){
		app.userDisplayLimit = undefined;
	};

	// Function: Delete a user
    app.deleteUser = function(username) {
        // Run function to delete a user
        User.deleteUser(username).then(function(data) {
            // Check if able to delete user
            if (data.data.success) {
                getUsers(); // Reset users on page
            } else {
                app.errorMsg = data.data.message; // Set error message
            }
        });
    };
})

.controller('editUserCtrl', function($scope, $routeParams, User, $timeout) {
    var app = this;

    
    // Function: get the user that needs to be edited
    User.getUser($routeParams.id).then(function(data) {
        // Check if the user's _id was found in database
        if (data.data.success) {
        	$scope._id = data.data.user._id;
            $scope.newFirstName = data.data.user.firstname; // Display user's first name in scope
            $scope.newLastName = data.data.user.lastname; // Display user's first name in scope
            $scope.newEmail = data.data.user.email; // Display user's e-mail in scope
            $scope.newUsername = data.data.user.username; // Display user's username in scope
            $scope.newPermission = data.data.user.permissions; // Display user's permission in scope
        } else {
            $scope.errorMsg = data.data.message; // Set error message
            $scope.alert = 'alert alert-danger'; // Set class for message
        }
    });

    app.edit = function(){
         app.errorMsg = false; // Clear any error messages
        app.disabled = true; // Lock form while processing
    	var userData = {};
    	userData._id = $scope._id;
    	userData.firstname = $scope.newFirstName;
        userData.lastname = $scope.newLastName;
    	userData.email= $scope.newEmail;
    	userData.username= $scope.newUsername;
    	userData.permissions= $scope.newPermission;
    	
    	User.editUser(userData).then(function(data){
            if (data.data.success) {
                $scope.successMsg = data.data.message;
                app.disabled = false;
            } else {
                $scope.errorMsg = data.data.message;
                app.disabled = false;
            }
    	});

    };

});