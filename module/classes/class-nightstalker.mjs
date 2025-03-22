import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsNightStalkerClass extends NeonLordsClassBase {
  get name() {
    return "Night Stalker";
  }

  get classPointName() {
    return "Stealth";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 1;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}