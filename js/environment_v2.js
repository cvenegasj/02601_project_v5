// Predefined object containing all types of signals.
const SIGNAL_TYPE = {
  LIGHT: "LIGHT",
  FOOD: "FOOD",
  HAZARD: "HAZARD"
};

// Environment setup objects with predefined settings.
const LIGHTS = {
  method: "random",
  numLights: 8,
  numFood: 0,
  numHazard: 0
}

const FOOD = {
  method: "random",
  numLights: 0,
  numFood: 10,
  numHazard: 0
}

const FOOD_HAZARD = {
  method: "random",
  numLights: 0,
  numFood: 10,
  numHazard: 10
}

const ONLY_VEHICLES = {
  method: "random",
  numLights: 0,
  numFood: 0,
  numHazard: 0
}

const ALL_TYPES = {
  method: "random",
  numLights: 5,
  numFood: 5,
  numHazard: 5
}


// Environment class definition
// The Environment serves as a container for all objects that exist in the simulation
class Environment {
  constructor() {
    // this.signalTypes = [];
    this.signals = [];
    //this.vehicles = [];
    this.populations = [];
  }

  // setup receives an evironment setup object with initial values for setting the environment accordingly.
  // The setting object contains: method, numLights, numFood, numHazard.
  setup(settings) {
    if (settings.method == "random") {
      for (var i = 0; i < settings.numLights; i++) {
        this.addSignal(new Signal(random(canvasWidth), random(canvasHeight), config.signalRadius, config.signalIntensity, SIGNAL_TYPE.LIGHT));
      }
      for (var i = 0; i < settings.numFood; i++) {
        this.addSignal(new Signal(random(canvasWidth), random(canvasHeight), config.signalRadius, config.signalIntensity, SIGNAL_TYPE.FOOD));
      }
      for (var i = 0; i < settings.numHazard; i++) {
        this.addSignal(new Signal(random(canvasWidth), random(canvasHeight), config.signalRadius, config.signalIntensity, SIGNAL_TYPE.HAZARD));
      }
    }
  }

  update() {
    for (let p of this.populations) {
      p.update();
    }
  }

  addSignal(s) {
    this.signals.push(s);
  }

  // Environment.render loops through all objects conained within the Environment and calls each individual object's render() function
  render() {

    // render all signals
    for (let s of this.signals) {
      s.render();
    }

    // render all vehicles
    for (let p of this.populations) {
      p.render();
    }
  }
}

// Body class definition
// A Body object is used for managing the physical properties of a Vehicle
// It also contians a list of children that contains all of the components of a Vehicle for easier rendering.
class Body {
  constructor(v, x, y, w, h, theta, axisX, axisY) {
    this.vehicle = v;
    this.position = createVector(x, y);
    this.width = w;
    this.height = h;
    this.angle = theta;
    this.axisOffsetX = axisX * w;
    this.axisOffsetY = axisY * h;
    this.pivot = createVector(x + w * (axisX), y - h * (axisY));
    this.mass = 0.0005 * w * h * config.massScale;
    this.moment = this.mass * (w * w * (axisX * axisX - axisX + 1/3) + h * h * (axisY * axisY - axisY + 1/3));
    this.children = [];
  }

  // Body.add child takes any object as an input and adds it the the Body's 'children' array
  addChild(c) {
    this.children.push(c);
  }

  // Body.borders checks if a Body object has gone past the limits of the canvas. If the body has gone off the canvas,
  // move to the opposite side of the canvas.
  borders() {
    if (this.pivot.x < 0)  this.pivot.x = canvasWidth;
    if (this.pivot.y < 0)  this.pivot.y = canvasHeight;
    if (this.pivot.x > canvasWidth) this.pivot.x = 0;
    if (this.pivot.y > canvasHeight) this.pivot.y = 0;
  }

  // Body.render displays the Vehicle's Body and all of its sub-components to the canvas using
  // functions from the p5 library
  render() {
    push();
    translate(this.pivot);
    rotate(this.angle);
    strokeWeight(this.width/20);
    rect(this.axisOffsetX, this.axisOffsetY, this.width, this.height)
    for (let c of this.children) {
      if (c !== null) { // avoids error in render for null signal
        c.render(this.width);
      }
    }
    pop();
  } 
}

// Signal class definition
// Signal objects can be detected by sensors with the same type as the signal
class Signal {
  constructor(x, y, r, i, type) {
    this.position = createVector(x, y)
    this.radius = 100 * r;
    this.intensity = i;
    this.type = type;
  }

  consume(v) {
    for (let i = 0; i < world.signals.length; i++ ) {
      if (this === world.signals[i]) {
        world.signals.push(new Signal(random(canvasWidth), random(canvasHeight), config.signalRadius, config.signalIntensity, this.type));
        world.signals.splice(i, 1);
      }
    }
    
  }

  // Signal.render displays the signal to the canvas using functions from the p5 library.
  //    Lights are represented by a yellow ellipse
  //    Food is represented by a green square
  //    Hazards are represented by a red triangle
  render(r = 12) { // default = 12

    push();
    if (this.type == SIGNAL_TYPE.LIGHT) {
      fill(255, 255, 0);
      ellipse(this.position.x, this.position.y, 1.5*r, 1.5*r);
      stroke(255, 255, 0);
    } else if (this.type == SIGNAL_TYPE.FOOD) {
      fill(0, 255, 0);
      rect(this.position.x, this.position.y, 0.45*r, 0.45*r);
      stroke(0, 255, 0);
    } else if (this.type == SIGNAL_TYPE.HAZARD) {
      fill(255, 0, 0);
      var x1, y1, x2, y2, x3, y3;
      x1 = this.position.x; y1 = this.position.y - 0.6*r;
      x2 = this.position.x - 0.6*r; y2 = this.position.y + 0.6*r;
      x3 = this.position.x + 0.6*r; y3 = this.position.y + 0.6*r;
      triangle(x1, y1, x2, y2, x3, y3);
      stroke(255, 0, 0);
    }
    if (config.renderFields) {
      noFill();
      ellipse(this.position.x, this.position.y, 2*this.radius, 2*this.radius);
    }
    pop();
  }

}

class Odor extends Signal {
  constructor(x, y, r, i, d) {
    super(x, y, r, i)
    this.duration = d;
  }

  // call diffuse every fame to reduce intensity over time
  diffuse() {

  }
}