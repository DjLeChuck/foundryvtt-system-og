import { BaseDataModel } from './base-data-model.mjs';

export class CreatureDataModel extends BaseDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return Object.assign({}, super.defineSchema(), {
      description: new fields.HTMLField(),
      cavemanName: new fields.StringField({
        required: true,
      }),
      armor: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      eatingHabits: new fields.StringField({
        required: true,
        choices: ['carnivorous', 'herbivorous', 'omnivorous'],
        initial: 'herbivorous',
      }),
      eatingHabitsNotes: new fields.StringField(),
      foodValue: new fields.StringField(),
    });
  }
}
