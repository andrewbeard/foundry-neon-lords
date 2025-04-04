import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsCosmicBarbarianClass extends NeonLordsClassBase {
  get name() {
    return "Cosmic Barbarian";
  }

  get classPointName() {
    return "Cosmic";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 2;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}