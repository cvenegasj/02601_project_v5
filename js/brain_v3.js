//

const NODETYPE = {
  INPUT: "INPUT",
  HIDDEN: "HIDDEN",
  OUTPUT: "OUTPUT"
};

const AGGRESSION = {
  wSameSide: 0,
  wOppSide: 1
}

const FEAR = {
  wSameSide: 1,
  wOppSide: 0
}

const LIKE = {
  wSameSide: 0,
  wOppSide: -1
}

const CURIOUSITY = {
  wSameSide: -1,
  wOppSide: 0
}

const COLLECT = {
  wSameSide: -1,
  wOppSide: 1
}

const AVOID = {
  wSameSide: 1,
  wOppSide: -1
}

//
class NeuralCircuit {
  constructor(parent) {
    this.parent = parent;   // vehicle body
    this.layers = [];       // container for neurons of neural circuit. Neurons are organized by layers.
    this.synapses = [];     // container for connections of neural circuit
  }

  addNeuron(n) {
    this.layers[n.layer].push(n);
  }

  addSynapse(s) {
    this.synapses.push(s);
  }

  // randomize assigns random threshold, bias and activation values to each neuron of current neural circuit.
  // It also assigns a random weight to each synapse.
  randomize() {
    for (let l of this.layers) {
      for (let n of l) {
        n.threshold = random(0, 1);
        n.bias = random(-1, 1);  
        n.activation = n.bias;     
      }
    }

    for (let s of this.synapses) {
      s.weight = random(-1, 1);
    }
  }

  // NeuralCircuit.build receives a settings object as parameter and assigns a threshold and bias
  // for each neuron, and a weight for each synapse. Used for initializing vehicles to 
  // have a specific behavior, depending on the settings
  build(settings) {
    // input layer
    for (let n0 of this.layers[0]) {
      n0.threshold = 0;
      n0.bias = 0;
    }
    // output layer
    for (let n1 of this.layers[1]) {
      n1.threshold = 0;
      n1.bias = 0.5;
    }

    for (let i = 0; i < settings.length; i++) {
      // left
      this.synapses[4*i].weight = settings[i].wSameSide;
      this.synapses[4*i+1].weight = settings[i].wOppSide;
      // right
      this.synapses[4*i+2].weight = settings[i].wOppSide;
      this.synapses[4*i+3].weight = settings[i].wSameSide;
    }
  }

  // getNeuronById looks for a neuron with a given id in current neural circuit and returns it.
  getNeuronById(id) {
    for (let i = 0; i < this.layers.length; i++) {
      for (let j = 0; j < this.layers[i].length; j++) {
        if (this.layers[i][j].id == id) {
          return this.layers[i][j];
        }
      }
    }
    return null;
  }

  // get getSynapseById looks for a synapse with a given id in current neural circuit and returns it.
  getSynapseById(id) {
    for (let i = 0; i < this.synapses.length; i++) {
      if (this.synapses[i].id == id) {
        return this.synapses[i];
      }
    }
    return null;
}

  // NeuralCircuit.process updates the activation levels of all neurons in the circuit by 
  // iterating through all the synapses in an order according to the layer of the presynaptic neuron 
  // of each sensor.
  process() {

    // get sensor input
    for (var i = 0; i < this.layers[0].length; i++) {
      this.layers[0][i].sensor.sense();
    }

    // Iterate over each synapse in the NC layer by layer,
    // and send  a signal across each synapse, from presynaptic neuron to postsynaptic neuron    
    for (var i = 0; i < this.layers.length; i++) {
      for (let s of this.synapses) { 
        if (s.pre.layer == i && s.enabled) {
          s.feedForward();
        }
      }
    }

    // update effectors
    for (var i = 0; i < 2; i++) {
      this.layers[this.layers.length-1][i].effector.update();
    }

    // reset activation accumulations back to default state
    for (var l of this.layers) {
      for (var n of l) {
        n.activation = n.bias;
      }
    }
  }

  // NeuralCircuit.render displays the neural circuit to the canvas using functions from the p5 library.
  render() {
    if (config.renderNeuralCircuit) {
      for (let l of this.layers) {
        for (let n of l) {
          n.render(this.parent.width);
        }
      }
      for (let c of this.synapses) {
        c.render(this.parent.width);
      }
    }    
  }
}

// Synapse class definition
// A synapse is a directed edge on the Neural Circuit graph.
class Synapse {
  constructor(network, gene) {
    this.network = network;
    this.id = gene.id;
    this.pre = network.getNeuronById(gene.from.id);
    this.post = network.getNeuronById(gene.to.id);
    this.weight = 0;
    this.length = gene.length;
    this.enabled = gene.enabled;
  }
  
  // Synapse.feedForward updates the activation of the postsynaptic neuron based on the 
  // activation level of the presynaptic level.
  feedForward() {
    var a, t;
    a = this.pre.activation;
    t = this.pre.threshold;

    if (a > t) {
      this.post.activation += (a * this.weight);
    }
  }

  // Synapse.render displays the synapse to the canvas as a line using functions from the p5 library
  render(r) {
    push();
    strokeWeight(abs(this.weight) * r/10);
    line(this.pre.x, this.pre.y, this.post.x, this.post.y);
    pop();
  }
  
}

// Neuron class definition
// A neuron is essentially a node if the neural circuit is a graph
// Each neuron has a bias property that determines the baseline activation
class Neuron {
  constructor(network, gene) {
    this.network = network;
    this.id = gene.id;
    this.layer = gene.layer;
    this.x = 0;
    this.y = 0;
    this.threshold = 0;
    this.bias = 0;
    this.activation = 0;
  }

  // Neuron.adjust position is used to update the rendering position of the neuron when 
  // adding more neurons causes changes in the layers of the Neural Circuit
  adjustPosition(x, y) {
    this.x += x;
    this.y += y;
  }

  // Neuron.render displays the neuron to the canvas using functions from the p5 library
  render(r) {
    push();
    fill(51);  // Dark gray
    ellipse(this.x, this.y, r/4, r/4);
    pop();
  }
}

// SensorNeuron class definition
// Inherits from the Neuron class and adds an additional property for the sensor that SensorNeuron
// is associated with. Sensor neurons have bias = 0.
class SensorNeuron extends Neuron {
  constructor(network, gene, sensor) {
    super(network, gene);
    this.bias = 0;
    this.sensor = sensor;
    this.x = sensor.x;
    this.y = sensor.y;
  }
}

// EffectorNeuron class definition
// Inherits from the Neuron class and adds an additional property for the effector that EffectorNeuron
// is associated with
class EffectorNeuron extends Neuron {
  constructor(network, gene, effector) {
    super(network, gene);
    this.effector = effector;
    this.x = effector.x;
    this.y = effector.y;
  }
}