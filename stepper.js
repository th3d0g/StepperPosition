var StepperWiringPi = require("stepper-wiringpi");
// var Storage = require('node-storage');ls

// var store = new Storage('stepper.data');

var Stepper = {
	setup: setup,
	moveToAngle: moveToAngle,
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
	Stepper.currentAngle = 0;
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

	// Move to start.
	/*var currentStep = store.get('currentStep');
	console.log("CurrentStep: " + currentStep);
	if( currentStep ) Stepper.currentStep = currentStep;*/

	
}

// TODO: Handling start position
// Make sure start position is always 'north'.
// Store stepper position as it moves (to disk), use this to reset start position at boot up.
// Can also store position when crash, exit, etc/

// 1. move stepper
// 2. store position.
// --- New session.
// 1. check position.
// 2. move to 0.

// Move To Angle = Move stepper to absolute angle, taking into account current position.
function moveToAngle( degree, callback ){

	// Stop motor.
	Stepper.motor.halt();

	this.steps = degToStep( degree );
	console.log("moveToAngle() - Begin stepping to " + degree + " degrees / " + this.steps + " steps." );

	// console.log( "Steps to move:" + this.steps );

	// Calc the quickest direction to rotate to new angle.
	var currentAngle = stepToDeg( Stepper.currentStep );
	var targetAngle = degree;
	var direction = shortestDirection( currentAngle,  targetAngle );

	console.log( "Curr: " + currentAngle, "Targ: " + targetAngle, "Dir: " + direction, "Curr Step:" + Stepper.currentStep );

	motorStepTo( this.steps, callback, direction );
}

// Move By Degree - Move Stepper Motor by specific amount of degrees, with no regard to motors current position.
function moveByDeg( degree, callback ){
	// Stop motor.
	Stepper.motor.halt();

	this.steps = degToStep( degree );
	console.log("moveByDeg() - Begin stepping to " + degree + " degrees / " + this.steps + " steps." );

	// Increment steps
	this.steps += Stepper.currentStep;

	console.log( "Steps to move:" + this.steps );

	motorStepTo( this.steps, callback, 1 );
}

// Move Stepper Motor To X  Steps.
function motorStepTo( steps, callback, direction ){

	// Recursive function, move to X steps 1 step at a time.
	var stepFunc = function(){

		// TODO: Issues with normalised step, vs actual step.

		// Step by '1 step' at a time.
		Stepper.motor.step( direction, function(){

			Stepper.currentStep += direction;

			Stepper.currentAngle = stepToDeg( Stepper.currentStep );

			// store.put('currentStep', Stepper.currentStep);

			// Check if completed.
			if( Stepper.currentStep == steps ){

				//console.log( "stepToDeg() - Completed - " + stepToDeg( steps  ) + " degrees | Actual - " + stepToDeg( Stepper.currentStep ) + " degrees.");
				
				// Finished callback.
				callback( Stepper.currentAngle );
			} else {
				// Not completed, move another step.
				stepFunc();
			}

			// Normalise
			Stepper.currentStep = clampSteps( Stepper.currentStep );
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
	// 360 needs to return total steps per 1 reolution, rather than being clamped to 0.
	if( deg == 360 ) return Stepper.stepsPerRev;

	deg = clampAngle( deg );
	return Math.round( deg * Stepper.stepsPerDegree );
}

// Will calc the quickest rotation to target angle (returns sign based on direction)
// function shortestRotation( current, target ){
// 	var a = target - current;
// 	return (a + 180) % 360 - 180; 
// }
function shortestRotation( current, target ){
	return ((((target - current) % 360) + 540) % 360) - 180;
}

// Return same as above, but 1 / -1
function shortestDirection( current, target ){

	// if 

	if( ( current < 360 && current >= 180 ) && ( target >= 0 && target < 180 ) ){
		return 1;
	}
	return shortestRotation( current,  target ) > 0 ? 1 : -1;
}