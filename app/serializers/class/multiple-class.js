import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  /**
   * Normalize an array of object mulitple class
   * @param payload the multiple class payload
   * @returns {Object[]}
   */
  normalizeMulitpleClass(payload) {
    let result = Ember.A([]);
    if (payload) {
      let secondaryClasses = payload.classes ? payload.classes : Ember.A([]);
      if (secondaryClasses && secondaryClasses.length) {
        secondaryClasses.forEach(secondaryClass => {
          result.push(
            Ember.Object.create({
              id: secondaryClass.id,
              title: secondaryClass.title,
              code: secondaryClass.code
            })
          );
        });
      }
    }
    return result;
  }
});
