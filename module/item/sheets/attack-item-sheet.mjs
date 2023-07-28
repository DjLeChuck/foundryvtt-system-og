import { BaseItemSheet } from './base-item-sheet.mjs';

export class AttackItemSheet extends BaseItemSheet {
  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = await super.getData();
    const itemData = context.item;

    context.enrichedDamageNote = await TextEditor.enrichHTML(itemData.system.damageNote, { async: true });

    return context;
  }
}
