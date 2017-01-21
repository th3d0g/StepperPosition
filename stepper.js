var gearRatio = 64;
var steps = 32;

var StepperWiringPi = require("stepper-wiringpi");

var motor = StepperWiringPi.setup( steps, 17, 18, 21, 22);

motor.setSpeed(1200);

//motor.forward();

var stepsPerRev = ( steps * gearRatio );
var stepPerDegree = stepsPerRev  / 360;

/*motor.step( 270 * stepPerDegree, function(){

	console.log("hey");

	console.log( motor._stepNumber );
} );*/


var steps = 360 * stepPerDegree;
var currentStep = 0;
var stepPerInterval = 1;

stepToDeg( 360, function( currentStep ){
	console.log("Final callback!" + currentStep);
});

// Test 1 - update loop, count steps
/*var interval = setInterval(function(steps) {

	motor.step(stepPerInterval);

	currentStep += stepPerInterval;

	console.log( currentStep);

	if( currentStep == steps ) clearInterval( interval );

	if( currentStep > stepsPerRev ) currentStep = 0;
}, 10, steps);*/


// Test 2 - Callback,, count steps
function stepToDeg( degree, callback ){
	motor.halt();

	var steps = degree * stepPerDegree;
	currentStep = 0;

	console.log("stepToDeg() - Stepping to " + degree + " degrees - " + steps + " steps." );

	motorStep( steps, callback );
}

function motorStep( steps, callback ){

	var stepFunc = function(){

		motor.step( 1, function(){
			currentStep += 1;

			if( currentStep == steps ){
				console.log( "stepToDeg() - Completed - Steps = " + steps + " Current Step = " + currentStep );
				callback( currentStep );
			} else {
				stepFunc();
			}
		});
	};
	stepFunc();
}
