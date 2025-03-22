import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsWarWizardClass extends NeonLordsClassBase {
  get name() {
    return "War Wizard";
  }

  get classPointName() {
    return "Khaos";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 6;
  }

  get meleeToTheMaxTable() {
    return "Caster Class Melee - To the MAX!";
  }

  get meleeToTheMaxDie() {
    return "d6";
  }

  get spellcastingAbility() {
    return "brains";
  }

  get spellcastingBummerTable() {
    return "Spell Misfire";
  }

  get spellcastingToTheMaxTable() {
    return this.name + " - To the MAX!";  
  }
}