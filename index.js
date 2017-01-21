var stepper = require('./stepper');

stepper.setup({
  gearRatio: 64,
  steps: 32,
  rpm: 1200,
  GPIOpins: [17, 18, 21, 22]
});


// Test - Step 90 deg, then another 90 deg - final should be 180.

stepper.moveByDeg( 90, function( degree ){
  console.log("1. Completed @ " + degree );


  setTimeout(function(){ 

    stepper.moveByDeg( 90, function( degree ){

        console.log("2. Completed @ " + degree );

        setTimeout(function(){ 

          stepper.moveByDeg( 90, function( degree ){

              console.log("3. Completed @ " + degree );

          });

        }, 2000);

    });

  }, 2000);

});