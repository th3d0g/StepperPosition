var stepper = require('./stepper');

stepper.setup({
  gearRatio: 64,
  steps: 32,
  rpm: 1200,
  GPIOpins: [17, 18, 21, 22]
});


// Test - Move in increments of 90 degrees.
var c = 0;
function moveBy90(){
  stepper.moveByDeg( 90, function( degree ){
    console.log( (++c) + ". Completed @ " + degree );

    setTimeout(function(){ 

      moveBy90();

    }, 2000);

  });
}
moveBy90();