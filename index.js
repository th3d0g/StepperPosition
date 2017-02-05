var stepper = require('./stepper');

stepper.setup({
  gearRatio: 64,
  steps: 32,
  rpm: 99999,
  GPIOpins: [17, 18, 21, 22]
});

// Tests

// Moves to random degree relative to starting position.
testMoveToRandom();

// Will move increments of 90 (e.g. 90, 180... ) relative to starting position.
// testMoveToAngle();

// Will move by 90 each time, relative to starting position.
// testMoveByDeg();


// ------------------------------



// Test - Move to random angle every 1 second (e.g. don't wait for current movement to complete).
function testMoveToRandom(){
  var c = 0;

  setInterval(function(){ 
    c++;

    var angle = getRandomInt( 0, 360 );

    console.log( c + ". Start - Move to " + angle );

    stepper.moveToAngle( angle, function( degree ){
      // console.log( c + ". Completed @ " + degree );
    });

  }, 1000);
}



// Test - Move to specific angle, increments by 90, each time. Requires incrementing degree value input.
function testMoveToAngle(){
  var c = 0;
  function moveToAngleBy90(){
    c++;

    var angle = 90 * c;

    console.log( c + ". Start - Move to " + angle );

    stepper.moveToAngle( angle, function( degree ){

      // console.log( c + ". Completed @ " + degree );

      setTimeout(function(){ 

        moveToAngleBy90();

      }, 2000);

    });
  }
  moveToAngleBy90();
}


// Test - Move in increments of 90 degrees.
function testMoveByDeg(){
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
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}