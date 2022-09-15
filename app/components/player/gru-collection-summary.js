import Ember from 'ember';
import TaxonomyTag from 'quizzes-addon/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'quizzes-addon/models/taxonomy/taxonomy-tag-data';
import { PARSE_EVENTS } from 'quizzes-addon/config/parse-event';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-collection-summary'],

  // -------------------------------------------------------------------------
  // Service

  /**
   * @type {CollectionService} collectionService
   * @property {Ember.Service} Service to retrieve a collection|assessment
   */
  collectionService: Ember.inject.service('quizzes/collection'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('quizzes/api-sdk/parse-event'),

  collectionObserver: Ember.observer(
    'context',
    'attemptData',
    'resourceResults',
    function() {
      const component = this;
      component.fetchConfirmationInfo();
    }
  ),

  resourceObserver: Ember.observer(
    'collectionInfo',
    'resource',
    'resourceResults',
    function() {
      const component = this;
      let collectionInfo = component.get('collectionInfo');
      if (
        component.get('resourceResults') &&
        component.get('resource') &&
        collectionInfo
      ) {
        component.setStudyResourcesTimespent(collectionInfo);
      }
    }
  ),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.fetchConfirmationInfo();
    $(
      '.left-panel-container .header-panel .collection-desc .description'
    ).slideDown();
    let isShowDefault = component.get('isShowDescription');
    if (isShowDefault === false) {
      this.send('toggleDesction');
    }
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    toggleDesction() {
      $(
        '.left-panel-container .header-panel .collection-desc .description'
      ).slideToggle();
      this.toggleProperty('isDisplayDescription');
    },

    /**
     *
     * Triggered when an item is selected
     * @param item
     */
    selectItem: function(item) {
      this.selectItem(item.resource);
    },

    toggleLeftPanel() {
      this.set('isOpenLeftPanal', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  isDisplayDescription: false,

  /**
   * Property used to  identify whether collection object has items to play.
   */
  hasCollectionItems: Ember.computed('collectionInfo', function() {
    let resourceCount = this.get('collectionInfo.resourceCount');
    let questionCount = this.get('collectionInfo.questionCount');
    let hasCollectionItems = false;
    let isCollection = this.get('isCollection');
    if (isCollection && (resourceCount > 0 || questionCount > 0)) {
      hasCollectionItems = true;
    } else if (questionCount > 0) {
      hasCollectionItems = true;
    }
    return hasCollectionItems;
  }),

  /**
   * @property {string|function} onItemSelected - event handler for when an item is selected
   */
  onItemSelected: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collectionInfo', function() {
    let standards = this.get('collectionInfo.taxonomy');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  classFramework: Ember.computed('class', function() {
    return this.get('class') ? this.get('class.preference.framework') : null;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchConfirmationInfo
   * Method to fetch confirmation info data
   */
  fetchConfirmationInfo() {
    let component = this;
    let collection = component.get('collection');
    let isCollectionConfirmation = component.get('isCollection');
    component.set('isLoading', true);
    if (isCollectionConfirmation) {
      component.getCollection(collection.id).then(function(collectionInfo) {
        let tempContent = collectionInfo.content;
        tempContent.map(contentList => {
          if (
            contentList.content_subformat === 'fill_in_the_blank_question' ||
            contentList.content_subformat ===
              'scientific_fill_in_the_blank_question'
          ) {
            contentList.description = FillInTheBlank.toFibText(
              contentList.description
            );
          }
        });
        component.sendAction('actionContent', tempContent);
        if (!component.get('isDestroyed')) {
          let contentCount = component.getResourceQuestionCount(
            collection.resources
          );
          collection.resources.forEach(r => {
            let taxonomy = collectionInfo.content.findBy('id', r.id);
            if (taxonomy) {
              r.standards = component.tempSerializeResourceTaxonomy(
                taxonomy.taxonomy
              );
            }
          });
          collectionInfo.questionCount = contentCount.questionCount;
          collectionInfo.resourceCount = contentCount.resourceCount;
          if (component.get('attemptData')) {
            component.mergeCollectionWithAttemptData(collectionInfo);
          } else {
            component.set('collectionInfo', collectionInfo);
          }
          component.set('isLoading', false);
        }
      });
    } else {
      component.getAssessment(collection.id).then(function(assessmentInfo) {
        let tempContent = assessmentInfo.content;
        tempContent.map(contentList => {
          if (
            contentList.content_subformat === 'fill_in_the_blank_question' ||
            contentList.content_subformat ===
              'scientific_fill_in_the_blank_question'
          ) {
            contentList.description = FillInTheBlank.toFibText(
              contentList.description
            );
          }
        });
        component.sendAction('actionContent', tempContent);
        if (!component.get('isDestroyed')) {
          if (component.get('attemptData')) {
            component.mergeCollectionWithAttemptData(assessmentInfo);
          } else {
            component.set('collectionInfo', assessmentInfo);
          }
          component.set('isLoading', false);
        }
      });
    }
  },

  tempSerializeResourceTaxonomy(taxonomy) {
    if (taxonomy) {
      return Array.from(Object.keys(taxonomy), function(k) {
        var taxonomyObject = taxonomy[k];
        taxonomyObject.id = k;
        taxonomyObject.title = taxonomyObject.code;
        taxonomyObject.caption = taxonomyObject.code;
        taxonomyObject.data = taxonomyObject;
        return Ember.Object.create(taxonomyObject);
      });
    }
  },

  /**
   * @function getCollection
   * Get a collection by Id
   */
  getCollection(collectionId) {
    const component = this;
    let classFramework = component.get('classFramework');
    let isDefaultShowFW = component.get('isDefaultShowFW');
    const collectionPromise = Ember.RSVP.resolve(
      component
        .get('collectionService')
        .getCollection(collectionId, classFramework, isDefaultShowFW)
    );
    return Ember.RSVP.hash({
      collection: collectionPromise
    }).then(function(hash) {
      return hash.collection;
    });
  },

  /**
   * @function getAssessment
   * Get an assessment by Id
   */
  getAssessment(assessmentId) {
    const component = this;
    let classFramework = component.get('classFramework');
    let isDefaultShowFW = component.get('isDefaultShowFW');
    const assessmentPromise = Ember.RSVP.resolve(
      component
        .get('collectionService')
        .getAssessment(assessmentId, classFramework, isDefaultShowFW)
    );
    return Ember.RSVP.hash({
      assessment: assessmentPromise
    }).then(function(hash) {
      return hash.assessment;
    });
  },

  /**
   * @function getResourceQuestionCount
   * Method to get resource and question count from the collection
   */
  getResourceQuestionCount(resources) {
    let questionCount = 0;
    let resourceCount = 0;
    if (Ember.isArray(resources)) {
      resources.map(resource => {
        if (resource.isResource) {
          resourceCount++;
        } else {
          questionCount++;
        }
      });
    }
    return {
      questionCount,
      resourceCount
    };
  },

  mergeCollectionWithAttemptData(collection) {
    const component = this;
    let attemptData = component.get('attemptData');
    if (Object.keys(attemptData).length) {
      let attemptResources = attemptData.get('resourceResults');
      collection.set('totalTimeSpent', attemptData.get('totalTimeSpent'));
      let contents = collection.get('content');
      contents.map(content => {
        let attemptResource = attemptResources.findBy('resourceId', content.id);
        content.timespent = attemptResource
          ? attemptResource.get('savedTime')
          : 0;
      });
    }
    component.set('collectionInfo', collection);
  },

  setStudyResourcesTimespent(collection) {
    const component = this;
    let collectionData = component.get('collection');
    let resourceResults = component.get('resourceResults');
    let contents = collection.get('content');
    contents.map(content => {
      let resourceResult = resourceResults.findBy('resourceId', content.id);
      if (resourceResult) {
        let resourceId = resourceResult.get('resourceId');
        Ember.set(content, 'started', resourceResult.get('started'));
        Ember.set(content, 'isCorrect', resourceResult.get('isCorrect'));
        Ember.set(
          content,
          'isPartialCorrect',
          resourceResult.get('isPartialCorrect')
        );
        Ember.set(content, 'isResource', resourceResult.get('isResource'));
        Ember.set(
          content,
          'resource',
          collectionData.getResourceById(resourceId)
        );
        Ember.set(
          content,
          'selected',
          resourceId === component.get('selectedResourceId')
        );
        if (
          resourceResult.get('savedTime') &&
          !resourceResult.get('startTime')
        ) {
          Ember.set(content, 'timespent', resourceResult.get('savedTime'));
        } else {
          const startTime = resourceResult.get('startTime') || 0;
          const stopTime = resourceResult.get('stopTime') || startTime;
          let timeSpent = component.roundMilliseconds(stopTime - startTime);
          Ember.set(content, 'timespent', timeSpent);
        }
      }
    });
  },

  /**
   * Round milliseconds
   */
  roundMilliseconds: function(milliseconds) {
    return milliseconds - (milliseconds % 1000);
  },

  /**
   * Triggered when a resource item is selected
   * @param {Resource} resource
   */
  selectItem: function(resource) {
    if (resource && !this.get('isNavigationDisabled')) {
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', resource);
        const unit = this.get('unit');
        const lesson = this.get('lesson');
        const course = this.get('course');
        const context = {
          unitId: unit ? unit.id : null,
          lessonId: lesson ? lesson.id : null,
          courseId: course ? course.id : null,
          classId: this.get('classId') ? this.get('classId') : null,
          resourceId: resource.id,
          ownerId: resource.ownerId,
          title: resource.title,
          type: resource.type
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.SELECT_LIST_RESOURCE,
          context
        );
      }
    }
  }
});
