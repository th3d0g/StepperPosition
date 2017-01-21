var stepper = require('./stepper');

stepper.setup({
  gearRatio: 64,
  steps: 32,
  rpm: 1200,
  GPIOpins: [17, 18, 21, 22]
});

stepper.moveToDeg( 90, function( degree ){
  console.log("Move completed to degree " + degree );
});