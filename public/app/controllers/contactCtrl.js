angular.module('rephubApp').controller('contactMeCtrl', ['$scope' , '$http', function($scope, $http){

	//console.log("Hello from contactMeCtrl!");


	$scope.submitMessage = function(userInfo){
		console.log("submit message called");

			$scope.message = {
				name: userInfo.name,
				email: userInfo.email,
				message: userInfo.message
			};
			console.log("Message recieved : " + $scope.message.name + " " + $scope.message.email);

			$http.post('/contactMessage', $scope.message).success(function(response){
				console.log("post response success");
				console.log(response);
				$scope.userInfo = "";
			});
		};


}]);