import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsHEATHERClass extends NeonLordsClassBase {
  get name() {
    return "H.E.A.T.H.E.R.";
  }

  get classPointName() {
    return "Hella";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get firearmToTheMaxTable() {
    return this.name + " - To the MAX!";
  }

  get gearSlots() {
    return 3;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}