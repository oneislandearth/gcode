// Import the testing module
import test from 'ava';

// Import the GCode library
import { GCode } from 'lib/gcode';

// Define a function for stripping whitespace and new lines
const strip = (string) => String(string).replace(/(\ |\r\n|\n|\r)/gm, '');

// Perform a test to check valid input
test('GCode: Simple test', (result) => {

  // Create a new code section
  const code = new GCode({

    // Define the script name
    name: '123',

    // Define the scale to use (default is mm)
    units: 'cm',
    
    // Define the starting x and y position
    start: [0, 0],

    // Set the clearance height to 10cm
    clearance: 10,
  });

  // Start the spindle
  code.startSpindle();

  // Start the coolant
  code.startCoolant();

  // Drop the mill to the bottom of the board
  code.dropMill();

  // Cut lengthways 65.5cm
  code.feedLinear([0, 65.5]);

  // Cut sideways 23.4cm
  code.feedLinear([23.4, 65.5]);

  // Cut diagonally to a point (12.28cm sideways, midpoint lengthways)
  code.feedLinear([12.8, (65.5 / 2)]);

  // Cut back to the start lengthways
  code.feedLinear([12.8, 0])

  // Cut back to the starting point
  code.feedLinear([0, 0]);

  // Convert the code to a string and strip whitespace and new lines
  const output = strip(code);

  // Define the expected output and strip whitespace and new lines`
  const expected = strip(`
    %
    O123
    N001 G21
    N002 G91
    N003 G00 Z100 F500
    N004 G00 X0 Y0 F500
    N005 M03
    N006 M07
    N007 G00 Z0 F500
    N008 G01 X0 Y655 F500
    N009 G01 X234 Y655 F500
    N010 G01 X128 Y327.5 F500
    N011 G01 X128 Y0 F500
    N012 G01 X0 Y0 F500
    N013 M05
    N014 M09
    N015 G00 Z100 F500
    N016 M30
    %
  `);
  
  // Check that the output equals the expected
  result.assert(output == expected);
});
