const DISABLED = {
  newNeuron: 0,
  newSynapse: 0,
  randomWeight: 0,
  randomBias: 0,
  randomThreshold: 0
}

const SLOW = {
  newNeuron: 0.1,
  newSynapse: 0.1,
  randomWeight: 0.3,
  randomBias: 0.1,
  randomThreshold: 0.1
}

const MEDIUM = {
  newNeuron: 0.3,
  newSynapse: 0.3,
  randomWeight: 0.3,
  randomBias: 0.3,
  randomThreshold: 0.3
}

const FAST = {
  newNeuron: 0.5,
  newSynapse: 0.5,
  randomWeight: 0.5,
  randomBias: 0.5,
  randomThreshold: 0.5
}

class NeuronGene {
  // contructor receives the layer number for the neuron to be added and its type (HIDDEN, INPUT, or OUTPUT).
  constructor(layer, type) {
    this.id = 0;
    this.layer = layer;
    this.type = type;
  }

  // copy returns a copy of current object.
  copy() {
    return this;
  }
}

class SynapseGene {
  // constructor receives:
  // from: incoming NeuronGene object
  // to: outgoing NeuronGene object
  // enabled: initial state of the object. True by default.
  constructor(from, to, enabled = true) {
    this.id = 0;
    this.from = from;
    this.to = to;
    this.enabled = enabled;
  }

  // length calculates the number of layers this synapse crosses.
  get length() {
    return this.to.layer - this.from.layer;
  }
 
  // copy returns a copy of the current object.
  copy() { 
    return this;
  }

  // disable sets the enabled property of the object as false.
  disable() {
    this.enabled = false;
  }
  
}