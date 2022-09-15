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
   * @requires service:api-sdk/course
   */
  externalAssessmentService: Ember.inject.service(
    'api-sdk/external-assessment'
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
   * Collection model as instantiated by the route. This is the model used when not editing
   * or after any collection changes have been saved.
   * @property {Collection}
   */
  collection: null,

  isLoading: false,

  collectionType: 'assessment-external',

  aggregatedTags: Ember.computed('tempCollection.aggregatedTag.[]', function() {
    let aggregatedTags = TaxonomyTag.getTaxonomyTags(
      this.get('tempCollection.aggregatedTag'),
      false,
      false,
      true
    );
    return aggregatedTags;
  }),

  selectedType: Ember.computed('tempCollection', function() {
    let isScorm = this.get('tempCollection.subFormat') ? 2 : 1;
    return isScorm;
  }),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'assessments', 'gru-assessment-edit'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    selectCategory: function(category) {
      let component = this;
      if (category === component.get('selectedCategory')) {
        component.set('selectedCategory', null);
      } else {
        component.set('selectedCategory', category);
      }
      component.set('selectedSubject', null);
    },
    /**
     * Save Content
     */
    updateContent: function() {
      let component = this;
      let editedAssessment = component.get('tempCollection');
      let assessment = component.get('collection');
      const etlHrs = editedAssessment.get('hours');
      const etlMins = editedAssessment.get('minutes');
      etlSecCalculation(editedAssessment, etlHrs, etlMins);
      editedAssessment.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          let imageIdPromise = new Ember.RSVP.resolve(
            editedAssessment.get('thumbnailUrl')
          );
          if (
            editedAssessment.get('thumbnailUrl') &&
            editedAssessment.get('thumbnailUrl') !==
              assessment.get('thumbnailUrl')
          ) {
            imageIdPromise = component
              .get('mediaService')
              .uploadContentFile(editedAssessment.get('thumbnailUrl'));
          }
          imageIdPromise.then(function(imageId) {
            editedAssessment.set('thumbnailUrl', imageId);
            component
              .get('externalAssessmentService')
              .updateExternalAssessment(
                editedAssessment.get('id'),
                editedAssessment
              )
              .then(function() {
                assessment.merge(editedAssessment, [
                  'title',
                  'learningObjectives',
                  'isVisibleOnProfile',
                  'thumbnailUrl',
                  'standards',
                  'audience',
                  'depthOfknowledge',
                  'centurySkills',
                  'hours',
                  'minutes',
                  'url',
                  'primaryLanguage'
                ]);
                component.set('isEditing', false);
                component
                  .get('tempCollection.standards')
                  .forEach(function(suggeststanObj) {
                    suggeststanObj.set('isRemovable', false);
                  });
              })
              .catch(function(error) {
                var message = component
                  .get('i18n')
                  .t('common.errors.assessment-not-updated').string;
                component.get('notifications').error(message);
                Ember.Logger.error(error);
              });
          });
        }
        component.set('didValidate', true);
      });
    },

    /**
     * Add tag data from the taxonomy list in tempUnit
     */
    addTag: function(taxonomyTag) {
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
     * @type {String} the selected category
     */
    selectedCategory: Ember.computed('collection', function() {
      let standard = this.get('collection.standards.firstObject');
      let subjectId = standard ? getSubjectId(standard.get('id')) : null;
      return subjectId ? getCategoryCodeFromSubjectId(subjectId) : null;
    }),

    selectedSubject: Ember.computed('collection', function() {
      let standard = this.get('collection.standards.firstObject');
      if (standard) {
        standard.set(
          'subjectCode',
          getGutCodeFromSubjectId(getSubjectId(standard.get('id')))
        );
      }
      return standard ? standard : null;
    }),
    /**
     * Delete assessment
     */
    deleteItem: function() {
      const myId = this.get('session.userId');
      var model = {
        content: this.get('collection'),
        isHeaderDelete: true,
        parentName: this.get('course.title'),
        deleteMethod: function() {
          return this.get('externalAssessmentService').deleteExternalAssessment(
            this.get('collection')
          );
        }.bind(this),
        type: CONTENT_TYPES.ASSESSMENT,
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

    //Action triggered when click back in the edit page
    onClickBack() {
      let isPreview = this.get('isPreviewReferrer');
      const router = this.get('router');
      const previewRoute = 'library-search';
      const myId = this.get('session.userId');

      let queryParams = {
        profileId: myId,
        type: 'my-content',
        activeContentType: 'assessment'
      };

      if (isPreview) {
        router.transitionTo(previewRoute, {
          queryParams
        });
      } else {
        window.history.back();
      }
    },

    selectType(type) {
      this.set('selectedType', type);
    },

    selectFile: function(file) {
      let component = this;
      component.set('isErrorScormFile', false);
      if (file) {
        component.set('isLoading', true);
        component
          .get('mediaService')
          .uploadScormFile(file)
          .then(function(response) {
            let tempCollection = component.get('tempCollection');
            let collection = component.get('collection');
            if (
              response &&
              response.scorm_file_info &&
              response.scorm_file_info.resources &&
              response.scorm_file_info.resources.length
            ) {
              const url =
                component.get('session.cdnUrls.content') +
                response.filepath +
                response.scorm_file_info.resources[0].filename;

              tempCollection.set('url', url);
              collection.set('url', url);
              const scorm = {
                scorm: {
                  originalFilename:
                    response.scorm_file_info.resources[0].filename,
                  filepath: response.filepath,
                  fileName: response.original_filename
                }
              };
              tempCollection.set('metadata', scorm);
              collection.set('metadata', scorm);
              const selectedType = component.get('selectedType');
              tempCollection.set(
                'subFormat',
                selectedType === 1 ? 'url' : 'scorm'
              );
              collection.set('subFormat', selectedType === 1 ? 'url' : 'scorm');
              component.set('isErrorScormFile', false);
            } else {
              component.set('isErrorScormFile', true);
            }
            component.set('isLoading', false);
          });
      }
    }
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
  },

  init: function() {
    this._super(...arguments);
    let collection = this.get('collection').copy();
    this.set('tempCollection', collection);
  }
});
