import Ember from 'ember';
import CenturySkillSerializer from 'gooru-web/serializers/century-skill/century-skill';
import CenturySkillAdapter from 'gooru-web/adapters/century-skill/century-skill';

/**
 * Service for the 21 century skills
 *
 * @typedef {Object} century skills Service
 */
export default Ember.Service.extend({
  centurySkillSerializer: null,

  centurySkillAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'centurySkillSerializer',
      CenturySkillSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'centurySkillAdapter',
      CenturySkillAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Return the list of 21 century skills
   * @returns {RSVP.Promise}
   */
  findCenturySkills: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service.get('centurySkillAdapter').getCenturySkills().then(
        function(response) {
          var centurySkillsModel = service
            .get('centurySkillSerializer')
            .normalizeCenturySkills(response);
          resolve(centurySkillsModel);
        },
        function(error) {
          reject(error);
        }
      );
    });
  }
});
