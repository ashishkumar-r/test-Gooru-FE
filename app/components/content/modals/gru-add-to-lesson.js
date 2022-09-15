import Ember from 'ember';
import AddToModal from 'gooru-web/components/content/modals/gru-add-to';
import CollectionSearch from 'gooru-web/models/search/content-search';
import { DEFAULT_PAGE_SIZE, TEACHER, STUDENTS } from 'gooru-web/config/config';

export default AddToModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @type {CollectionService} Service to make copy of the collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @type {AssessmentService} Service to make copy of the assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @type {OfflineActivityService} Service to make copy of the offline activity
   */
  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),
  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-add-to-lesson'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Show more collection/Assessments results
     */
    showMoreResults: function() {
      this.showMoreResults();
    },
    updateContent: function(keyword) {
      this.findResults(keyword);
    },
    clearContent: function() {
      this.findResults('');
    }
  },
  copyContent: function() {
    let collectionOrAssesmentService = this.get('selectedCollection.id');
    if (this.get('selectedCollection.format') === 'collection') {
      collectionOrAssesmentService = this.get(
        'collectionService'
      ).copyCollection(this.get('selectedCollection.id'));
    } else if (this.get('selectedCollection.format') === 'assessment') {
      collectionOrAssesmentService = this.get(
        'assessmentService'
      ).copyAssessment(this.get('selectedCollection.id'));
    } else if (this.get('selectedCollection.format') === 'offline-activity') {
      collectionOrAssesmentService = this.get(
        'offlineActivityService'
      ).copyActivity(this.get('selectedCollection.id'));
    }
    return Ember.RSVP.hash({
      collectionId: collectionOrAssesmentService
    }).then(({ collectionId }) => {
      this.set('copyCollectionId', collectionId);
    });
  },
  init() {
    this._super(...arguments);
    this.set(
      'searchObject',
      CollectionSearch.create(Ember.getOwner(this).ownerInjection(), {
        term: ''
      })
    );
  },
  addContent: function() {
    var collectionId = this.get('copyCollectionId');
    var courseId = this.get('model.courseId');
    var unitId = this.get('model.unitId');
    var lessonId = this.get('content.id');
    var isCollection = this.get('isCollection');
    return this.get('lessonService').associateAssessmentOrCollectionToLesson(
      courseId,
      unitId,
      lessonId,
      collectionId,
      isCollection
    );
  },

  successMessage: function() {
    this.triggerAction({ action: 'closeModal' });
    this.get('notifications').setOptions({
      positionClass: 'toast-top-full-width',
      toastClass: 'gooru-toast',
      timeOut: 10000
    });
    var editRoute = this.get('isCollection')
      ? 'content.collections.edit'
      : 'content.assessments.edit';
    if (this.get('isOA')) {
      editRoute = 'content.activity.edit';
    }
    var contentEditUrl = this.get('router').generate(
      editRoute,
      this.get('selectedCollection.id')
    );
    var successMsg = this.get('i18n').t('common.add-to-lesson-success', {
      collectionTitle: this.get('selectedCollection.title'),
      collectionType: this.get('i18n').t(
        `common.${this.get('collectionType').toLowerCase()}`
      ),
      lessonTitle: this.get('content.title')
    });
    var edit = this.get('i18n').t('common.edit');
    this.get('notifications').success(
      `${successMsg} <a class="btn btn-success" href="${contentEditUrl}">${edit}</a>`
    );
    this.$('.modal-footer button.add-to').prop('disabled', false);
    if (this.get('onAdd')) {
      this.get('onAdd')(this.get('selectedCollection'));
    }
    const model = this.get('model');
    model.callback.success();
  },

  errorMessage: function(error) {
    var message = this.get('isCollection')
      ? 'common.errors.collection-not-added-to'
      : 'common.errors.assessment-not-added-to';

    if (this.get('isOA')) {
      message = 'common.errors.collection-not-added-to'; //ToDo: Add to translations
    }
    var collectionType = this.get('i18n').t(
      `common.${this.get('collectionType').toLowerCase()}`
    );
    this.get('notifications').error(
      this.get('i18n').t(message, { collectionType }).string
    );
    Ember.Logger.error(error);
    this.$('.modal-footer button.add-to').prop('disabled', false);
  },

  showMoreResults: function() {
    const component = this;
    if (component.get('isOA')) {
      const pagination = component.get('pagination');
      pagination.page = pagination.page + 1;

      component
        .get('profileService')
        .readOfflineActivities(component.get('session.userId'), pagination)
        .then(function(collections) {
          component.get('collections').pushObjects(collections.toArray());
        });
    } else if (component.get('isCollection')) {
      const pagination = component.get('pagination');
      pagination.page = pagination.page + 1;

      component
        .get('profileService')
        .readCollections(component.get('session.userId'), pagination)
        .then(function(collections) {
          component.get('collections').pushObjects(collections.toArray());
        });
    } else {
      const pagination = this.get('pagination');
      pagination.page = pagination.page + 1;

      component
        .get('profileService')
        .readAssessments(component.get('session.userId'), pagination)
        .then(function(assessments) {
          component.get('collections').pushObjects(assessments.toArray());
        });
    }
  },

  findResults: function(keyword) {
    const component = this;
    const pagination = component.get('pagination');
    pagination.page = 0;
    if (keyword) {
      Ember.RSVP.hash({
        searchResults: component.getSearchService(keyword)
      }).then(({ searchResults }) => {
        if (!component.isDestroyed) {
          component.set('collections', searchResults);
        }
      });
    } else {
      if (component.get('isOA')) {
        const pagination = component.get('pagination');
        pagination.page = pagination.page + 1;
        component
          .get('profileService')
          .readOfflineActivities(component.get('session.userId'), pagination)
          .then(function(collections) {
            component.get('collections').pushObjects(collections.toArray());
          });
      } else if (component.get('isCollection')) {
        component
          .get('profileService')
          .readCollections(component.get('session.userId'), pagination)
          .then(function(collections) {
            component.set('collections', collections.toArray());
          });
      } else {
        component
          .get('profileService')
          .readAssessments(component.get('session.userId'), pagination)
          .then(function(assessments) {
            component.set('collections', assessments.toArray());
          });
      }
    }
  },

  /**
   * Method is used to get search service
   */
  getSearchService(keyword) {
    let component = this;
    let params = component.getSearchParams();
    let term = keyword ? keyword : '*';
    if (component.get('isCollection')) {
      return component.get('searchService').searchCollections(term, params);
    } else if (component.get('isOA')) {
      return component.get('searchService').searchOfflineActivity(term, params);
    } else {
      return component.get('searchService').searchAssessments(term, params);
    }
  },

  /**
   * Method is used to get search params
   */
  getSearchParams() {
    let component = this;
    let params = {
      page: component.get('page'),
      pageSize: component.get('defaultPageSize')
    };
    let filters = {};
    filters.scopeKey = 'my-content';
    filters['flt.publishStatus'] = 'published,unpublished';
    filters['flt.audience'] = `${TEACHER},${STUDENTS}`;
    params.filters = filters;
    return params;
  },

  // -------------------------------------------------------------------------
  // Properties
  searchObject: '',
  /**
   * @type {Boolean} if it is showing collections
   */
  isCollection: Ember.computed.alias('model.isCollection'),

  isOA: Ember.computed.alias('model.isOA'),

  /**
   * @type {Function} callback when the add is finished
   */
  onAdd: Ember.computed.alias('model.onAdd'),

  /**
   * @property {boolean} showMoreResultsButton
   */
  showMoreResultsButton: Ember.computed('collections.[]', function() {
    return (
      this.get('collections.length') &&
      this.get('collections.length') % this.get('pagination.pageSize') === 0
    );
  }),

  /**
   * @property {UID} copyCollectionId
   */
  copyCollectionId: null,

  /**
   * @property {Boolean} isCollectionOrAssesment
   */
  isCollectionOrAssesment: Ember.computed('selectedCollection', function() {
    let format = this.get('selectedCollection.format');
    return format;
  }),

  /**
   * @property {*}
   */
  pagination: {
    page: 1,
    filterBy: 'notInCourse',
    pageSize: DEFAULT_PAGE_SIZE
  },

  filteredCollections: Ember.computed('collections.[]', function() {
    let collections = this.get('collections');
    return collections;
  }),

  /**
   * Maintains the value of default search page size.
   * @type {Number}
   */
  defaultPageSize: 20,

  /**
   * Maintains the current page number of search
   * @type {Number}
   */
  page: 0
});
