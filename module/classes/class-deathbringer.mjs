import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsDeathBringerClass extends NeonLordsClassBase {
  get name() {
    return "Death Bringer";
  }

  get classPointName() {
    return "Fury";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get critRange() {
    return 19;
  }

  get gearSlots() {
    return 2;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}