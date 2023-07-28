export class OgBaseActorData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      unggghhPoints: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        min: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        max: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      evade: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}
