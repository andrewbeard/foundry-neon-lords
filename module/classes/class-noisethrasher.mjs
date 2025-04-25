import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsNoiseThrasherClass extends NeonLordsClassBase {
  get name() {
    return "Noise Thrasher";
  } 

  get classPointName() {
    return "Shred";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 4;
  }

  get meleeToTheMaxTable() {
    return "Caster Class Melee - To the MAX!";
  }

  get meleeToTheMaxDie() {
    return "d10";
  }

  get spellcastingAbility() {
    return "attitude";
  }

  get spellcastingBummerTable() {
    return "Riff Total Bummer!";
  }

  get spellcastingToTheMaxTable() {
    return this.name + " - To the MAX!";  
  }
}