 angular.module('userServices', [])

.factory('User', function($http){

	var userFactory = {};

	// User.create()
	userFactory.create = function(userData){
		return $http.post('/api/users', userData);
	};

	// User.checkUsername(userData)
	userFactory.checkUsername = function(userData){
		return $http.post('/api/checkusername', userData);
	};

	// User.checkEmail(userData)
	userFactory.checkEmail = function(userData){
		return $http.post('/api/checkemail', userData);
	};

	userFactory.getPermission = function(){
		return $http.get('/api/permission');
	};
	userFactory.getUsers = function(){
		return $http.get('/api/management');
	};

	// Delete a user
    userFactory.deleteUser = function(username) {
        return $http.delete('/api/management/' + username);
    };

    // Get user with id
    userFactory.getUser = function(id) {
        return $http.get('/api/edit/' + id);
    };

    // Get user with id
    userFactory.getUserProfile = function(username) {
        return $http.get('/api/profile/' + username);
    };

    // Edit a user
    userFactory.editUser = function(userData) {
        return $http.put('/api/edit', userData);
    };

    userFactory.updateProfile = function(userData){
        return $http.put('/api/profile', userData);
    }

    // Adds a follower to the user's followedBy list
    userFactory.addFollower = function(username){

    };
    // Removes a follower to the user's followedBy list
    userFactory.removeFollower = function(username){

    };
    // Adds a username to the user's follow list
    userFactory.followUser = function(userData){
        return $http.put('/api/follow', userData);
    };

    // Removes a username to the user's follow list
    userFactory.unfollowUser = function(userData){
        return $http.put('/api/unfollow', userData);
    };

    // Gets all photos for the user with id.
    userFactory.getPhotos = function(username){
        return $http.get('/api/photos/' + username);
    };

    userFactory.uploadProfileImage = function(file) {
        
        var fd = new FormData();
        fd.append('profilePic', file.file.upload);
        var username = file.username;
        return $http.post('/api/upload/' + username, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        });
    };

    userFactory.uploadToGallery = function(files){

        var fd = new FormData();
        for (var i = 0, len = files.length; i < len; i++) {
            fd.append("gallery", files[i]);
        }
        return $http.post('/api/uploadToGallery', fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        });
    };

    userFactory.addToGallery = function(photos){
        return $http.put('/api/addToGallery', photos);
    };

    userFactory.removePhoto = function(photo){
        return $http.put('/api/removeFromGallery/' + photo);

    };

	return userFactory;
});