import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the base ActorSheetV2 with some very simple modifications
 * @extends ActorSheetV2
 */
export class NeonLordsActorSheet extends HandlebarsApplicationMixin(
  ActorSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['neon-lords', 'sheet', 'actor'],
    tag: 'form',
    position: {
      width: 600,
      height: 600,
    },
    window: {
      resizable: true,
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
  };

  /** @override */
  static PARTS = {
    form: {
      template: 'systems/neon-lords/templates/actor/actor-character-sheet.hbs',
    },
  };

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    parts.form = {
      template: `systems/neon-lords/templates/actor/actor-${this.actor.type}-sheet.hbs`,
    };
    return parts;
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = await super._prepareContext(options);

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    context.actor = this.actor;
    context.editable = this.isEditable;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.items = actorData.items;

    // Adding a pointer to CONFIG.NEON_LORDS
    context.config = CONFIG.NEON_LORDS;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const attacks = [];
    const features = [];
    const gear = [];
    const mutations = [];
    const spells = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };
    let hairstyle;

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'gear') {
        gear.push(i);
      }
      else if (i.type === 'feature') {
        features.push(i);
      }
      else if (i.type === 'attack') {
        attacks.push(i);
      }
      else if (i.type === 'mutation') {
        mutations.push(i);
      }
      else if (i.type === 'hairstyle') {
        hairstyle = i;
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.attacks = attacks;
    context.features = features;
    context.gear = gear;
    context.hairstyle = hairstyle;
    context.mutations = mutations;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);

    const html = this.element;
    html.setAttribute('autocomplete', 'off');

    // Tab navigation (DOM-based replacement for the old jQuery Tabs helper)
    this._tabs ??= new foundry.applications.ux.Tabs({
      navSelector: '.sheet-tabs',
      contentSelector: '.sheet-body',
      initial: 'attributes',
    });
    this._tabs.bind(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.querySelectorAll('.item-edit').forEach((el) => {
      el.addEventListener('click', (ev) => {
        const li = ev.currentTarget.closest('.item');
        const item = this.actor.items.get(li.dataset.itemId);
        item?.sheet.render(true);
      });
    });

    // Image edit (portrait)
    html.querySelectorAll('img[data-edit]').forEach((img) => {
      img.addEventListener('click', (ev) => this._onEditImage(ev));
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.querySelectorAll('.item-create').forEach((el) => {
      el.addEventListener('click', this._onItemCreate.bind(this));
    });

    // Delete Inventory Item
    html.querySelectorAll('.item-delete').forEach((el) => {
      el.addEventListener('click', (ev) => {
        const li = ev.currentTarget.closest('.item');
        const item = this.actor.items.get(li.dataset.itemId);
        item?.delete();
      });
    });

    // Active Effect management
    html.querySelectorAll('.effect-control').forEach((el) => {
      el.addEventListener('click', (ev) => {
        const row = ev.currentTarget.closest('li');
        const document =
          row.dataset.parentId === this.actor.id
            ? this.actor
            : this.actor.items.get(row.dataset.parentId);
        onManageActiveEffect(ev, document);
      });
    });

    // Rollable abilities.
    html.querySelectorAll('.rollable').forEach((el) => {
      el.addEventListener('click', this._onRoll.bind(this));
      // Add context menu for rollable links
      el.addEventListener('contextmenu', (ev) => this._onRollContextMenu(ev));
    });

    // Drag events for macros.
    if (this.actor.isOwner) {
      html.querySelectorAll('li.item').forEach((li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', this._onDragStart.bind(this), false);
      });
    }
  }

  /**
   * Handle the right-click "add modifier" popup for rollable elements.
   * @param {Event} event   The originating contextmenu event
   * @private
   */
  _onRollContextMenu(event) {
    event.preventDefault();
    const rollable = event.currentTarget;
    const roll = rollable.dataset.roll;
    const label = rollable.dataset.label || 'Roll';

    // Create and show dialog
    new Dialog({
      title: `Add Modifier to ${label}`,
      content: `
        <form>
          <div class="form-group">
            <label>Modifier:</label>
            <input type="number" name="modifier" value="0" step="1">
          </div>
        </form>
      `,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: 'Roll',
          callback: (html) => {
            const modifier = parseInt(html.find('input[name="modifier"]').val()) || 0;
            // Create a synthetic event with the modified roll
            const modifiedEvent = {
              currentTarget: {
                dataset: {
                  ...rollable.dataset,
                  modifier: modifier,
                }
              },
              preventDefault: () => {}
            };
            // Trigger the roll using the existing _onRoll method
            this._onRoll(modifiedEvent);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'roll'
    }).render(true);
  }

  /**
   * Handle the portrait image being clicked to open the file picker.
   * @param {Event} event   The originating click event
   * @private
   */
  _onEditImage(event) {
    const attr = event.currentTarget.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const fp = new FilePicker({
      type: 'image',
      current,
      callback: (path) => this.document.update({ [attr]: path }),
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle HP reroll
    if (dataset.label === 'NPC HP') {
      const roll = new Roll(dataset.roll);
      roll.evaluate().then(result => {
        // Update the HP value with the roll result
        this.actor.update({
          'system.hp.value': result.total,
          'system.hp.max': result.total
        });
      });
      return;
    }

    let type = dataset.rollCategory ? `[${dataset.rollCategory}] ` : '';
    let label = dataset.label ? `${type}${dataset.label}` : '';

    if (dataset.rollCategory === 'STATS' && dataset.label) {
      // For ability score rolls, roll directly against the ability value (roll under)
      this.actor.system.rollSkillCheck(dataset, this.actor);
    } else if (dataset.rollCategory === 'Saving Throw' && dataset.label) {
      // For saving throws, roll directly against the save value (roll over)
      this.actor.system.rollSave(dataset, this.actor);
    } else if (dataset.rollCategory === "Spell Check") {
      this.actor.system.rollSpellCheck(dataset, this.actor);
    } else if (dataset.rollCategory === "Spell Pool") {
        this.actor.system.rollSpellPool(dataset, this.actor);
    } else if (dataset.rollCategory === "Attack") {
      this._handleAttackRoll(dataset);
    } else if (dataset.roll) {
      // For all other rolls (including attacks), just show the result
      this._handleSimpleRoll(dataset, label);
    } else {
      console.log('No roll info found');
    }
  }

  /**
   * Handle an attack roll without target number
   * @param {object} dataset The dataset of the roll
   * @private
   */
  async _handleAttackRoll(dataset) {
    let rollMod = "";
    if (dataset?.modifier) {
      rollMod += ` +${dataset.modifier}`;
    }
    const roll = new Roll(dataset.roll + rollMod, this.actor.getRollData());
    const result = await roll.evaluate();

    // Check for fumble on attack rolls (natural 1)
    const isFumble = result.terms[0].results[0].result === 1;
    const isToTheMax = result.terms[0].results[0].result >= this.actor.system.critRange;

    let resultText;
    if (isFumble) {
      resultText = `<span style="color: #990000; font-weight: bold;">Fumble!</span> (${result.total})<br><br>`;
      if (dataset.firearm === "true") {
        resultText += await this.actor.system.firearmTotalBummer();
      } else {
        resultText += await this.actor.system.meleeTotalBummer();
      }
    } else if (isToTheMax) {
      resultText = `<span style="color: #009900; font-weight: bold;">TO THE MAX!!</span> (${result.total})<br><br>`;
      if (dataset.firearm === "true") {
        resultText += await this.actor.system.firearmToTheMax();
      } else {
        resultText += await this.actor.system.meleeToTheMax();
      }
    } else {
      resultText = `Roll: ${result.total}`;
    }
    const enrichedResultText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(resultText, {
      async: true,
      rollData: this.actor.getRollData(),
      relativeTo: this.actor,
    });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `[Attack] ${dataset.label}<br>${enrichedResultText}`,
      rollMode: game.settings.get('core', 'rollMode')
    });
  }

  /**
   * Handle a simple roll without target number
   * @param {object} dataset The dataset of the roll
   * @private
   */
  async _handleSimpleRoll(dataset, label) {
    let rollMod = "";
    if (dataset?.modifier) {
      rollMod += ` +${dataset.modifier}`;
    }
    const roll = new Roll(dataset.roll + rollMod, this.actor.getRollData());
    const result = await roll.evaluate();

    const resultText = `Roll: ${result.total}`;
    const enrichedResultText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(resultText, {
      async: true,
      rollData: this.actor.getRollData(),
      relativeTo: this.actor,
    });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${label}<br>${enrichedResultText}`,
      rollMode: game.settings.get('core', 'rollMode')
    });
  }
}
