var game
// Game logic
$(document).ready(function() {
  game = new Game
  View.enablePauseButton()
});

// Game model

function Game() {
  this.resources = {matter: GameOptions.STARTING_MATTER, energy: GameOptions.STARTING_ENERGY};
  this.buildings = [GameOptions.COMMAND_CENTER];
  this.isBuilding = false;
  this.currentBuildOrder = undefined;
  this.currentBuildTicker = 0; // increase this one per tick; check, push and reset in build function

  this.setBuildListeners();
  this.startGameCycle();
}

Game.prototype.startGameCycle = function() {
  setInterval(this.coreGameLoop.bind(this), 500);
}

Game.prototype.coreGameLoop = function() {
  // debugger;
  this.updateResources();
  View.updateBuildProgress(this.buildProgress());
  View.updateBuildingCount(this.calculateBuildingCount());
  View.displayResources(this.resources);
  View.displayResourceFlow(this.calculateResourcesPerCycle());
  // console.log("number of buildings: " + this.buildings.length);
}

Game.prototype.updateResources = function() {
  var resourcesToAdd = this.calculateResourcesPerCycle(); // return {matter: x, energy: y}
  this.resources.matter += resourcesToAdd.matter;
  if (this.resources.matter < 0) {this.resources.matter = 0}
  this.resources.energy += resourcesToAdd.energy;
  if (this.resources.energy < 0) {this.resources.energy = 0}
}

Game.prototype.calculateResourcesPerCycle = function() {
  var matterThisCycle = 0;
  var energyThisCycle = 0;
  for (var i = 0; i < this.buildings.length; i++) {
    matterThisCycle += this.buildings[i].matterProduction;
    energyThisCycle += this.buildings[i].energyProduction;
  }
  // console.log("current energy per cycle: " + energyThisCycle );
  return {matter: matterThisCycle, energy: energyThisCycle}
}

Game.prototype.calculateBuildingCount = function() {
  var buildings = {}
  for (var i = 0; i < this.buildings.length; i++) {
    if( buildings[this.buildings[i].name]) {
      buildings[this.buildings[i].name] += 1;
    } else {
      buildings[this.buildings[i].name] = 1;
    }
  }
  return buildings;
}

Game.prototype.setBuildListeners = function() {
  $("#new-solar").on("click", buildSolarPlant.bind(this));
  $("#new-mine").on("click", buildMatterMine.bind(this));
}

Game.prototype.buildProgress = function() {
  var percentBuilt = 0;
  if (this.currentBuildOrder) {
    this.currentBuildTicker++;
    percentBuilt = (this.currentBuildTicker / this.currentBuildOrder.buildTime) * 100;
    if (this.currentBuildTicker === this.currentBuildOrder.buildTime) {
      this.buildings.push(this.currentBuildOrder);
      this.currentBuildOrder = undefined;
      this.currentBuildTicker = 0;
    }
  }
  // debugger;
  return percentBuilt; // return an integer between 0 and 100
}

Game.prototype.constructBuilding = function() {

}

function buildSolarPlant() {
  var building = new Building({name: "Solar Power Plant",
                                matterCost: 150,
                                energyCost: 800,
                                matterProduction: 0,
                                energyProduction: 20,
                                buildTime: 10});
  if ((building.matterCost < this.resources.matter) &&
      (building.energyCost < this.resources.energy) &&
      (!this.currentBuildOrder)) {
    this.currentBuildOrder = building;
    this.resources.matter -= building.matterCost;
    this.resources.energy -= building.energyCost;
  } else {
    console.log("insuffcient funds or already building");
  }
}

function buildMatterMine() {
  var building = new Building({name: "Matter Mine",
                                matterCost: 50,
                                energyCost: 520,
                                matterProduction: 2,
                                energyProduction: -5,
                                buildTime: 20});
  if ((building.matterCost < this.resources.matter) &&
      (building.energyCost < this.resources.energy) &&
      (!this.currentBuildOrder)) {
    this.currentBuildOrder = building;
    this.resources.matter -= building.matterCost;
    this.resources.energy -= building.energyCost;
  } else {
    console.log("insuffcient funds or already building");
  }
}

// Game constants

var GameOptions = {
  STARTING_MATTER: 1000,
  STARTING_ENERGY: 5000,
  COMMAND_CENTER: new Building({name: "Command Center",
                                matterCost: 5000,
                                energyCost: 50000,
                                matterProduction: 2,
                                energyProduction: 25,
                                buildTime: 1000})
}

// Buildings List

var BuildingsList = {
  "Matter Mine":       {name: "Matter Mine",
                        matterCost: 50,
                        energyCost: 520,
                        matterProduction: 2,
                        energyProduction: -5,
                        buildTime: 20},

  "Solar Power Plant": {name: "Solar Power Plant",
                        matterCost: 150,
                        energyCost: 800,
                        matterProduction: 0,
                        energyProduction: 20,
                        buildTime: 10}
}


// Building model

function Building(options) {
  this.name = options.name;
  this.matterCost = options.matterCost;
  this.energyCost = options.energyCost;
  this.matterProduction = options.matterProduction;
  this.energyProduction = options.energyProduction;
  this.buildTime = options.buildTime;
}

// View

var View = {}

View.displayResources = function(resources) {
  $("#matter-display").text("Matter: " + resources.matter);
  $("#energy-display").text("Energy: " + resources.energy);
}

View.displayResourceFlow = function(flow) {
  $("#net-matter-flow").text(flow.matter);
  $("#net-energy-flow").text(flow.energy);
}

// TODO: refactor to allow any number of building names / counts
View.updateBuildingCount = function(buildings) {
  $("#solar-plant-count").html("Solar Power Plants: " + (buildings["Solar Power Plant"] || "0"));
  $("#matter-mine-count").html("Matter Mines: " + (buildings["Matter Mine"] || "0"));
}

View.updateBuildProgress = function(progress) {
  // debugger;
  $("progress").attr("value", progress);
}

View.enablePauseButton = function() {
  $("#pause").on("click", function() {alert("Game Paused.")})
}
