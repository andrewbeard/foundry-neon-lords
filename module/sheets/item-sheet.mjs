import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Extend the base ItemSheetV2 with some very simple modifications
 * @extends ItemSheetV2
 */
export class NeonLordsItemSheet extends HandlebarsApplicationMixin(
  ItemSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['neon-lords', 'sheet', 'item'],
    tag: 'form',
    position: {
      width: 520,
      height: 480,
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
      template: 'systems/neon-lords/templates/item/item-sheet.hbs',
    },
  };

  /** @override */
  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const path = 'systems/neon-lords/templates/item';
    // Return a single sheet for all item types.
    // parts.form = { template: `${path}/item-sheet.hbs` };

    // Alternatively, use the following to do a unique item sheet by type,
    // like `item-weapon-sheet.hbs`.
    parts.form = { template: `${path}/item-${this.item.type}-sheet.hbs` };
    return parts;
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Retrieve base data structure.
    const context = await super._prepareContext(options);

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    context.editable = this.isEditable;

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.NEON_LORDS
    context.config = CONFIG.NEON_LORDS;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
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
      initial: 'description',
    });
    this._tabs.bind(html);

    // Image edit (portrait)
    html.querySelectorAll('img[data-edit]').forEach((img) => {
      img.addEventListener('click', (ev) => this._onEditImage(ev));
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Active Effect management
    html.querySelectorAll('.effect-control').forEach((el) => {
      el.addEventListener('click', (ev) => onManageActiveEffect(ev, this.item));
    });
  }

  /**
   * Handle the item image being clicked to open the file picker.
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
}
