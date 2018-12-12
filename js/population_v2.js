
// Predefined objects with default values for a specific type of population. 
const SCAVENGER = {
  size: 10,
  //sensorTypes: [SIGNAL_TYPE.FOOD],
  sensorTypes: [SIGNAL_TYPE.FOOD, SIGNAL_TYPE.HAZARD],
  signal: null,
  color: [255, 222, 173],
  brain: "random"
  //brain: [COLLECT, AVOID]
}

const EXPLORER = {
  size: 10, 
  sensorTypes: [SIGNAL_TYPE.LIGHT, SIGNAL_TYPE.FOOD, SIGNAL_TYPE.HAZARD],
  signal: SIGNAL_TYPE.LIGHT,
  color: [130, 200, 255],
  brain: [CURIOUSITY, CURIOUSITY, CURIOUSITY]
}

// const PREY = {
//     size: 10,
//     sensorTypes: [SIGNAL_TYPE.HAZARD],
//     signal: SIGNAL_TYPE.FOOD,
//     color: [25, 25, 255],
//     brain: [AVOID]
// }

// const PREDATOR = {
//     size: 12,
//     sensorTypes: [SIGNAL_TYPE.FOOD],
//     signal: SIGNAL_TYPE.HAZARD,
//     color: [0, 0, 0],
//     brain: [AGGRESSION]
// }

const PREY = {
    size: 10,
    sensorTypes: [SIGNAL_TYPE.HAZARD, SIGNAL_TYPE.HAZARD],
    signal: SIGNAL_TYPE.FOOD,
    color: [170, 150, 150],
    brain: [AVOID, FEAR]
    // brain: "random"
}

const PREDATOR = {
    size: 12,
    sensorTypes: [SIGNAL_TYPE.FOOD, SIGNAL_TYPE.FOOD],
    signal: SIGNAL_TYPE.HAZARD,
    color: [130, 107, 43],
    brain: [COLLECT, AGGRESSION]
    // brain: "random"
}

const AGGRESSIVE_TYPE = {
    size: 10,
    sensorTypes: null,
    signal: SIGNAL_TYPE.FOOD,
    color: [255],
    brain: [AGGRESSION]
}

const ATTRACTED_TYPE = {
    size: 10,
    sensorTypes: [SIGNAL_TYPE.FOOD],
    signal: null,
    color: [255, 130, 0],
    brain: [LIKE]
}

const AVOIDING_TYPE = {
    size: 10,
    sensorTypes: [SIGNAL_TYPE.HAZARD],
    signal: null,
    color: [255, 130, 0],
    brain: [AVOID]
}

class Population {

    constructor(size, traits, evolve) {
        this.size = size;
        this.agentSize = traits.size;
        this.sensorTypes = traits.sensorTypes;
        this.brains = traits.brain;
        this.signal = traits.signal;
        this.color = color(traits.color);

        this.newNeuronMutationRate = evolve.newNeuron;
        this.newSynapseMutationRate = evolve.newSynapse;
        this.randomWeightMutationRate = evolve.randomWeight;
        this.randomBiasMutationRate = evolve.randomBias;
        this.randomThresholdMutationRate = evolve.randomThreshold;  

        this.vehicles = [];
        this.champions = []; // Stores the individuals with highest fitnessScore, a.k.a. champions.
        this.generation = 0;
        this.idGenerator = 0;

        this.matingPool = [];
        this.genePool =  new GenePool(traits.sensorTypes);   
    }
     
    // populate generates this.size new individuals, each with a new genome and neural circuit.
    populate() {
        for (var i = 0; i < this.size; i++) {    
            let v = new Vehicle(random(canvasWidth), random(canvasHeight), this);
            v.genome = new Genome();
            // iniatilize genome with full topology from genePool (all edges).
            v.genome.initializeGenes(this.genePool);
            v.connectNeuralCircuit();
            
            if (this.brains == "random") {
                v.brain.randomize();
            } else {
                v.brain.build(this.brains);
            }
            console.log(v.brain)
            this.addVehicle(v);
        }
    }

    // addVehicle receives a Vehicle object and ads it to current array of vehicles.
    addVehicle(itm) {
      itm.id = ++this.idGenerator;
      this.vehicles.push(itm);
    }

