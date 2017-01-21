var StepperWiringPi = require("stepper-wiringpi");

var Stepper = {
	setup: setup,
	moveByDeg: moveByDeg,
	motor: null,
	gearRatio: null,
	steps: null,
	rpm: null,
	GPIOpins: null

};
module.exports = Stepper;

function setup( params ){
	// Store params
	Stepper.gearRatio = params.gearRatio;
	Stepper.steps = params.steps;
	Stepper.rpm = params.rpm;
	Stepper.GPIOpins = params.GPIOpins;

	// Calc useful vars
	Stepper.currentStep = 0;
	Stepper.stepsPerRev = ( Stepper.steps * Stepper.gearRatio );
	Stepper.stepsPerDegree = Stepper.stepsPerRev  / 360;

	// Init Stepper Lib
	Stepper.motor = StepperWiringPi.setup(
		Stepper.steps,
		Stepper.GPIOpins[0],
		Stepper.GPIOpins[1],
		Stepper.GPIOpins[2],
		Stepper.GPIOpins[3]
	);
	Stepper.motor.setSpeed( Stepper.rpm );
}

// Move Stepper Motor to Angle (degrees)
function moveByDeg( degree, callback ){
	// Stop motor.
	Stepper.motor.halt();

	this.steps = degToStep( degree );
	console.log("moveByDeg() - Begin stepping to " + degree + " degrees / " + this.steps + " steps." );

	motorStepTo( this.steps, callback );
}

// Move Stepper Motor To X  Steps.
function motorStepTo( steps, callback ){

	// Take into account previous steps.
	steps += Stepper.currentStep;

	console.log( "Steps before clamp:" + steps );
	steps = clampSteps( steps );
	console.log( "Steps after clamp:" + steps );

	// Recursive function, move to X steps 1 step at a time.
	var stepFunc = function(){

		// TODO: Add support for both directions.

		// TODO: Issues with normalised step, vs actual step.

		// Step by 1.
		Stepper.motor.step( 1, function(){

			Stepper.currentStep += 1;

			// Check if completed.
			if( Stepper.currentStep >= steps ){

				console.log( "stepToDeg() - Completed - " + stepToDeg( steps  ) + " degrees | Actual - " + stepToDeg( Stepper.currentStep ) + " degrees.");
				// Finished callback.
				callback( stepToDeg( Stepper.currentStep ) );
			} else {
				// Not completed, move another step.
				stepFunc();
			}

			// Normalise
			Stepper.currentStep = clampSteps( Stepper.currentStep );

			//if( Stepper.currentStep >= Stepper.stepsPerRev ) Stepper.currentStep = 0; // Test for drift.
		});
	};

	// Start moving...
	stepFunc();
}

// Normalise Steps (Degree)
function clampSteps( steps)
{
    return (steps % Stepper.stepsPerRev) + (steps < 0 ? Stepper.stepsPerRev : 0);
}


// Normalise Angle (Degree)
function clampAngle( angle)
{
    return (angle % 360) + (angle < 0 ? 360 : 0);
}

// Convert Steps to Degree
function stepToDeg( steps ){
	return ( steps / Stepper.stepsPerRev ) * 360;
}

// Convert Degrees to Steps
function degToStep( deg ){
	return deg * Stepper.stepsPerDegree;
}