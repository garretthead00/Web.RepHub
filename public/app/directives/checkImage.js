
// This directive handles the user's profile picture.
// The displays the default user profile image in the case that the user has not yet uploaded a profile
// image to the server.
angular.module('checkImageDirective',[])

app.directive('checkImage', function() {

      return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.checkImage) {
              attrs.$set('src', '../assets/images/defaultProfilePic.png');
            }
          });
          attrs.$observe('ngSrc', function(value) {
            if (!value && attrs.checkImage) {
              attrs.$set('src', '../assets/images/defaultProfilePic.png');
            }
          });
        }
      }
    });