import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsSewerSharkClass extends NeonLordsClassBase {
  get name() {
    return "Sewer Shark";
  }

  get classPointName() {
    return "Frenzy";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 3;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}