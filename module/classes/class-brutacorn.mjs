import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsBrutacornClass extends NeonLordsClassBase {
  get name() {
    return "Brutacorn";
  }

  get classPointName() {
    return "Mythical";
  }

  get classPointsTablee() {
    return this.name + " - Class Points";
  }

  get firearmsToTheMaxTable() {
    return this.name + " - To the MAX!";
  }

  get gearSlots() {
    return 2;
  }

  get meleeToTheMaxTable() {
    return this.name + " - To the MAX!";
  }

  get meleeToTheMaxDie() {
    return "d20"
  }

  get spellcastingAbility() {
    return "brains";
  }

  get spellcastingBummerTable() {
    return "Spell Misfire";
  }

  get spellcastingToTheMaxTable() {
    return null;
  }
}