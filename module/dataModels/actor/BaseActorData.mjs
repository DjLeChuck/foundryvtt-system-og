export class BaseActorData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      unggghhPoints: new fields.NumberField({
        required: true,
        integer: true,
      }),
      evade: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}
