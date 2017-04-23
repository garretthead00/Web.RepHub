angular.module('profileController', [])


.controller('profileCtrl', function($scope, $routeParams, User, $timeout, $window, $route) {

    var app = this;
    var numberOfYears = (new Date()).getYear() - 13; // get this year minus 13 b/c users must be atleast 13 years old.
    var years = $.map($(Array(numberOfYears)), function (val, i) { return i + 1900; });
    var months = $.map($(Array(12)), function (val, i) { return i + 1; });
    var days = $.map($(Array(31)), function (val, i) { return i + 1; });

    var isLeapYear = function () {
        var year = $scope.SelectedYear || 0;
        return ((year % 400 === 0 || year % 100 !== 0) && (year % 4 === 0)) ? 1 : 0;
    };
    var getNumberOfDaysInMonth = function () {
        var selectedMonth = $scope.SelectedMonth || 0;
        return 31 - ((selectedMonth === 2) ? (3 - isLeapYear()) : ((selectedMonth - 1) % 7 % 2));
    };

    // This function converts a date in ISO format from the db to a string "mm/dd/yyyy".
    var isoDateToString = function(isoDate){

        date = new Date(isoDate);
        year = date.getFullYear();
        month = date.getMonth()+1;
        dt = date.getDate();
        if (dt < 10) {
          dt = '0' + dt;
        }
        if (month < 10) {
          month = '0' + month;
        }
        $scope.SelectedYear = year;
        $scope.SelectedMonth = month;
        $scope.SelectedDay = dt;

        return month + "/" + dt + "/" + year;
    };
    
    $scope.UpdateNumberOfDays = function () {
        $scope.NumberOfDays = getNumberOfDaysInMonth();
    };

    $scope.createDateOfBirth = function(){
        $scope.dateOfBirth = $scope.SelectedMonth + " / " + $scope.SelectedDay + " / " + $scope.SelectedYear;
    };

    $scope.isMainUser = false;
    $scope.NumberOfDays = 31;
    $scope.Years = years.reverse();
    $scope.Days = days;
    $scope.Months = months;
    $scope.Years.unshift("Year");
    $scope.Days.unshift("Day");
    $scope.Months.unshift("Month");
    $scope.isoDOB = false;

    // Function: get the user that needs to be edited
    User.getUserProfile($routeParams.username).then(function(data) {
        if (data.data.success) {
        	$scope._id = data.data.user._id;
            $scope.firstname = data.data.user.firstname; // Display user's firstname in scope
            $scope.lastname = data.data.user.lastname; // Display user's firstname in scope
            $scope.email = data.data.user.email; // Display user's e-mail in scope
            $scope.username = data.data.user.username; // Display user's username in scope
            $scope.permission = data.data.user.permissions; // Display user's permission in scope
            $scope.isMainUser = data.data.isMainUser;
            $scope.isFollowing = data.data.isFollowing;
            $scope.dateOfBirth = data.data.user.dateOfBirth;
            $scope.profileImage = data.data.user.profileImage;
            $scope.following = data.data.user.following;
            $scope.followers = data.data.user.followers;
            $scope.gallery = data.data.user.gallery;
            $scope.weightUnit = data.data.user.weightUnit;
            $scope.heightUnit = data.data.user.heightUnit;
            $scope.distanceUnit = data.data.user.distanceUnit;
            $scope.calorieUnit = data.data.user.calorieUnit;
            $scope.weight = ($scope.weightUnit == 'lbs') ? data.data.user.weight.lbs : data.data.user.weight.kg;
            $scope.height = ($scope.heightUnit == 'in') ? data.data.user.height.in : data.data.user.height.cm;
            if(data.data.user.dateOfBirth){
                $scope.isoDOB = isoDateToString(data.data.user.dateOfBirth);
            }
        }
    });

    $scope.setWeightUnit = function(event){
        $scope.weightUnit = event.currentTarget.value;
    };
    $scope.setHeightUnit = function(event){
        $scope.heightUnit = event.currentTarget.value;
    };
    $scope.setDistanceUnit = function(event){
        $scope.distanceUnit = event.currentTarget.value;
    };
    $scope.setCalorieUnit = function(event){
        $scope.calorieUnit = event.currentTarget.value;
    };
    $scope.isWeightActive = function(type) {
        return type === $scope.weightUnit;
    };
    $scope.isHeightActive = function(type) {
        return type === $scope.heightUnit;
    };
    $scope.isDistanceActive = function(type) {
        return type === $scope.distanceUnit;
    };
    $scope.isCalorieActive = function(type) {
        return type === $scope.calorieUnit;
    };

    var convertLBS_To_KG = function(lbs){
        return lbs * 0.45359237;
    };
    var convertKG_To_LBS = function(kg){
        return kg * 2.2046226218487757;
    };
    var convertIN_To_CM = function(inches){
        return inches * 2.54;
    };
    var convertCM_To_IN = function(cm){
        return cm * 0.39370079;
    };
    // This function is fired whenever the usr clicks the "update" button on the 
    $scope.updateProfileData = function(){

        var tempWeight = {
            lbs: null,
            kg: null
        };
        var tempHeight = {
            in: null,
            cm: null
        };
        if($scope.weightUnit == 'lbs'){
            tempWeight.lbs = $scope.weight;
            tempWeight.kg = convertLBS_To_KG($scope.weight);
        } else {
            tempWeight.lbs = convertKG_To_LBS($scope.weight); 
            tempWeight.kg = $scope.weight;
        }
        
        if($scope.heightUnit == 'in'){
            tempHeight.in = $scope.height;
            tempHeight.cm = convertIN_To_CM($scope.height);
        } else {
            tempHeight.in =convertCM_To_IN($scope.height); 
            tempHeight.cm = $scope.height;
        }

        var profileData = {
            firstname : $scope.firstname,
            lastname : $scope.lastname,
            email : $scope.email,
            dateOfBirth : $scope.dateOfBirth,
            profileImage : $scope.profileImage,
            weight: tempWeight,
            height: tempHeight,
            weightUnit: $scope.weightUnit,
            heightUnit: $scope.heightUnit,
            calorieUnit: $scope.calorieUnit,
            distanceUnit: $scope.distanceUnit
            
        };
        User.updateProfile(profileData).then(function(data){
            if(data.data.success){
                $scope._id = data.data.user._id;
                $scope.firstname = data.data.user.firstname; // Display user's firstname in scope
                $scope.lastname = data.data.user.lastname; // Display user's firstname in scope
                $scope.email = data.data.user.email; // Display user's e-mail in scope
                $scope.username = data.data.user.username; // Display user's username in scope
                $scope.permission = data.data.user.permissions; // Display user's permission in scope
                $scope.isMainUser = data.data.isMainUser;
                $scope.isFollowing = data.data.isFollowing;
                $scope.dateOfBirth = data.data.user.dateOfBirth;
                $scope.profileImage = data.data.user.profileImage;
                $scope.following = data.data.user.following;
                $scope.followers = data.data.user.followers;
                $scope.gallery = data.data.user.gallery;
                $scope.weight = data.data.user.weight;
                $scope.height = data.data.user.height;
                $scope.weightUnit = data.data.user.weightUnit;
                $scope.heightUnit = data.data.user.heightUnit;
                $scope.distanceUnit = data.data.user.distanceUnit;
                $scope.calorieUnit = data.data.user.calorieUnit;
                if(data.data.user.dateOfBirth){
                    $scope.isoDOB = isoDateToString(data.data.user.dateOfBirth);
                }
                $route.reload();

            } else {
                console.log("User profile not updated.");
            }
        });
    };

    // Handles uploading or updating the user's profile pic
    $scope.file = {};
    $scope.message = false;
    $scope.alert = '';

    $scope.uploadProfileImage = function(username) {
        var fileData = {
            username : username,
            file : $scope.file
        };

        $scope.uploading = true;
        User.uploadProfileImage(fileData).then(function(data) {
            if (data.data.success) {
                $scope.uploading = false;
                $scope.alert = 'alert alert-success';
                $scope.message = data.data.message;
                $scope.file = {};
                $scope.profileImage = data.data.filename;

                var tempWeight = {
                    lbs: null,
                    kg: null
                };
                var tempHeight = {
                    in: null,
                    cm: null
                };
                if($scope.weightUnit == 'lbs'){
                    tempWeight.lbs = $scope.weight;
                    tempWeight.kg = convertLBS_To_KG($scope.weight);
                } else {
                    tempWeight.lbs = convertKG_To_LBS($scope.weight); 
                    tempWeight.kg = $scope.weight;
                }
                
                if($scope.heightUnit == 'in'){
                    tempHeight.in = $scope.height;
                    tempHeight.cm = convertIN_To_CM($scope.height);
                } else {
                    tempHeight.in =convertCM_To_IN($scope.height); 
                    tempHeight.cm = $scope.height;
                }

                var profileData = {
                    firstname : $scope.firstname,
                    lastname : $scope.lastname,
                    email : $scope.email,
                    dateOfBirth : $scope.dateOfBirth,
                    profileImage : $scope.profileImage,
                    weight: tempWeight,
                    height: tempHeight,
                    weightUnit: $scope.weightUnit,
                    heightUnit: $scope.heightUnit,
                    calorieUnit: $scope.calorieUnit,
                    distanceUnit: $scope.distanceUnit
                    
                };
                User.updateProfile(profileData).then(function(data){
                    if(data.data.success){
                        $scope._id = data.data.user._id;
                        $scope.firstname = data.data.user.firstname; // Display user's firstname in scope
                        $scope.lastname = data.data.user.lastname; // Display user's firstname in scope
                        $scope.email = data.data.user.email; // Display user's e-mail in scope
                        $scope.username = data.data.user.username; // Display user's username in scope
                        $scope.permission = data.data.user.permissions; // Display user's permission in scope
                        $scope.isMainUser = data.data.isMainUser;
                        $scope.isFollowing = data.data.isFollowing;
                        $scope.dateOfBirth = data.data.user.dateOfBirth;
                        $scope.profileImage = data.data.user.profileImage;
                        $scope.following = data.data.user.following;
                        $scope.followers = data.data.user.followers;
                        $scope.gallery = data.data.user.gallery;
                        $scope.weightUnit = data.data.user.weightUnit;
                        $scope.heightUnit = data.data.user.heightUnit;
                        $scope.distanceUnit = data.data.user.distanceUnit;
                        $scope.calorieUnit = data.data.user.calorieUnit;
                        $scope.weight = ($scope.weightUnit == 'lbs') ? data.data.user.weight.lbs : data.data.user.weight.kg;
                        $scope.height = ($scope.heightUnit == 'in') ? data.data.user.height.in : data.data.user.height.cm;

                        if(data.data.user.dateOfBirth){
                            $scope.isoDOB = isoDateToString(data.data.user.dateOfBirth);
                        }
                        $route.reload();

                    } else {
                        console.log("User profile not updated.");
                    }
                });

            } else {
                $scope.uploading = false;
                $scope.alert = 'alert alert-danger';
                $scope.message = data.data.message;
                $scope.file = {};
            }
        });
    };

    $scope.photoChanged = function(files) {
        if (files.length > 0 && files[0].name.match(/\.(png|jpeg|jpg)$/i)) {
            $scope.uploading = true;
            var file = files[0];
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {
                $timeout(function() {
                    $scope.thumbnail = {};
                    $scope.thumbnail.dataUrl = e.target.result;
                    $scope.uploading = false;
                    $scope.message = false;
                });
            };
        } else {
            $scope.thumbnail = {};
            $scope.message = false;
        }
    };

    // GET THE FILE INFORMATION.
    // This function takes in the list of files and reads the contents of the specified files
    // using the FileReader. Then, the function pushes the files onto the galleryuploads array to be uploaded to the
    // user's gallery.
    $scope.galleryUploads = false;
    $scope.toggleUploadMenu = false; // toggles the photo/video upload menu.
    $scope.getFileDetails = function (e) {

        $scope.toggleUploadMenu = true; // make the upload menu visible.
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

    // This function adds all of the selected media files to the user's gallery.
    // Only allows photos (png, jpg, jpeg) and videos (mpg, mpeg, mp4, mov, avi, vlc, wmv).
    $scope.uploadToGallery = function(){

        var files = $scope.galleryUploads;
        $scope.uploading = true;
        User.uploadToGallery(files).then(function(data) {
            if(data.data.success){
                console.log("Files uploaded: " + data.data.message);
                $scope.uploading = false;
                $scope.galleryUploads = [];
                $scope.galleryThumbnails = [];
                $scope.file = {};
                
                // Add the returned file names to the user's gallery.
                var photos = data.data.files;
                User.addToGallery(photos).then(function(data){
                    if(data.data.success){
                        $scope.gallery = data.data.user.gallery;
                        $route.reload();
                    }
                });
            } else {
                $scope.uploading = false;
                $scope.file = {};
                $scope.galleryUploads = [];
                $scope.galleryThumbnails = [];
                console.log("Files not uploaded" + data.data.message);
            }
        });
    };

    // This function handles the follow action.
    $scope.followUser = function(){
        var userData = {
            _id: $scope._id,
            username: $scope.username
        };
        User.followUser(userData).then(function(data){
            if(data.data.success){
                $scope.isFollowing = true;          
                console.log("follow successful");
            } else {
                console.log("follow not successful");
            }
        });
    };

    // This function handles the unfollow action.
    $scope.unfollowUser = function(){
        
        var userData = {
            _id: $scope._id,
            username: $scope.username
        };
        User.unfollowUser(userData).then(function(data){
            if(data.data.success){
                $scope.isFollowing = false;
                console.log("unfollow successful");
            } else {
                console.log("unfollow not successful");
            }

        });
    };

    // removes the photos from the user's gallery.
    $scope.removePhoto = function(photo){
        //console.log("photoname: " + photo);
        User.removePhoto(photo).then(function(data){
            if(data.data.success){
                console.log("photo removed successfully");
                $route.reload();
            }else{
                console.log("photo removed unsuccessfully");
            }
        });
    };


});