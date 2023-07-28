/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BaseActor extends Actor {
  constructor(docData, context = {}) {
    if (!context.og?.ready) {
      mergeObject(context, { og: { ready: true } });

      const actorConstructor = game.system.og.actorClasses[docData.type];
      if (actorConstructor) {
        return new actorConstructor(docData, context);
      }
    }

    super(docData, context);
  }

  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount.toString()) * multiplier);
    const hp = this.system.unggghhPoints;
    if (!hp) {
      return this;
    }

    // Remaining goes to health
    const dh = Math.clamped(hp.value - amount, 0, Math.max(0, hp.max));

    // Update the Actor
    this.update({
      'system.unggghhPoints.value': dh,
    });
  }

  getChatSpeaker() {
    return ChatMessage.getSpeaker({ actor: this });
  }
}