    // function fitness computes the fitness score for each vehicle in this population.
    // It resized each fitnessScore so that it represents a fraction of a total.
    fitness() {
        var sum = 0;
        for (let i = 0; i < this.vehicles.length; i++) {
            sum += this.vehicles[i].fitnessScore;
        }

        for (let i = 0; i < this.vehicles.length; i++) {
            // resize fitnessScore
            this.vehicles[i].fitnessScore = (this.vehicles[i].fitnessScore / sum).toFixed(2);
        }
    }

    // sortByFitnessScore sorts this.vehicles array in a descendent fashion considering their fitnessScores.
    sortVehiclesByFitnessScore() {
        this.vehicles.sort(function(a,b){return b.fitnessScore - a.fitnessScore});
    }

    // selection fills the matingPool array for selection based on probability (wheel of fortune).
    selection() {
        this.champions = [];
        this.matingPool = []; // matingPool will have length 100
        this.sortVehiclesByFitnessScore(); // Order vehicles in decreasing order of fitnessScore.
        console.log(this.vehicles);

        // find total of all fitness scores
        let total = 0;
        for (let i = 0; i < this.size; i++) {
            total += this.vehicles[i].fitnessScore;
        }

        // Select champions to copy
        for (let i = 0; i < config.numberCopied; i++) {
            this.champions.push(this.vehicles[i]);
        }

        // Create mating pool so that a vehicle's probability of mating is equivalent to its fitness score
        // divided by the total fitness score of the population
        for (let i = 0; i < this.size; i++) {
            // add vehicles[i] to mating pool a number of times proportionate to its fitness score.
            let nTimes = Math.round(this.vehicles[i].fitnessScore / total * 100);
            for (let j = 0; j < nTimes; j++) {
                this.matingPool.push(this.vehicles[i]);
            }
        }
    }
    
    // reproduction generates a next generation on individuals using the mating pool from current generation. 
    // style parameter can be 0 (default) for normal crossover, or 1 for biased crossover.
    reproduction(style = 0) {
        this.killThemAll();

        // Copy the the champions from previous generation. 
        for (let i = 0; i < config.numberCopied; i++) {
            this.champions[i].fitnessScore = 0;
            this.addVehicle(this.champions[i]);
        }

        // Create the rest of individuals by selecting parents from the mating pool
        for (let i = config.numberCopied; i < this.size; i++) {
            
            // randomly select two parents from the mating pool
            var parent1 = random(this.matingPool);
            var parent2 = null;
            var child;
            do {
                parent2 = random(this.matingPool);
            } while(parent1.id === parent2.id);

            // create new child 
            if (style == 0) { // normal crossover
                // Obtain a child object with genome product of parents's genome crossover.
                // Vehicle.mate returns an object with connected neural circuit.
                child = Vehicle.mate(parent1, parent2);
            } else if (style == 1) { // biased crossover
                if (parent1.fitnessScore > parent2.fitnessScore) {
                    child = Vehicle.mateBiased(parent1, parent2, child);
                } else {
                    child = Vehicle.mateBiased(parent2, parent1, child);
                }
            }

            // add new child to population
            this.addVehicle(child);
        }
    }

    // killOne receives an Vehicle object and removes it from current array of vehicles.
    killOne(itm) {
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            if (this.vehicles[i].id === itm.id) {
                this.vehicles.splice(i, 1);
            }
        }
    }

    // killThemAll sets the current vehicles array as empty.
    killThemAll() {
        this.vehicles = [];
    }
    
    // update function is called on each frame and updates each object's properties.
    // If enough time has passed, it creates a new generation of vehicles.
    update() {
        generationTimer += deltaT;
        if (config.evolutionActivated && generationTimer > config.generationLifespan) {
            console.log("========== NEW GENERATION ==========")
            generationTimer = 0;
            this.selection();
            this.reproduction();
            this.generation++;
        }
        for (let itm of this.vehicles) {
            itm.update();
        }
    }

    // render function is called on each frame and redraws each vehicle of this population on canvas.
    render() {
        for (let itm of this.vehicles) {
            itm.render();
        } 
    }
}