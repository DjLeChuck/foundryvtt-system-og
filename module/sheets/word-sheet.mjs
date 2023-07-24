import { OgItemSheet } from './item-sheet.mjs';

export class OgWordSheet extends OgItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      height: 160,
    });
  }
}
