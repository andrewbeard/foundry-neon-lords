import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsCyberskinClass extends NeonLordsClassBase {
  get name() {
    return "Cyberskin";
  }

  get classPointName() {
    return "RAM";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get firearmToTheMaxTable() {
    return null;
  }

  get gearSlots() {
    return 5;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}