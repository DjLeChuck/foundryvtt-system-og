import { OgItemSheet } from './item-sheet.mjs';

export class OgAttackSheet extends OgItemSheet {
  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = await super.getData();
    const itemData = context.item;

    context.enrichedDamageNote = await TextEditor.enrichHTML(itemData.system.damageNote, { async: true });

    return context;
  }
}
