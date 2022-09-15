import Ember from 'ember';
import SearchSerializer from 'gooru-web/serializers/search/search';
import SearchAdapter from 'gooru-web/adapters/search/search';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { getTaxonomyIdsBySearchContent } from 'gooru-web/utils/utils';

/**
 * Service to support the Search of Collections and Resources
 *
 * @typedef {Object} SearchService
 */
export default Ember.Service.extend({
  searchSerializer: null,

  searchAdapter: null,

  /**
   * Make a cache of competency content and make use of offset as well to avoid recursive API
   */
  competencyContentContainer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'searchSerializer',
      SearchSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'searchAdapter',
      SearchAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set('competencyContentContainer', []);
  },

  /**
   * Search for collections
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise}
   */
  searchCollections: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchCollections(term, params, resetPagination)
        .then(function(response) {
          let searchCollectionsResponse = service
            .get('searchSerializer')
            .normalizeSearchCollections(response, params.isSuggestion);
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            searchCollectionsResponse,
            false
          );
          if (params.isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                searchCollectionsResponse,
                params.classFramework,
                taxonomyIds
              )
              .then(function() {
                resolve(searchCollectionsResponse);
              });
          } else {
            resolve(searchCollectionsResponse);
          }
        }, reject);
    });
  },

  searchCollectionsOpenAllKey: function(
    term,
    params,
    searchText,
    resetPagination = false,
    isSuggestion = false
  ) {
    const service = this;
    let searchForItem = {
      searchCollections: CONTENT_TYPES.COLLECTIONS,
      searchAssessments: CONTENT_TYPES.ASSESSMENTS,
      searchOfflineActivity: CONTENT_TYPES.OFFLINE_ACTIVITIES
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchCollectionsOpenAllKey(
          term,
          params,
          searchText,
          resetPagination,
          isSuggestion
        )
        .then(function(response) {
          let contentType = searchForItem[term];
          if (params.isShowDiagnosticAssessent) {
            contentType = 'diagnosticAssessments';
          }
          let isDefaultShowFW = params.isDefaultShowFW;
          let classFramework = params.classFramework;
          let result = service.filterActiveSearchContent(
            response,
            contentType,
            isSuggestion
          );

          let searchCollections = service
            .get('searchSerializer')
            .normalizeSearchCollections(result, isSuggestion);
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            searchCollections,
            false
          );
          if (isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                searchCollections,
                classFramework,
                taxonomyIds
              )
              .then(function() {
                resolve(searchCollections);
              });
          } else {
            resolve(searchCollections);
          }
        }, reject);
    });
  },

  /**
   * Helpt to filter the search content from the CAP API
   */
  filterActiveSearchContent(response, contentType, isSuggestion = false) {
    let searchContent = response.contents[contentType];
    if (isSuggestion) {
      const { signatureCollections, signatureAssessments } = response.contents;
      if (contentType === CONTENT_TYPES.COLLECTIONS) {
        searchContent.searchResults = [
          ...(searchContent.searchResults || []),
          ...(signatureCollections.searchResults || [])
        ];
      }
      if (contentType === CONTENT_TYPES.ASSESSMENTS) {
        searchContent.searchResults = [
          ...(searchContent.searchResults || []),
          ...(signatureAssessments.searchResults || [])
        ];
      }
    }
    return searchContent;
  },

  /**
   * Search for Offline Activity
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise}
   */
  searchOfflineActivity: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchOfflineActivity(term, params, resetPagination)
        .then(function(response) {
          let searchOfflineActivitiesResponse = service
            .get('searchSerializer')
            .normalizeSearchOfflineActivities(response, params.isSuggestion);
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            searchOfflineActivitiesResponse,
            false
          );
          if (params.isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                searchOfflineActivitiesResponse,
                params.classFramework,
                taxonomyIds
              )
              .then(function() {
                resolve(searchOfflineActivitiesResponse);
              });
          } else {
            resolve(searchOfflineActivitiesResponse);
          }
        }, reject);
    });
  },

  /**
   * Search for assessments
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise}
   */
  searchAssessments: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchAssessments(term, params, resetPagination)
        .then(function(response) {
          let searchAssessmentsResponse = service
            .get('searchSerializer')
            .normalizeSearchAssessments(response, params.isSuggestion);
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            searchAssessmentsResponse,
            false
          );
          if (params.isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                searchAssessmentsResponse,
                params.classFramework,
                taxonomyIds
              )
              .then(function() {
                resolve(searchAssessmentsResponse);
              });
          } else {
            resolve(searchAssessmentsResponse);
          }
        }, reject);
    });
  },

  /**
   * Search for resources
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Resource[]>}
   */
  searchResources: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchResources(term, params, resetPagination)
        .then(
          function(response) {
            let searchResources = service
              .get('searchSerializer')
              .normalizeSearchResources(response);
            let taxonomyIds = getTaxonomyIdsBySearchContent(
              searchResources,
              false
            );
            if (params.isDefaultShowFW && taxonomyIds.length) {
              service
                .getcrosswalkCompetency(
                  searchResources,
                  params.classFramework,
                  taxonomyIds
                )
                .then(function() {
                  resolve(searchResources);
                });
            } else {
              resolve(searchResources);
            }
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for questions
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Question[]>}
   */
  searchQuestions: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchQuestions(term, params, resetPagination)
        .then(
          function(response) {
            let searchQuestions = service
              .get('searchSerializer')
              .normalizeSearchQuestions(response);
            let taxonomyIds = getTaxonomyIdsBySearchContent(
              searchQuestions,
              false
            );
            if (params.isDefaultShowFW && taxonomyIds.length) {
              service
                .getcrosswalkCompetency(
                  searchQuestions,
                  params.classFramework,
                  taxonomyIds
                )
                .then(function() {
                  resolve(searchQuestions);
                });
            } else {
              resolve(searchQuestions);
            }
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for featured courses
   *
   * @param term the term to search
   * @returns {Promise.<Question[]>}
   */
  searchFeaturedCourses: function(term, filters) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchFeaturedCourses(term, filters)
        .then(
          function(response) {
            resolve(
              service.get('searchSerializer').normalizeSearchCourses(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for rubrics
   *
   * @param term the term to search
   * @returns {Promise.<Rubrics[]>}
   */
  searchRubrics: function(term, filters) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchRubrics(term, filters)
        .then(
          function(response) {
            let searchRubrics = service
              .get('searchSerializer')
              .normalizeSearchRubrics(response);
            let taxonomyIds = getTaxonomyIdsBySearchContent(
              searchRubrics,
              false
            );
            if (filters.isDefaultShowFW && taxonomyIds.length) {
              service
                .getcrosswalkCompetency(
                  searchRubrics,
                  filters.classFramework,
                  taxonomyIds
                )
                .then(function() {
                  resolve(searchRubrics);
                });
            } else {
              resolve(searchRubrics);
            }
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for unit
   *
   * @param term the term to search
   * @returns {Promise.<Units[]>}
   */
  searchUnits: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchUnits(term, params, resetPagination)
        .then(
          function(response) {
            resolve(
              service.get('searchSerializer').normalizeSearchUnits(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for lesson
   *
   * @param term the term to search
   * @returns {Promise.<Lessons[]>}
   */
  searchLessons: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchLessons(term, params, resetPagination)
        .then(
          function(response) {
            resolve(
              service.get('searchSerializer').normalizeSearchLessons(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for courses
   *
   * @param term the term to search
   * @returns {Promise.<Question[]>}
   */
  searchCourses: function(term, params, resetPagination = false, filter = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchCourses(term, params, resetPagination, filter)
        .then(
          function(response) {
            let searchCourses = service
              .get('searchSerializer')
              .normalizeSearchCourses(response);
            resolve(searchCourses);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  searchLearningMapCourses: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchLearningMapCourses(params, resetPagination)
        .then(
          function(response) {
            resolve(
              service
                .get('searchSerializer')
                .normalizeSearchLearningMapCourses(response, params.contentType)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Search for courses
   *
   * @param term the term to search
   * @returns {Promise.<Question[]>}
   */
  autoCompleteSearch: function(type, term) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .autoCompleteSearch(type, term)
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

  fetchLearningMapsContentCompetency(
    gutCode,
    filters,
    contentType,
    languageId = false
  ) {
    const service = this;
    let start = filters.start || 0;
    let competencyContentContainer = service.get('competencyContentContainer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let isCompetencyContentAvailable = competencyContentContainer[
        `${gutCode}`
      ]
        ? competencyContentContainer[`${gutCode}`][start] || null
        : null;
      if (isCompetencyContentAvailable) {
        resolve(competencyContentContainer[`${gutCode}`][start]);
      } else {
        service
          .get('searchAdapter')
          .fetchLearningMapsContentCompetency(
            gutCode,
            filters,
            contentType,
            languageId
          )
          .then(
            function(response) {
              let normalizedCompetencyContent = service
                .get('searchSerializer')
                .normalizeLearningMapsContentCompetency(response);
              let fetchedCompetencyContent =
                competencyContentContainer[`${gutCode}`] || [];
              fetchedCompetencyContent[start] = normalizedCompetencyContent;
              competencyContentContainer[
                `${gutCode}`
              ] = fetchedCompetencyContent;
              service.set(
                'competencyContentContainer',
                competencyContentContainer
              );
              resolve(normalizedCompetencyContent);
            },
            function(error) {
              reject(error);
            }
          );
      }
    });
  },

  fetchLearningMapsContent(gutCode, filters) {
    const service = this;
    let start = filters.start || 0;
    let competencyContentContainer = service.get('competencyContentContainer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let isCompetencyContentAvailable = competencyContentContainer[
        `${gutCode}`
      ]
        ? competencyContentContainer[`${gutCode}`][start] || null
        : null;
      if (isCompetencyContentAvailable) {
        resolve(competencyContentContainer[`${gutCode}`][start]);
      } else {
        service
          .get('searchAdapter')
          .fetchLearningMapsContent(gutCode, filters)
          .then(
            function(response) {
              let normalizedCompetencyContent = service
                .get('searchSerializer')
                .normalizeLearningMapsContent(response);
              let fetchedCompetencyContent =
                competencyContentContainer[`${gutCode}`] || [];
              fetchedCompetencyContent[start] = normalizedCompetencyContent;
              competencyContentContainer[
                `${gutCode}`
              ] = fetchedCompetencyContent;
              service.set(
                'competencyContentContainer',
                competencyContentContainer
              );
              resolve(normalizedCompetencyContent);
            },
            function(error) {
              reject(error);
            }
          );
      }
    });
  },

  fetchLearningMapsCompetencyContent(gutCode, filters) {
    const service = this;
    let start = filters.startAt || 0;
    let competencyContentContainer = service.get('competencyContentContainer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let isCompetencyContentAvailable = competencyContentContainer[
        `${gutCode}`
      ]
        ? competencyContentContainer[`${gutCode}`][start] || null
        : null;
      if (isCompetencyContentAvailable) {
        resolve(competencyContentContainer[`${gutCode}`][start]);
      } else {
        service
          .get('searchAdapter')
          .fetchLearningMapsCompetencyContent(gutCode, filters)
          .then(
            function(response) {
              let normalizedCompetencyContent = service
                .get('searchSerializer')
                .normalizeLearningMapsContent(response);
              let fetchedCompetencyContent =
                competencyContentContainer[`${gutCode}`] || [];
              fetchedCompetencyContent[start] = normalizedCompetencyContent;
              competencyContentContainer[
                `${gutCode}`
              ] = fetchedCompetencyContent;
              service.set(
                'competencyContentContainer',
                competencyContentContainer
              );
              resolve(normalizedCompetencyContent);
            },
            function(error) {
              reject(error);
            }
          );
      }
    });
  },

  /**
   * Search for collections
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise}
   */
  searchSignatureContent: function(term, params, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('searchAdapter')
        .searchSignatureContent(term, params, resetPagination)
        .then(function(response) {
          let signatureContent = service
            .get('searchSerializer')
            .normalizeSearchSignatureContents(
              response,
              params.isCollection,
              params.isSuggestion
            );
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            signatureContent,
            false
          );
          if (params.isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                signatureContent,
                params.classFramework,
                taxonomyIds
              )
              .then(function() {
                resolve(signatureContent);
              });
          } else {
            resolve(signatureContent);
          }
        }, reject);
    });
  },

  getcrosswalkCompetency: function(
    searchResponse,
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
        searchResponse.map(searchData => {
          let standards = searchData.standards || searchData.taxonomy;
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
