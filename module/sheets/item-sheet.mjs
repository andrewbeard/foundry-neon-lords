import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends ItemSheet
 */
export class NeonLordsItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheet
) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ['neon-lords', 'sheet', 'item'],
    position: {
      width: 520,
      height: 480,
    },
    window: {
      resizable: true,
    },
  });

  static PARTS = {
    sheet: {
      template: '',
      root: true,
    },
  };

  static TABS = {
    primary: {
      tabs: [
        { id: 'description' },
        { id: 'attributes' },
        { id: 'effects' },
      ],
      initial: 'description',
    },
  };

  _configureRenderParts(options) {
    const parts = super._configureRenderParts(options);
    const path = 'systems/neon-lords/templates/item';
    parts.sheet.template = `${path}/item-${this.document.type}-sheet.hbs`;
    return parts;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    if (this.tabGroups.primary) {
      this.changeTab(this.tabGroups.primary, 'primary', {
        force: true,
        updatePosition: false,
      });
    }
    this._activateListeners(this.window?.content ?? this.element);
  }

  /* -------------------------------------------- */

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;

    // Use a safe clone of the item data for further operations.
    const itemData = item.toPlainObject();

    // Ensure expected core references exist in the context.
    context.item = item;

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      item.system.description ?? '',
      {
        // Whether to show secret blocks in the finished html
        secrets: item.isOwner,
        async: true,
        // Data to fill in for inline rolls
        rollData: item.getRollData(),
        // Relative UUID resolution
        relativeTo: item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.NEON_LORDS
    context.config = CONFIG.NEON_LORDS;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(item.effects);

    return context;
  }

  /* -------------------------------------------- */

  _activateListeners(html) {
    const $html = html instanceof HTMLElement ? $(html) : html;

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    $html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.document)
    );
  }
}
