import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class NeonLordsActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['neon-lords', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'attributes',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/neon-lords/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

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
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
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
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }

    // Add context menu for rollable links
    html.find('.rollable').contextmenu(ev => {
      ev.preventDefault();
      const rollable = ev.currentTarget;
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
                    roll: `${roll}${modifier >= 0 ? '+' : ''}${modifier}`,
                    label: `${label}${modifier >= 0 ? '+' : ''}${modifier}`
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
    });
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

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let type = dataset.rollCategory ? `[${dataset.rollCategory}] ` : '';
      let label = dataset.label ? `${type}${dataset.label}` : '';
      
      // For ability score rolls, roll directly against the ability value (roll under)
      if (dataset.rollCategory === 'STATS' && dataset.label) {
        const abilityName = dataset.label.toLowerCase();
        const targetNumber = this.actor.system.abilities[abilityName]?.value;
        
        if (targetNumber !== undefined) {
          this._handleDirectRoll(dataset.roll, label, targetNumber, true);
          return;
        }
      }
      
      // For saving throws, roll directly against the save value (roll over)
      if (dataset.rollCategory === 'Saving Throw' && dataset.label) {
        const saveName = dataset.label.toLowerCase();
        const targetNumber = this.actor.system.saves[saveName]?.value;
        
        if (targetNumber !== undefined) {
          this._handleDirectRoll(dataset.roll, label, targetNumber, false);
          return;
        }
      }

      // For all other rolls (including attacks), just show the result
      this._handleSimpleRoll(dataset, label);
      return;
    }
  }

  /**
   * Handle a direct roll against a target number without showing a dialog
   * @param {string} formula The roll formula
   * @param {string} label The roll label
   * @param {number} targetNumber The target number to roll against
   * @param {boolean} rollUnder Whether success is determined by rolling under the target (true) or over (false)
   * @private
   */
  async _handleDirectRoll(formula, label, targetNumber, rollUnder = false) {
    const roll = new Roll(formula, this.actor.getRollData());
    const result = await roll.evaluate();
    
    const total = result.total;
    const isSuccess = rollUnder ? total <= targetNumber : total >= targetNumber;
    const successText = isSuccess 
      ? `<span style="color: #009900; font-weight: bold;">✓ Success!</span> (${total} ${rollUnder ? '≤' : '≥'} ${targetNumber})`
      : `<span style="color: #990000; font-weight: bold;">✗ Failure!</span> (${total} ${rollUnder ? '>' : '<'} ${targetNumber})`;
    
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${label}<br>${successText}`,
      rollMode: game.settings.get('core', 'rollMode')
    });
  }

  /**
   * Handle a simple roll without target number
   * @param {object} dataset The dataset of the roll
   * @param {string} label The label of the roll
   * @private
   */
  async _handleSimpleRoll(dataset, label) {
    const roll = new Roll(dataset.roll, this.actor.getRollData());
    const result = await roll.evaluate();
    
    // Check for fumble on attack rolls (natural 1)
    const isAttack = label.includes('[Attack]');
    const isFumble = isAttack && result.terms[0].results[0].result === 1;
    const isToTheMax = isAttack && result.terms[0].results[0].result >= this.actor.system.critRange;
    
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
    const enrichedResultText = await TextEditor.enrichHTML(resultText, {
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
