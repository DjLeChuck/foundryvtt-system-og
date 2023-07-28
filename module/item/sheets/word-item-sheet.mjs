import { BaseItemSheet } from './base-item-sheet.mjs';

export class WordItemSheet extends BaseItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      height: 160,
    });
  }
}
