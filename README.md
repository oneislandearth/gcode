<p align="center">
  <a href="https://github.com/oneislandearth/gcode" target="_blank">
    <img src="https://i.imgur.com/yRaNfsL.png">
  </a>
</p>

<p align="center">
  <a href="https://greenkeeper.io" target="_blank">
  <img src="https://badges.greenkeeper.io/oneislandearth/gcode.svg"></a>
  <a href="https://travis-ci.org" target="_blank">
  <img src="https://api.travis-ci.org/oneislandearth/gcode.svg?branch=master"></a>
  <a href="https://packagephobia.now.sh/result?p=@oneisland/gcode" target="_blank">
  <img src="https://packagephobia.now.sh/badge?p=@oneisland/gcode"></a>
  <a href="https://snyk.io/vuln/search?q=@oneisland/gcode&type=npm" target="_blank">
  <img src="https://img.shields.io/snyk/vulnerabilities/github/oneislandearth/gcode.svg"></a>
  <a href="https://www.npmjs.com/package/@oneisland/gcode" target="_blank">
  <img src="https://img.shields.io/npm/l/@oneisland/gcode.svg"></a>
</p>

***

A simple library for generating G-Code in Javascript

## Installation

[GCode](https://github.com/oneislandearth/gcode) is available through the [npm registry](https://www.npmjs.com/package/@oneisland/gcode):

```bash
$ npm install @oneisland/gcode
```

## Usage

After installing GCode you can use the module like so:

###### example-usage.js
```js
// Import the library
import { GCode } from '@oneisland/gcode';

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

// Output the code to console
console.log(String(code));
```

Execute the example code:

```bash
$ node example-usage.js
```

Expected output:

```
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
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, OneIsland Limited