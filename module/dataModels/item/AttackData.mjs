export class AttackData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      accuracy: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
      damage: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
      description: new fields.HTMLField(),
    };
  }
}
