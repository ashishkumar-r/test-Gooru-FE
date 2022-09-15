import Ember from 'ember';
import PortfolioAdapter from 'gooru-web/adapters/portfolio';
import PortfolioSerializer from 'gooru-web/serializers/portfolio';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { getTaxonomyIdsBySearchContent } from 'gooru-web/utils/utils';

export default Ember.Service.extend({
  session: Ember.inject.service(),

  portfolioAdapter: null,

  portfolioSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'portfolioAdapter',
      PortfolioAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'portfolioSerializer',
      PortfolioSerializer.create(Ember.getOwner(this).ownerInjection())
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

  getUserPortfolioUniqueItems(
    requestParam,
    contentBase,
    classFramework,
    isDefaultShowFW
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('portfolioAdapter')
        .getUserPortfolioUniqueItems(requestParam, contentBase)
        .then(
          function(response) {
            let portfolioData = service
              .get('portfolioSerializer')
              .serializePortfolioItems(
                response.items,
                requestParam.activityType
              );
            let taxonomyIds = getTaxonomyIdsBySearchContent(
              portfolioData,
              false
            );
            if (isDefaultShowFW && taxonomyIds.length) {
              service
                .getcrosswalkCompetency(
                  portfolioData,
                  classFramework,
                  taxonomyIds
                )
                .then(function() {
                  resolve(portfolioData);
                });
            } else {
              resolve(portfolioData);
            }
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getAllAttemptsByItem(requestParam) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('portfolioAdapter')
        .getAllAttemptsByItem(requestParam)
        .then(
          function(response) {
            resolve(
              service
                .get('portfolioSerializer')
                .serializeActivityAttempts(response.items)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getActivityPerformanceBySession(requestParams, contentType) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('portfolioAdapter')
        .getActivityPerformanceBySession(requestParams, contentType)
        .then(
          function(response) {
            resolve(
              service
                .get('portfolioSerializer')
                .serializeActivityPerformance(response.content)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  getUserPortfolioDetails(requestParams) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('portfolioAdapter')
        .getUserPortfolioDetails(requestParams)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getcrosswalkCompetency: function(portfolioData, classFramework, taxonomyIds) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        portfolioData.map(searchData => {
          let standards = searchData.taxonomy;
          standards.map(data => {
            let taxonomyData = frameworkCrossWalkComp.findBy(
              'sourceDisplayCode',
              data.code
            );
            if (taxonomyData) {
              data.code = taxonomyData.targetDisplayCode;
              data.frameworkCode = taxonomyData.targetFrameworkId;
            }
          });
        });
      });
  }
});
