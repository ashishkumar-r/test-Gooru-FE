import Ember from 'ember';
import CollectionEdit from 'gooru-web/components/content/collections/gru-collection-edit';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import {
  getCategoryCodeFromSubjectId,
  getSubjectId,
  getGutCodeFromSubjectId
} from 'gooru-web/utils/taxonomy';
import { etlSecCalculation } from 'gooru-web/utils/utils';

export default CollectionEdit.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),
  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {LessonService} Lesson service API SDK
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),
  /**
   * activityCollection model as instantiated by the route. This is the model used when not editing
   * or after any activityCollection changes have been saved.
   * @property {activityCollection}
   */
  activityCollection: null,

  collection: Ember.computed.alias('activityCollection'),

  subTaskDisplayValue: Ember.computed(
    'activityCollection.subFormat',
    'activityCollection.formatList',
    function() {
      let activityCollection = this.get('activityCollection');
      let displayValue =
        activityCollection && activityCollection.get('formatList')
          ? activityCollection
            .get('formatList')
            .findBy('code', activityCollection.get('subFormat'))
          : '';
      return (displayValue && displayValue.get('display_name')) || '';
    }
  ),

  aggregatedTags: Ember.computed('tempCollection.aggregatedTag.[]', function() {
    let aggregatedTags = TaxonomyTag.getTaxonomyTags(
      this.get('tempCollection.aggregatedTag'),
      false,
      false,
      true
    );
    return aggregatedTags;
  }),

  /**
   * @type {String} the selected category
   */
  selectedCategory: Ember.computed('activityCollection', function() {
    let standard = this.get('activityCollection.standards.firstObject');
    let subjectId = standard ? getSubjectId(standard.get('id')) : null;
    return subjectId ? getCategoryCodeFromSubjectId(subjectId) : null;
  }),

  selectedSubject: Ember.computed('activityCollection', function() {
    let standard = this.get('activityCollection.standards.firstObject');
    if (standard) {
      standard.set(
        'subjectCode',
        getGutCodeFromSubjectId(getSubjectId(standard.get('id')))
      );
    }
    return standard ? standard : null;
  }),

  model: null,
  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'content',
    'assessments',
    'gru-assessment-edit',
    'gru-activity-edit'
  ],

  /**
   * controls show hide the report popup
   */
  isShowOfflineActivityPreviewPopup: false,

  /**
   * Controls show/hide of the preview button
   */
  isShowOfflineActivityPreview: true,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    selectCategory(category) {
      let component = this;
      if (category === component.get('selectedCategory')) {
        component.set('selectedCategory', null);
      } else {
        component.set('selectedCategory', category);
      }
      component.set('selectedSubject', null);
    },
    /**
     * Action to show hide the report popup
     */
    showOAReportPopup() {
      this.set('isShowOfflineActivityPreviewPopup', true);
    },
    cancelEdit() {
      this._super(...arguments);
      const component = this;
      if (
        component.get('activityCollection') &&
        component.get('activityCollection').id
      ) {
        //ToDo: Call super
      } else if (component.get('course')) {
        //redirect to course edit only if it has tagged with a course
        let queryParams = {
          userId: component.get('course').get('ownerId')
        };
        component
          .get('router')
          .transitionTo('content.courses.edit', component.get('course').id, {
            queryParams
          });
      } else {
        component.set('isEditing', false);
      }
    },
    /**
     * edit action
     */
    editContent: function() {
      this.set('tempCollection', this.get('activityCollection').copy());
      this.set('isEditing', true);
    },

    /**
     * @param {string} subFormat
     */
    updateSubFormat(subFormat) {
      const component = this;
      const subFormatCode = subFormat.code;
      component.set('tempCollection.subFormat', subFormatCode);
    },

    /**
     * Saves activity
     */
    updateContent: function() {
      const component = this;
      const modelValue = component.get('model');
      component
        .get('validate')
        .call(component)
        .then(
          function({ validations }) {
            let isValid = validations.get('isValid');
            if (isValid) {
              component.set('isLoading', true);
              let tempOaCollection = this.get('tempCollection');
              const etlHrs = tempOaCollection.get('hours');
              const etlMins = tempOaCollection.get('minutes');
              etlSecCalculation(tempOaCollection, etlHrs, etlMins);

              let imageIdPromise = new Ember.RSVP.resolve(
                tempOaCollection.get('thumbnailUrl')
              );
              if (
                tempOaCollection.get('thumbnailUrl') &&
                tempOaCollection.get('thumbnailUrl') !==
                  this.get('activityCollection').get('thumbnailUrl') &&
                typeof tempOaCollection.get('thumbnailUrl') != 'string'
              ) {
                imageIdPromise = component
                  .get('mediaService')
                  .uploadContentFile(tempOaCollection.get('thumbnailUrl'));
              }
              imageIdPromise.then(function(imageId) {
                tempOaCollection.set('thumbnailUrl', imageId);
                if (component.get('isNewActivity')) {
                  component
                    .get('createActivity')
                    .call(component)
                    .then(function(newActivity) {
                      let sourceCollection = component.get(
                        'activityCollection'
                      );

                      component.refreshSourceWithChanges(
                        newActivity,
                        sourceCollection
                      );
                      newActivity.set(
                        'formatList',
                        sourceCollection.formatList
                      );

                      if (modelValue && modelValue.associateLesson) {
                        return component
                          .get('associateToLesson')
                          .call(
                            component,
                            modelValue.courseId,
                            modelValue.unitId,
                            modelValue.lessonId,
                            newActivity.get('id')
                          );
                      } else {
                        return Ember.RSVP.resolve(true);
                      }
                    })
                    .then(
                      function() {
                        component.set('isLoading', false);
                      },
                      function() {
                        component.set('isLoading', false);
                        component.get('showErrorMessage')();
                      }
                    );
                } else {
                  //ToDo: Format here break into small and make post save behavior same for new and edit
                  component
                    .get('updateActivity')
                    .call(component)
                    .then(function(newActivity) {
                      let sourceCollection = component.get(
                        'activityCollection'
                      );

                      newActivity.set(
                        'subFormat',
                        sourceCollection.get('subFormat')
                      ); // Added back the removed subFormat
                      component.refreshSourceWithChanges(
                        newActivity,
                        sourceCollection
                      );
                      return Ember.RSVP.resolve(true);
                    })
                    .then(
                      function() {
                        component.set('isLoading', false);
                      },
                      function() {
                        component.set('isLoading', false);
                        component.get('showErrorMessage')();
                      }
                    );
                }
              });
            }
            this.set('didValidate', true);
          }.bind(this)
        );
    },

    validate: function() {
      const collection = this.get('tempCollection');
      return collection.validate();
    },

    /**
     * Add tag data from the taxonomy list in tempUnit
     */
    addTag: function(taxonomyTag) {
      // let tagData = taxonomyTag;
      taxonomyTag.set('isRemovable', true);
      taxonomyTag.set('tagAlreadyexist', false);
      this.get('tempCollection.standards').addObject(taxonomyTag);
      this.set(
        'tempCollection.standards',
        this.get('tempCollection.standards').uniqBy('code')
      );
      this.get('tempCollection.aggregatedTag').removeObject(taxonomyTag);
      let newtaxonomyObj = Ember.Object.create({
        code: taxonomyTag.get('code'),
        frameworkCode: taxonomyTag.get('frameworkCode'),
        isRemovable: false,
        tagAlreadyexist: false
      });
      this.get('tempCollection.aggregatedTag').addObject(newtaxonomyObj);
      this.compareAggregatedTags();
    },
    /**
     * Remove tag data from the taxonomy list in tempUnit
     */
    removeTag: function(taxonomyTag) {
      var tagData = taxonomyTag;
      this.get('tempCollection.standards').removeObject(tagData);
      tagData.set('isRemovable', false);
      tagData.set('tagAlreadyexist', false);
      this.get('tempCollection.aggregatedTag').addObject(tagData);
      this.set(
        'tempCollection.aggregatedTag',
        this.get('tempCollection.aggregatedTag').uniqBy('code')
      );
      this.compareAggregatedTags();
    },

    /**
     * Save setting for visibility of collection in profile
     */
    publishToProfile: function() {
      var collectionForEditing = this.get('collection').copy();
      this.set('tempCollection', collectionForEditing);
      this.actions.updateContent.call(this);
    },
    /**
     * Delete activity
     */
    deleteItem: function() {
      const myId = this.get('session.userId');
      var model = {
        content: this.get('tempCollection'),
        isHeaderDelete: true,
        parentName: this.get('course.title'),
        deleteMethod: function() {
          return this.get('activityService').deleteActivity(
            this.get('tempCollection')
          );
        }.bind(this),
        type: CONTENT_TYPES.ACTIVITY,
        redirect: {
          route: 'library-search',
          params: {
            profileId: myId,
            type: 'my-content'
          }
        }
      };

      this.actions.showModal.call(
        this,
        'content.modals.gru-delete-content',
        model,
        null,
        null,
        null,
        false
      );
    },

    modelSourceFromChildChanges(editingModel) {
      const component = this;
      editingModel = editingModel || component.get('tempCollection');
      component.refreshSourceWithChanges(
        editingModel,
        component.get('activityCollection')
      );
    },

    updateQuantity(val) {
      let validNumber = new RegExp(/^\d{0,3}(\.\d{0,2})?$/);
      let value = validNumber.test(val);
      val = value ? parseFloat(val) : parseFloat(val.slice(0, 3));
      if (val >= 0) {
        this.set('tempCollection.durationHours', val);
      } else {
        this.set('tempCollection.durationHours', 0);
      }
    },

    inputTyping(val) {
      let validNumber = new RegExp(/^\d{0,3}(\.\d{0,1})?$/);
      let value = validNumber.exec(val);
      let duration = value ? value.input : null;
      if (duration >= 0) {
        this.set('tempCollection.durationHours', duration);
      } else {
        this.set('tempCollection.durationHours', 0);
      }
    }
  },

  didInsertElement() {
    const component = this;
    component._super(...arguments);
    component.$('#emberInfo1123').click();
  },
  /**
   * Copies master Objects of Source model to editingModel and set editmodel to source, such that source has the latest
   * @param {*} editingModel
   * @param {*} sourceModel
   */
  refreshSourceWithChanges(editingModel, sourceModel) {
    editingModel.set('formatList', sourceModel.formatList);
    this.set('activityCollection', editingModel);
    this.set('isEditing', false);
    this.set('isNewActivity', false);
  },

  validate: function() {
    const collection = this.get('tempCollection');
    return collection.validate();
  },

  createActivity: function() {
    let tempOaCollection = this.get('tempCollection');
    return this.get('activityService').createActivity(tempOaCollection);
  },

  updateActivity: function() {
    let tempOaCollection = this.get('tempCollection').copy();
    delete tempOaCollection.subFormat;
    return this.get('activityService').updateActivity(
      tempOaCollection.get('id'),
      tempOaCollection
    );
  },

  associateToLesson: function(
    courseId,
    unitId,
    lessonId,
    assessmentOrCollectionId
  ) {
    return this.get('lessonService').associateAssessmentOrCollectionToLesson(
      courseId,
      unitId,
      lessonId,
      assessmentOrCollectionId,
      false
    );
  },
  /**
   * Returns compareAggregatedTags data
   * @param {Number[]} compareAggregatedTags ids
   * @return {compareAggregatedTags[]}
   */
  compareAggregatedTags: function() {
    const component = this;
    component
      .get('tempCollection.aggregatedTag')
      .forEach(function(suggeststanObj) {
        Ember.set(suggeststanObj, 'tagAlreadyexist', true);
      });
    component.get('tempCollection.standards').forEach(function(standardObj) {
      var suggestObj = component
        .get('tempCollection.aggregatedTag')
        .findBy('code', standardObj.code);
      if (suggestObj !== undefined) {
        Ember.set(suggestObj, 'tagAlreadyexist', false);
      }
    });
  }
});
