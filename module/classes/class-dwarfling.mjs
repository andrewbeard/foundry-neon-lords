import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsDwarflingClass extends NeonLordsClassBase {
  get name() {
    return "Dwarfling";
  }

  get classPointName() {
    return "Fortune";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get firearmToTheMaxTable() {
    return this.name + " - To the MAX!";
  }

  get gearSlots() {
    return 2;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }
}