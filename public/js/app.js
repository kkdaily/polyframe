var app = angular.module("app", ["ui.router"]);
 
app.config([
        "$locationProvider",
        "$stateProvider",
        "$urlRouterProvider",
        function ($locationProvider, $stateProvider, $urlRouterProvider) {
        
        //set to hashbang mode for github hosting
        $locationProvider.html5Mode(false);
 
        $stateProvider
            .state("home", {
                url: "/",
                templateUrl: "public/views/home.html"
            })
            .state("editor", {
                url: "/editor",
                templateUrl: "public/views/editor.html",
                controller: "EditorCtrl"
            })
            .state("404", {
                templateUrl: "public/views/404.html"
            });
    
        //redirect to 404 page if none of the above url extensions are given
        $urlRouterProvider.otherwise(function ($injector, $location) {
            console.log("otherwise");
            var $state = $injector.get('$state');
            $state.go('404');
        });
 
    }]);

//allow input file to be read by angular
app.directive("fileread", [function () {
  return {
    scope: {
      fileread: "="
    },
    link: function (scope, element, attributes) {
      element.bind("change", function (changeEvent) {
        var reader = new FileReader();
          reader.onload = function (loadEvent) {
            scope.$apply(function () {
              scope.fileread = loadEvent.target.result;
            });
          }
        reader.readAsDataURL(changeEvent.target.files[0]);
      });
    }
  }
}]);
