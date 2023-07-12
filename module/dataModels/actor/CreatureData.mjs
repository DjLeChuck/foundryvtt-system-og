import { BaseActorData } from './BaseActorData.mjs';

export class CreatureData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;

    return Object.assign({}, super.defineSchema(), {
      description: new fields.HTMLField(),
      cavemanName: new fields.StringField({
        required: true,
      }),
      armor: new fields.NumberField(),
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
