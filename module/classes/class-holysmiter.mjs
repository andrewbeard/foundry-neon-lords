import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsHolySmiterClass extends NeonLordsClassBase {
  get name() {
    return "Holy Smiter";
  }

  get classPointName() {
    return "Faith";
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

  get spellcastingBummerTable() {
    return "Prayers Total Bummer!";
  }

  get spellPool() {
    return true;
  }  
}