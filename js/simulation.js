document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems, {});
  setInitialUIParameters();
});

// Simulations modules. A set of objects defining initial presets for simulations. 
const FOOD_FINDERS = {
  env: FOOD_HAZARD,
  //env: FOOD,
  numPopulations: 1,
  traits: [SCAVENGER]
}

const CAT_MOUSE = {
  env: ONLY_VEHICLES,
  numPopulations: 2,
  traits: [PREDATOR, PREY]
}

const EXPLORATION = {
  env: ALL_TYPES,
  numPopulations: 1,
  traits: [EXPLORER]
}

const ATTRACTION_MODULE = {
  env: FOOD,
  numPopulations: 1,
  traits: [ATTRACTED_TYPE]
}

const AGGRESSION_MODULE = {
  env: FOOD,
  numPopulations: 1,
  traits: [AGGRESSIVE_TYPE]
}

const AVOID_MODULE = {
  env: FOOD_HAZARD,
  numPopulations: 1,
  traits: [AVOIDING_TYPE]
}

var config = {
  fps: 60,
  simulationSpeed: 1, // slider

  renderNeuralCircuit: true,  
  renderFields: false, // turn on/off the circles around signals

  environmentNoise: 0.1,  // slider from 0 to 1
  signalRadius: 2,  // slider
  signalIntensity: 1, // slider

  massScale: 1, // (default = 0.1)
  motorSpeed: 100,  // default = 100
  constrainVelocity: false,
  motorFriction: 0.1, // slider from 0 to 1 (default = 0.1)
  motorFrontBackPlacement: -0.9,  // slides motors back / forward (ranges from -1 to 1) (default = -0.9)
  motorSeparation: 1.3, // slides motors closer together / farther apart (ranges from 0 to 1.5ish) (default = 1.3)
  sensorFrontBackPlacement: 0.9, // slides sensors back/ forward (ranges from 1 to -1) (default = 0.9)
  sensorSeparation: 0.75, // slides sensors closer together/ farther apart (ranges from 0 to 1) (default = 0.75)

  populationSize: 13,
  generationLifespan: 8,
  evolutionActivated: true,
  numberCopied: 4,

  mutationRate: SLOW,
  simModule: CAT_MOUSE
};

var simCanvas;
var canvasWidth = 945;
var canvasHeight = 650;

var world;
var generationTimer = 0;
// var timeToEvolve = false;

function setup() {
  simCanvas = createCanvas(canvasWidth, canvasHeight);
  simCanvas.parent("simulation-canvas");

  frameRate(config.fps);
  rectMode(RADIUS);
  angleMode(RADIANS);

  // load parameters from UI
  setupFromUI();
}

function draw() {
  background(230);
  world.update();
  world.render();

  displayMouseCoordinates()
  displayFPS();
}

function displayMouseCoordinates() {
  text("(" + mouseX.toString() + ", " + mouseY.toString() + ")", 0.005*canvasWidth, 0.965*canvasHeight, 100, 50);
}

function displayFPS() {
  text("fps: " + frameRate().toFixed(0), 0.005*canvasWidth, 0.005*canvasHeight, 100, 50);
}

// runModule receives a simModule objet and sets up the populations accordingly.
function runModule(simModule) {
  // Setup environment
  world.setup(simModule.env);
  // Setup populations
  for (let i = 0; i < simModule.numPopulations; i++) {
    var p = new Population(config.populationSize, simModule.traits[i], config.mutationRate);
    p.populate();
    world.populations.push(p);
  }
}


// =========================== UI functions ===========================

// setupFromUI is called when the user clicks the play button from the UI.
// It reads all the values from the UI controls and starts a new world accordingly.
function setupFromUI() {
  noLoop();
  var module = document.getElementById("module").value;
  //var speed = document.getElementById("speed").value;
  var size = parseInt(document.getElementById("size").value);
  var evolutionActivated = JSON.parse(document.getElementById("evolutionActivated").checked);
  var lifespan = parseInt(document.getElementById("lifespan").value);
  var mutationRate = document.getElementById("mutationRate").value; // DISABLED, SLOW, MEDIUM or FAST
  var numberCopied = parseInt(document.getElementById("numberCopied").value);
  var showNC = JSON.parse(document.getElementById("showNC").checked);
  var showFields = JSON.parse(document.getElementById("showFields").checked);
  var envNoise = parseFloat(document.getElementById("envNoise").value);
  console.log(module + "(" + typeof module + ")", size + "(" + typeof size + ")", lifespan + "(" + typeof lifespan + ")", 
    mutationRate + "(" + typeof mutationRate + ")", numberCopied + "(" + typeof numberCopied + ")", 
    showNC + "(" + typeof showNC + ")", showFields + "(" + typeof showFields + ")", envNoise + "(" + typeof envNoise + ")");

  // update config parameters
  //config.simulationSpeed = speed;
  config.simModule = getModule(module);
  config.populationSize = size;
  config.evolutionActivated = evolutionActivated;
  config.generationLifespan = lifespan;
  config.mutationRate = getMutationRate(mutationRate);
  config.numberCopied = numberCopied;
  config.renderNeuralCircuit = showNC;
  config.renderFields = showFields;
  config.environmentNoise = envNoise;
  //----------------------------------------
  deltaT = config.simulationSpeed / config.fps;

  // setup environment
  world = new Environment();
  runModule(config.simModule);
  loop();
}

// setInitialUIParameters sets the value for each parameter when the UI is first loaded.
// It uses the default values from the global config variable.
function setInitialUIParameters() {
  //document.getElementById("speed").value = config.simulationSpeed;
  document.getElementById("size").value = config.populationSize;
  document.getElementById("evolutionActivated").checked = config.evolutionActivated;
  document.getElementById("lifespan").value = config.generationLifespan;
  //document.getElementById("mutationRate").value = config.mutationRate;
  document.getElementById("numberCopied").value = config.numberCopied;
  document.getElementById("showNC").checked = config.renderNeuralCircuit;
  document.getElementById("showFields").checked = config.renderFields;
  document.getElementById("envNoise").value = config.environmentNoise;
}

// getModule receives a string and returns the module object of the same name.
function getModule(modString) {
  var module;
  switch(modString) {
    case "FOOD_FINDERS":
      module = FOOD_FINDERS;
      break;
    case "CAT_MOUSE":
      module = CAT_MOUSE;
      break;
    case "EXPLORATION":
      module = EXPLORATION;
      break;
    case "ATTRACTION_MODULE":
      module = ATTRACTION_MODULE;
      break;
    case "AGGRESSION_MODULE":
      module = AGGRESSION_MODULE; 
      break;
    case "AVOID_MODULE":
      module = AVOID_MODULE;
      break;
    default:
      module = null;
  }
  return module;
}

// getMutationRate receives a string and returns the corresponding mutation rate object of the same name.
function getMutationRate(mrString) {
  var mr;
  switch(mrString) {
    case "DISABLED":
      mr = DISABLED;
      break;
    case "SLOW":
      mr = SLOW;
      break;
    case "MEDIUM":
      mr = MEDIUM;
      break;
    case "FAST":
      mr = FAST;
      break;
    default:
      mr = null;
  }
  return mr;
}

function setTimeToEvolve() {
  timeToEvolve = true;
}

var paused = false;
function stopSimulation() {
  paused = !paused;
  if (paused) {
    noLoop();
  } else {
    loop();
  }
}
