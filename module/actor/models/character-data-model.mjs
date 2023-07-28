import { BaseDataModel } from './base-data-model.mjs';

export class CharacterDataModel extends BaseDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return Object.assign({}, super.defineSchema(), {
      knownWords: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      knownAbilities: new fields.NumberField({
        required: true,
        initial: 3,
        integer: true,
      }),
      attack: new fields.NumberField({
        required: true,
        initial: 5,
        integer: true,
      }),
      damage: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
    });
  }
}
