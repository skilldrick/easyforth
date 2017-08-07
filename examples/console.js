var ng = angular;
var mc;
var app = ng.module('morley', []).controller('console', function($scope) {
	Michelson(function(michelson) {
		mc = michelson;
	});

	$scope.onEnter = function() {
		mc.readLine($scope.command, null, function(){
			//$scope.stack = mc.getStack();
			setTimeout(pullDown, 0);
			$scope.command = "";
		});
	};
	$scope.stack = mc.getStack();
});	

app.directive('myEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if(event.which === 13) {
				scope.$apply(function (){
					scope.$eval(attrs.myEnter);
				});

				event.preventDefault();
			}
		});
	};
});

function pullDown() {
	$('.pull-down').each(function() {
		var $this=$(this);
		$this.css('margin-top', $this.parent().height()-$this.height()-40);
	});
}

$(function() {
	pullDown();
	$('input').focus();
});
