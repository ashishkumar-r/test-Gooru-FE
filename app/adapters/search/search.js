import Ember from 'ember';
import ResourceModel from 'gooru-web/models/content/resource';
import QuestionModel from 'gooru-web/models/content/question';
import {
  ROLES,
  DEFAULT_SEARCH_PAGE_SIZE,
  TEACHER,
  STUDENTS,
  CONTENT_TYPES
} from 'gooru-web/config/config';

/**
 * Adapter to support the Search for Collections, Assessments, Resources and Questions
 *
 * @typedef {Object} SearchAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/gooru-search/rest/v2/search',

  namespaceV1: '/gooru-search/rest/v1/cap/content/search',

  pedagogySearch: '/gooru-search/rest/v1/pedagogy-search',

  /**
   * Fetches the collections that match with the term
   *
   * @param term the term to search
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Collection[]>}
   */
  searchCollections: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/scollection`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        'flt.collectionType': 'collection,collection-external',
        'flt.publishStatus': 'published',
        start: page + 1,
        length: pageSize
      }
    };
    const taxonomies = params.taxonomies;
    if (Ember.isArray(taxonomies) && taxonomies.length > 0) {
      options.data['flt.standard'] = taxonomies.join(',');
    }
    adapter.appendFilters(params, options);
    if (params.audienceFilter) {
      adapter.appendAudienceFilters(options);
    }
    if (params.fwCode) {
      options.data['flt.fwCode'] = params.fwCode;
    }
    if (params.excludeNonCrosswalkableContents) {
      options.data.excludeNonCrosswalkableContents =
        params.excludeNonCrosswalkableContents;
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the collections that match with the term
   *
   * @param term the term to search
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Collection[]>}
   */
  searchCollectionsOpenAllKey: function(
    term,
    params = {},
    searchText,
    resetPagination = false,
    isSuggestion
  ) {
    const adapter = this;
    const url = this.get('namespaceV1');
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let searchForItem = {
      searchCollections: CONTENT_TYPES.COLLECTION,
      searchAssessments: CONTENT_TYPES.ASSESSMENT,
      searchOfflineActivity: CONTENT_TYPES.OFFLINE_ACTIVITY
    };

    let includeContentTypes =
      params && params.filters && params.filters['flt.includeContentTypes']
        ? params.filters['flt.includeContentTypes']
        : [searchForItem[term]];
    if (isSuggestion) {
      const additionalContentType =
        term === 'searchCollections'
          ? 'signature-collection'
          : 'signature-assessment';
      includeContentTypes.push(additionalContentType);
    }
    let searchItem = {
      includeContentTypes:
        params &&
        params.isShowDiagnosticAssessent &&
        searchForItem[term] === 'assessment'
          ? ['diagnostic-assessment']
          : includeContentTypes,
      audience: params.filters['flt.audience']
    };
    const taxonomies = params.taxonomies;
    const data = {
      query: searchText || '*',
      pageNum: page + 1,
      limit: pageSize,
      filters: searchItem
    };
    if (Ember.isArray(taxonomies) && taxonomies.length > 0) {
      let lastItem = taxonomies[taxonomies.length - 1];
      data.filters.standard = lastItem;
    }
    if (params.filters['flt.relatedGutCode']) {
      data.filters.relatedGutCode = params.filters['flt.relatedGutCode'];
    }
    if (params.filters['flt.languageId']) {
      data.filters.languageId = params.filters['flt.languageId'];
    }
    if (params.filters['flt.subject']) {
      data.filters.subject = params.filters['flt.subject'];
    }
    if (params.fwCode) {
      data.filters.fwCode = params.fwCode;
    }
    if (params.excludeNonCrosswalkableContents) {
      data.excludeNonCrosswalkableContents =
        params.excludeNonCrosswalkableContents;
    }
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the offline activity that match with the term
   *
   * @param term the term to search
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Collection[]>}
   */
  searchOfflineActivity: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/scollection`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        'flt.collectionType': 'offline-activity',
        'flt.publishStatus': 'published',
        start: page + 1,
        length: pageSize
      }
    };
    const taxonomies = params.taxonomies;
    if (Ember.isArray(taxonomies) && taxonomies.length > 0) {
      options.data['flt.standard'] = taxonomies.join(',');
    }
    adapter.appendFilters(params, options);
    if (params.audienceFilter) {
      adapter.appendAudienceFilters(options);
    }
    if (params.fwCode) {
      options.data['flt.fwCode'] = params.fwCode;
    }
    if (params.excludeNonCrosswalkableContents) {
      options.data.excludeNonCrosswalkableContents =
        params.excludeNonCrosswalkableContents;
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the assessments that match with the term
   *
   * @param term the term to search
   * @param params
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Assessment[]>}
   */
  searchAssessments: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/scollection`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        'flt.collectionType': 'assessment,assessment-external',
        'flt.publishStatus': 'published',
        start: page + 1, //page starts at one
        length: pageSize
      }
    };
    if (params.isShowDiagnosticAssessent) {
      options.data['flt.contentSubtype'] = 'diagnostic-assessment';
    }
    const taxonomies = params.taxonomies;
    if (Ember.isArray(taxonomies) && taxonomies.length > 0) {
      options.data['flt.standard'] = taxonomies.join(',');
    }
    adapter.appendFilters(params, options);
    if (params.audienceFilter) {
      adapter.appendAudienceFilters(options);
    }
    if (params.fwCode) {
      options.data['flt.fwCode'] = params.fwCode;
    }
    if (params.excludeNonCrosswalkableContents) {
      options.data.excludeNonCrosswalkableContents =
        params.excludeNonCrosswalkableContents;
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the resources that match with the term
   *
   * @param term the term to search
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Resource[]>}
   */
  searchResources: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/resource`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: page + 1,
        length: pageSize,
        'flt.contentFormat': 'resource',
        'flt.publishStatus': 'published'
      }
    };
    const formats = params.formats;
    if (Ember.isArray(formats) && formats.length > 0) {
      const filters = ResourceModel.serializeAllResourceFormat(formats);
      options.data['flt.resourceFormat'] = filters.join(',');
    }
    const taxonomies = params.taxonomies;
    if (Ember.isArray(taxonomies) && taxonomies.length > 0) {
      options.data['flt.standard'] = taxonomies.join(',');
    }
    const courseId = params.courseId;
    if (courseId) {
      options.data['flt.courseId'] = courseId;
    }
    const publishStatus = params.publishStatus;
    if (publishStatus) {
      options.data['flt.publishStatus'] = publishStatus;
    }

    adapter.appendFilters(params, options);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the questions that match with the term
   *
   * @param term the term to search
   * @param {*}
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise.<Question[]>}
   */
  searchQuestions: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/resource`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: page + 1,
        length: pageSize,
        'flt.resourceFormat': 'question',
        'flt.publishStatus': 'published'
      }
    };
    const types = params.formats;
    if (Ember.isArray(types) && types.length > 0) {
      const formatFilters = QuestionModel.serializeAllQuestionType(types);
      options.data['flt.questionType'] = formatFilters.join(',');
    }
    const taxonomies = params.taxonomies;
    if (Ember.isArray(taxonomies) && taxonomies.length > 0) {
      options.data['flt.standard'] = taxonomies.join(',');
    }

    adapter.appendFilters(params, options);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches featured courses that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Course[]>}
   */
  searchFeaturedCourses: function(term, filters) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/course`;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: 1,
        length: 70,
        'flt.courseType': 'featured'
      }
    };
    if (filters) {
      options.data = Object.assign(options.data, filters);
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches courses that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Course[]>}
   */
  searchCourses: function(
    term,
    params = {},
    resetPagination = false,
    filter = {}
  ) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/course`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: page + 1,
        length: pageSize
      }
    };
    adapter.appendFilters(params, options);
    options.data = Object.assign(options.data, filter);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches courses that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Course[]>}
   */
  searchLearningMapCourses: function(params = {}, resetPagination = false) {
    const adapter = this;
    const url = this.get('namespaceV1');
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let data = {
      pageNum: page + 1,
      limit: pageSize,
      filters: {}
    };
    data.filters = {
      gutCodes: [params.competencyCode],
      includeContentTypes: [params.contentType]
    };

    if (params.filters.languageId) {
      data.filters.languageId = params.filters.languageId;
    }

    let options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches unit that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Unit[]>}
   */
  searchUnits: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/unit`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: page + 1,
        length: pageSize
      }
    };
    adapter.appendFilters(params, options);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches lesson that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Lesson[]>}
   */
  searchLessons: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/lesson`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: page + 1,
        length: pageSize
      }
    };
    adapter.appendFilters(params, options);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches rubrics that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Rubric[]>}
   */
  searchRubrics: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/rubric`;
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*',
        start: page + 1,
        length: pageSize
      }
    };
    adapter.appendFilters(params, options);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches results that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Array[]>}
   */
  autoCompleteSearch: function(type, term) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/autocomplete/${type}`;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        q: term || '*'
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Function to retrieve learning maps content
   */
  fetchLearningMapsContentCompetency(gutCode, filter, contentType, languageId) {
    const adapter = this;
    let includeContentTypes = [
      'challenging-question',
      'solved-example',
      'practice-problem',
      'signature-assessment',
      'signature-collection'
    ];
    if (this.get('session.role') === ROLES.TEACHER) {
      includeContentTypes = [
        'signature-collection',
        'course',
        'unit',
        'lesson',
        'collection',
        'assessment',
        'collection',
        'offline-activity',
        'question',
        'resource',
        'signature-assessment',
        'signature-collection'
      ];
    }
    if (contentType) {
      includeContentTypes = [contentType];
    }
    const url = this.get('namespaceV1');
    let data = {};
    data.filters = {
      gutCodes: [gutCode],
      includeContentTypes: includeContentTypes
    };
    if (languageId) {
      data.filters.languageId = languageId;
    }
    let options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Function to retrieve learning maps content
   */
  fetchLearningMapsContent(gutCode, filters = {}) {
    const adapter = this;
    const namespace = this.get('pedagogySearch');
    const url = `${namespace}/learning-maps/standard/${gutCode}`;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: filters
    };
    if (this.get('session.role') === ROLES.TEACHER) {
      const defFilter = `${TEACHER},${STUDENTS}`;
      const defaultFilter = {
        'flt.audience': defFilter
      };
      options.data = Object.assign(options.data, defaultFilter);
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches learningMapsCompetencyContent
   *
   * @param gutCode the term to search
   * @returns {Promise.<Content[]>}
   */
  fetchLearningMapsCompetencyContent(gutCode, filters) {
    const adapter = this;
    const namespace = this.get('pedagogySearch');
    const url = `${namespace}/learning-maps/competency/${gutCode}`;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: filters
    };
    if (filters.fwCode) {
      options.data.fwCode = filters.fwCode;
      options.data.isDisplayCode = false;
    }
    if (this.get('session.role') === ROLES.TEACHER) {
      const defFilter = `${TEACHER},${STUDENTS}`;
      const defaultFilter = {
        'flt.audience': defFilter
      };
      options.data = Object.assign(options.data, defaultFilter);
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches courses that match with the term
   *
   * @param term the term to search
   * @returns {Promise.<Course[]>}
   */
  searchSignatureContent: function(term, params = {}, resetPagination = false) {
    const adapter = this;
    const url = this.get('namespaceV1');
    const page = !params.page || resetPagination ? 0 : params.page;
    const pageSize = params.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    let data = {
      query: term || '*',
      pageNum: page + 1,
      limit: pageSize,
      filters: {}
    };
    data.filters = {
      audience: 'All Students',
      standard: params.competencyCode,
      includeContentTypes: params.contentType
    };
    let options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  },

  /**
   * append Default Filter
   */
  appendAudienceFilters(options) {
    const audience = options.data['flt.audience'];
    if (
      this.get('session.role') === ROLES.TEACHER &&
      Object.keys(audience).length === 0
    ) {
      const defFilter = `${TEACHER},${STUDENTS}`;
      const defaultFilter = {
        'flt.audience': defFilter
      };
      options.data = Object.assign(options.data, defaultFilter);
    }
  },

  appendFilters(params, options) {
    if (params.filters) {
      let filters = params.filters;
      let filterKeys = Object.keys(filters);
      if (filterKeys) {
        for (let index = 0; index < filterKeys.length; index++) {
          let filterKey = filterKeys[index];
          if (filters[filterKey]) {
            options.data[filterKey] = filters[filterKey];
          }
        }
      }
    }
  }
});
