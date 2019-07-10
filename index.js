~// G-Code generator using Javascript
class GCode {

  constructor({ name, start, finish, unit, positioning, feedrate, clearance, lines }) {

    // Define the code blocks
    this.code = [];

    // Define the current line number (disables if lines are set to off)
    this.line = (lines == false) ? 0 : 1;

    // Define the name of the code (random three number name if unset)
    this.name = (name) ? name.toUpperCase() : `00${(Math.random() * 1000).toFixed(0)}`.slice(-3);

    // Define the unit to use (default is cm)
    this.unit = (unit) ? unit.toLowercase() : 'cm';

    // Define the positioning to use (absolute by default)
    this.positioning = (positioning) ? positioning : 0;

    // Define the clearance (10cm default)
    this.clearance = (clearance) ? clearance : 10;

    // Define the feedrate (50cm / minute)
    this.feedrate = (feedrate) ? feedrate : 50;

    // Define the start position (clearance unscaled here)
    this.start = (start) ? start : [0, 0, clearance];

    // Define the finish position (clearance unscaled here)
    this.finish = (finish) ? finish : [0, 0, clearance];

    // Define the state [0 off, 1 running]
    this.state = 0;

    // Startup now that all the variables are configured
    this.initialize();
  }

  // Startup the code and make the first moves
  initialize() {

    // Add an opening tag to the code
    this.add(`%`);

    // Add the script name
    this.add(this.opCode(`O`, this.name));

    // Add code for which unit system to use (mm or inches)
    this.add(this.opCode(`G`, (this.unit == 'inch' || this.unit == 'in') ? '20' : '21'));

    // Add code for the type of positioning being used
    this.setPositioning(this.positioning);

    // Set the state to on
    this.toggleState();

    // Raise the mill above the clearance
    this.raiseMill();

    // Feed rapidly to the start position
    this.feedRapid(this.start, this.feedrate);
  }

  // Applying the positioning (absolute or relative)
  setPositioning(positioning) {

    // Convert the value to a lowercase string
    positioning = String(positioning).toLowerCase();

    // Evaluate to either 0 (absolute) or 1 (relative)
    positioning = (positioning == 'absolute') ? 0 : (positioning == 'relative') ? 1 : Number(positioning);

    // Add the positioning code
    this.add(this.opCode(`G`, ((positioning) ? `90` : `91`)));
  }

  // Apply the scale based on the units
  scale(number) {

    // Scale the number in centimeters
    if (this.unit == 'cm') return (number * 10);

    // Scale the number in decimeters
    if (this.unit == 'dm') return (number * 100);

    // Scale the number in meters
    if (this.unit == 'm') return (number * 1000);

    // Return the number as scale is mm or inches
    return number;
  }

  // Derive the coordinate words from a position { x, y, z } or [ x, y, z ]
  positionCode(position = [0, 0, 0]) {

    // Create a list of positions
    const positions = [];

    // Check if the position is a standard matrix [x, y, z] and convert to an object
    if (Array.isArray(position)) position = { x: position[0], y: position[1], z: position[2] };

    // If there is an x coordinate then add it to the positions
    if (position.x != null) positions.push(`X${this.scale(position.x)}`);

    // If there is an y coordinate then add it to the positions
    if (position.y != null) positions.push(`Y${this.scale(position.y)}`);

    // If there is an z coordinate then add it to the positions
    if (position.z != null) positions.push(`Z${this.scale(position.z)}`);

    // Return the position words
    return positions.join(` `);
  }

  // Optcode
  opCode(opt, code) {

    // Return the optcode (e.g.)
    return (`${opt}${code}`);
  }

  // Derive the feedrate word from a feedrate (mm/minute)
  feedrateCode(feedrate = 50) {

    // Return the feedrate word
    return this.opCode(`F`, this.scale(feedrate));
  }

  // Drop the mill to a specified depth (0 by default)
  dropMill(depth = 0) {

    // Add the code to drop the mill
    this.feedRapid({ z: depth });
  }

  // Raise the mill to a specified depth (clearence value by default)
  raiseMill(depth = this.clearance) {

    // Add the code to raise the mill
    this.feedRapid({ z: depth });
  }

  // Start the spindle in a direction (clockwise by default)
  startSpindle(clockwise = true) {

    // Add the code to the stack to start the spindle in a specified direction
    this.add(this.opCode(`M`, ((clockwise) ? `03` : `04`)));
  }

  // Stop the spindle
  stopSpindle() {

    // Add the code to the stack to stop the spindle
    this.add(this.opCode(`M`, `05`));
  }

  // Start the coolant with a certain intensity (false by default)
  startCoolant(flood = false) {

    // Add the code to the stack to start the coolant
    this.add(this.opCode(`M`, ((flood) ? `08` : `07`)));
  }
  
  // Stop the coolant
  stopCoolant() {
  
    // Add the code to the stack to stop the coolant
    this.add(this.opCode(`M`, `09`));
  }

  // Motion in a specified way towards a point
  motion(code, position, feedrate) {

    // Add the code to the stack to feed to the specified position
    this.add(`${this.opCode(`G`, code)} ${this.positionCode(position)} ${this.feedrateCode(feedrate)}`);
  }

  // Feed rapidly to a position at a specified feedrate
  feedRapid(position, feedrate) {

    // Add the code to feed rapidly to the position
    this.motion(`00`, position, feedrate);
  }

  // Feed linearly to a position at a specified feedrate
  feedLinear(position, feedrate) {

    // Add the code to the stack to linearly to the specified position
    this.motion(`01`, position, feedrate);
  }

  // Terminate our code and ensure everything is stopped
  terminate(force = false) {

    // Check that the code is not force stopping
    if (!force) {

      // Stop the spindle
      this.stopSpindle();

      // Stop the coolant
      this.stopCoolant();

      // Raise the mill above the clearence
      this.raiseMill();
    }

    // Force stop or rewind the program
    this.add(this.opCode(`M`, (force) ? `00` : `30`));

    // Toggle the state to off
    this.toggleState();
  }

  // Toggle the current state
  toggleState() {

    // Update the state to the opposite of what it is currently
    this.state = !this.state;
  }

  // Add the code to the stack
  add(code) {
    
    // Deterimine whether to add a line number or not
    if (this.line && (code.charAt(0) != (`%`) && code.charAt(0) != `O`)) {
    
      // Add a line number before the section
      code = `${this.opCode(`N`, `00${this.line}`.slice(-3))} ${code}`;

      // Increment the line count
      this.line++;
    }

    // Add the code specified to the code stack
    this.code.push(code);
  }

  // Evaluate the gcode
  eval() {

    // Check if the code has been terminate, and if not then terminate
    if (!!this.state) this.terminate();

    // Add the closing tag
    this.add(`%`);

    // Return the code as a string
    return this.code.join(`\n`);
  }

  // Return the same output as the eval function
  toString() {
    return this.eval();
  }
}