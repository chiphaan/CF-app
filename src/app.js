var app = angular.module('MyApp', ['ui.router', 'ngMaterial', 'ngCookies', 'ngMessages']);

app.service('UserService', function ($filter, $http) {
	var users = undefined;
	var queued = [];

	$http.get('./data/users.json').then(function (data) {
		if (angular.isDefined(data)) {
			users = data.data;
			processQueue();
		}
	});

	var processQueue = function () {
		angular.forEach(queued, function (callback) {
			callback();
		});
	}

	return {
		whenReady: function (callback) {
			if (typeof users === "undefined") {
				queued.push(callback);
			} else {
				callback();
			}
		},

		getUser: function (username) {
			return $filter('filter')(users, {username: username}, true)[0];
		}
	}
})

app.controller('AppController', function ($scope, $mdSidenav, $timeout, $cookies, $state, $http, $rootScope, $mdDialog) {
	var ctrl = this;

	ctrl.hospitals = [
		{
			name: "IGMH",
			location: "Male'",
			number: "3333333"
		},
		{
			name: "ADK",
			location: "Male'",
			number: "3333332"
		},
		{
			name: "Hulhumale' Hospital",
			location: "Hulhumale'",
			number: "3333331"
		}
	];

	ctrl.appoinments = [
		{
			dr: "Dr.Azeem",
			type: "Physician",
			date: "1/24/2017"
		},
		{
			dr: "Dr.John",
			type: "E.N.T",
			date: "1/30/2017"
		},
		{
			dr: "Dr.Thomas",
			type: "Speacialist",
			date: "02/02/2017"
		}
	];

	ctrl.today=function($scope){
		var dateee = ctrl.appoinments.dr;
		// angular.forEach(ctrl.appoinments,function(value, key){
		// 	var mydate=($scope.date - appointment.date);
		// 	console.log(mydate);
		// });
		console.log(dateee);
	}

	ctrl.openMenu = function ($mdOpenMenu, ev) {
		$mdOpenMenu(ev);
	}
	
	ctrl.goBack =function(){
		window.history.back();
	};

	ctrl.toggleNav = function () {
		$mdSidenav('left').toggle();
		var test= $rootScope.person;
		 $scope.profile = 'img/'+ test+'.jpg';
	}
	
	ctrl.moreMenu = function($mdOpenMenu, ev) {
	  $mdOpenMenu(ev);
	};

	ctrl.logout = function () {
		$cookies.remove('auth');
		$state.go('default.login');
		$rootScope.person =undefined;
	};

	ctrl.deleteHospital = function (hospital) {
		ctrl.hospitals.splice(ctrl.hospitals.indexOf(hospital), 1);
	}

	ctrl.deleteAppointment = function (appointment) {
		ctrl.appoinments.splice(ctrl.appoinments.indexOf(appointment), 1);
	}

	ctrl.newClinicModal = function (ev) {
		$mdDialog.show({
			controller: 'ClinicModalController as ctrl',
			templateUrl: 'views/clinicFormDialog.html',
			targetEvent: ev,
			clickOutsideToClose : true
		}).then(function(data) {
			ctrl.hospitals.push(data);
        }, function() {
			console.log('Cancelled!');
        });
	}
	ctrl.appointmentModal = function (ev) {
		$mdDialog.show({
			controller: 'appointmentModalController as ctrl',
			templateUrl: 'views/appointmentFormDialog.html',
			targetEvent: ev,
			clickOutsideToClose : true
		}).then(function(data) {
			ctrl.appoinments.push(data);
			console.log(data);
        }, function() {
			console.log('Cancelled!');
        });
	}
});

app.controller('appointmentModalController', function ($scope, $mdDialog) {
	var ctrl = this;
	
	ctrl.appointment= {};

	$scope.cancel = function () {
		$mdDialog.cancel();
	}

	$scope.save = function () {
		$mdDialog.hide(ctrl.appointment);
	}
});

app.controller('ClinicModalController', function ($scope, $mdDialog) {
	var ctrl = this;
	
	ctrl.hospital= {};

	$scope.cancel = function () {
		$mdDialog.cancel();
	}

	$scope.save = function () {
		$mdDialog.hide(ctrl.hospital);
	}
});

app.controller('LoginController', function ($rootScope, $scope, $state, $mdToast, $cookies, UserService) {
	var ctrl = this;
	ctrl.user = {};

	ctrl.authenticate = function () {
		var user = undefined;
		UserService.whenReady(function () {
			user = UserService.getUser(ctrl.user.username);

			

			if (user) {
				if (user.password == ctrl.user.password) {
					$cookies.put('auth', JSON.stringify(user));
					if ($rootScope.toState.name != undefined && $rootScope.toState.name != 'default.login') {
						$state.go($rootScope.toState.name);
					} else {
						$state.go('cf.home');
					}
				} else {
					
					$mdToast.show(
						$mdToast.simple()
						.textContent('Invalid Password!')
						.hideDelay(3000)
				    );
				}
			} else {

				$mdToast.show(
					$mdToast.simple()
					.textContent('Invalid Username!')
					.hideDelay(3000)
			    );
			}
		});
	}
});

app.config(function ($urlRouterProvider, $stateProvider, $mdThemingProvider) {
	$urlRouterProvider.otherwise('/home');

	$stateProvider
		.state('cf', {
			abstract: true,
			url: '',
			templateUrl: "views/main.html",
		})

		.state('default', {
			abstract: true,
			url: '',
			templateUrl: "views/default.html",
		})

		.state('cf.home', {
			url: '/home',
			templateUrl: "views/home.html"
		})

		.state('cf.information', {
			url: '/information',
			templateUrl: "views/information.html"
		})
		.state('cf.clinic', {
			url: '/clinic',
			templateUrl: "views/clinic.html"
		})
		.state('cf.appointment', {
			url: '/appointment',
			templateUrl: "views/appointment.html"
		})
		.state('cf.exercise', {
			url: '/exercise',
			templateUrl: "views/exercise.html"
		})
		.state('cf.symptom', {
			url: '/symptom',
			templateUrl: "views/symptom.html"
		})
		.state('cf.nutrition', {
			url: '/nutrition',
			templateUrl: "views/nutrition.html"
		})

		.state('default.login', {
			url: '/login',
			views: {
				'@default': {
					templateUrl: "views/login.html",
					controller: "LoginController as ctrl"
				}
			}
		});

	$mdThemingProvider.theme('default')
		.primaryPalette('blue')
		.accentPalette('blue');

});

app.run(['$rootScope', '$state', '$cookies', function ($rootScope, $state, $cookies) {
	$rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
		$rootScope.toState = toState;
		$rootScope.toStateParams = toStateParams;

		if (toState.name != 'default.login') {

			try {
				var person =  JSON.parse($cookies.get('auth'));
				if($rootScope.person == undefined){
					$rootScope.person = person.username;
				}
			}
			catch(err) {
				event.preventDefault();
				$state.go('default.login');
			}
		}
	});
}]);