import { BaseActorData } from './BaseActorData.mjs';

export class CharacterData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;

    return Object.assign({}, super.defineSchema(), {
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
