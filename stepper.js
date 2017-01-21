var gearRatio = 64;
var steps = 32;

var StepperWiringPi = require("stepper-wiringpi");

var motor = StepperWiringPi.setup( steps, 17, 18, 21, 22);

motor.setSpeed(1200);

var stepsPerRev = ( steps * gearRatio );
var stepPerDegree = stepsPerRev  / 360;

var currentStep = 0;

stepToDeg( 90, function( currentStep ){
	console.log("Final callback!" + currentStep);
});

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

			if( currentStep >= stepsPerRev ) currentStep = 0; // Test for drift.
		});
	};
	stepFunc();
}
