import Ember from 'ember';
import StrugglingCompetencyAdapter from 'gooru-web/adapters/competency/struggling-competency';
import StrugglingCompetencySerializer from 'gooru-web/serializers/competency/struggling-competency';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
/**
 * Service for the struggling competency
 *
 * @typedef {Object} strugglingCompetencyService
 */
export default Ember.Service.extend({
  strugglingCompetencyAdapter: null,

  strugglingCompetencySerializer: null,

  init() {
    this._super(...arguments);
    this.set(
      'strugglingCompetencyAdapter',
      StrugglingCompetencyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'strugglingCompetencySerializer',
      StrugglingCompetencySerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Get students struggling competency
   * @returns {Promise.<[]>}
   */
  fetchStrugglingCompetency(params, isDefaultShowFW, classFramework) {
    let service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('strugglingCompetencyAdapter')
        .fetchStrugglingCompetency(params)
        .then(response => {
          let strugglingCompetency = service
            .get('strugglingCompetencySerializer')
            .normalizeStrugglingCompetency(response);
          // resolve(strugglingCompetency);
          if (isDefaultShowFW) {
            let taxonomyIds = [];
            strugglingCompetency.map(data => {
              if (data.domains && data.domains.length) {
                data.domains.map(domain => {
                  domain.competencies.map(competency => {
                    let taxonomyId = data.fwCode.concat('.', competency.code);
                    taxonomyIds.pushObject(taxonomyId);
                  });
                });
              }
            });
            if (taxonomyIds.length) {
              service
                .getcrosswalkCompetency(
                  strugglingCompetency,
                  classFramework,
                  taxonomyIds
                )
                .then(function() {
                  resolve(strugglingCompetency);
                });
            } else {
              resolve(strugglingCompetency);
            }
          } else {
            resolve(strugglingCompetency);
          }
        }, reject);
    });
  },

  /**
   * Get students performance
   * @returns {Promise.<[]>}
   */
  fetchStudentsPerfomance(params) {
    let service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('strugglingCompetencyAdapter')
        .fetchStudentsPerfomance(params)
        .then(response => {
          resolve(
            service
              .get('strugglingCompetencySerializer')
              .normalizeStudentsPerfomance(response)
          );
        }, reject);
    });
  },

  fetchAnswerStuggling(params, subjectCode) {
    let service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('strugglingCompetencyAdapter')
        .fetchAnswerStuggling(params, subjectCode)
        .then(response => {
          resolve(
            service
              .get('strugglingCompetencySerializer')
              .answerStrugglingCompetency(response)
          );
        }, reject);
    });
  },

  fetchCheckedAnswerStuggling(params) {
    let service = this;
    let stuggles = service
      .get('strugglingCompetencySerializer')
      .serializeStruggleList(params);
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('strugglingCompetencyAdapter')
        .fetchCheckedAnswerStuggling(stuggles)
        .then(
          () => {
            resolve({});
          },
          () => {
            resolve({});
          }
        );
    });
  },

  getcrosswalkCompetency: function(
    strugglingCompetency,
    classFramework,
    taxonomyIds
  ) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        strugglingCompetency.map(data => {
          if (data.domains && data.domains.length) {
            data.domains.map(domain => {
              domain.competencies.map(competency => {
                let taxonomyData = frameworkCrossWalkComp.findBy(
                  'sourceDisplayCode',
                  competency.displayCode
                );
                if (taxonomyData) {
                  competency.displayCode = taxonomyData.targetDisplayCode;
                }
              });
            });
          }
        });
      });
  }
});
