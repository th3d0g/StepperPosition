// Config
var gearRatio = 64;
var steps = 32;
var rpm = 1200;
var GPIOpins = [17, 18, 21, 22];

// Init
var StepperWiringPi = require("stepper-wiringpi");

// Setup 
var motor = StepperWiringPi.setup(
	steps,
	GPIOpins[0],
	GPIOpins[1],
	GPIOpins[2],
	GPIOpins[3]
);
motor.setSpeed(rpm);

// Useful variables
var stepsPerRev = ( steps * gearRatio );
var stepsPerDegree = stepsPerRev  / 360;

// TODO: Read current step from disk, to ensure motor starts at step 0.

// Used to store current step.
var currentStep = 0;

// TEST - Move to angle ( degrees );
moveToDeg( 90, function( degree ){
	console.log("Move completed to degree " + degree );
});

// Move Stepper Motor to Angle (degrees)
function moveToDeg( degree, callback ){
	// Stop motor.
	motor.halt();

	var steps = degToStep( degree );
	console.log("moveToDeg() - Begin stepping to " + degree + " degrees / " + steps + " steps." );

	motorStepTo( steps, callback );
}

// Move Stepper Motor To X  Steps.
function motorStepTo( steps, callback ){

	// Recursive function, move to X steps 1 step at a time.
	var stepFunc = function(){

		// TODO: Add support for both directions.

		// Step by 1.
		motor.step( 1, function(){
			currentStep += 1;

			// Check if completed.
			if( currentStep == steps ){

				console.log( "stepToDeg() - Completed - " + stepToDeg( steps  ) + " degrees | Actual - " + stepToDeg( currentStep ) + " degrees.");
				// Finished callback.
				callback( currentStep );
			} else {
				// Not completed, move another step.
				stepFunc();
			}

			// Normalise
			if( currentStep >= stepsPerRev ) currentStep = 0; // Test for drift.
		});
	};

	// Start moving...
	stepFunc();
}

// Convert Steps to Degree
function stepToDeg( steps ){
	return ( steps / stepsPerRev ) * 360;
}

// Convert Degrees to Steps
function degToStep( deg ){
	return deg * stepsPerDegree;
}
