angular.module('fileModelDirective',[])

.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            // Parse the file.
            var parsedFile = $parse(attrs.fileModel); // Getter
            var parsedFileSetter = parsedFile.assign; // Setter

            // Watches the element and updates the scope with the new parsed file.
            element.bind('change', function() {
                scope.$apply(function() {
                    parsedFileSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);