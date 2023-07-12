export class WordData extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      common: new fields.BooleanField(),
    };
  }
}
