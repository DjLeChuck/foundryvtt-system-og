export class AbilityData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      description: new fields.HTMLField(),
      exclusive: new fields.BooleanField(),
      free: new fields.BooleanField(),
      learned: new fields.BooleanField(),
    };
  }
}
