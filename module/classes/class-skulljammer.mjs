import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsSkullJammerClass extends NeonLordsClassBase {
  get name() {
    return "Skull Jammer";
  }

  get classPointName() {
    return "Hack";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 5;
  }

  get meleeToTheMaxTable() {
    return "Caster Class Melee - To the MAX!";
  }

  get meleeToTheMaxDie() {
    return "d10";
  }

  get spellcastingAbility() {
    return "brains";
  }

  get spellcastingBummerTable() {
    return "Hacking Total Bummer!";
  }

  get spellcastingToTheMaxTable() {
    return this.name + " - To the MAX!";  
  }
}