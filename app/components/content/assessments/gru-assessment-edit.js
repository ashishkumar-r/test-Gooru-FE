import Ember from 'ember';
import CollectionEdit from 'gooru-web/components/content/collections/gru-collection-edit';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import {
  getCategoryCodeFromSubjectId,
  getSubjectId,
  getGutCodeFromSubjectId
} from 'gooru-web/utils/taxonomy';
import { etlSecCalculation } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default CollectionEdit.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/course
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  fluencyService: Ember.inject.service('api-sdk/fluency'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * Collection model as instantiated by the route. This is the model used when not editing
   * or after any collection changes have been saved.
   * @property {Collection}
   */
  collection: null,

  editingSubContent: null,

  isShowFluency: false,

  isShowCompetencyNotTagged: false,

  aggregatedTags: Ember.computed('tempCollection.aggregatedTag.[]', function() {
    let aggregatedTags = TaxonomyTag.getTaxonomyTags(
      this.get('tempCollection.aggregatedTag'),
      false,
      false,
      true
    );
    return aggregatedTags;
  }),

  isCheckFluency: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }),

  isShowDiagnosticBtn: Ember.computed('tempCollection.children', function() {
    return !this.get('tempCollection.children').length;
  }),
  /**
   * Toggle Options
   * @property {Ember.Array}
   */
  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.yes',
      value: true
    }),
    Ember.Object.create({
      label: 'common.no',
      value: false
    })
  ]),

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
      component.set('tempCollection.metadata.fluency', null);
      component.set('isShowFluency', false);
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
              .get('assessmentService')
              .updateAssessment(editedAssessment.get('id'), editedAssessment)
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
                  'primaryLanguage',
                  'metadata'
                ]);
                component.set('isEditing', false);
                component
                  .get('tempCollection.standards')
                  .forEach(function(suggeststanObj) {
                    suggeststanObj.set('isRemovable', false);
                  });
                if (component.get('tempCollection.metadata.fluency')) {
                  const fluData = Ember.Object.create({});
                  fluData.fluency = assessment.metadata.fluency;
                  component
                    .get('fluencyService')
                    .updateFluencyLevel(fluData, 'assessments', assessment.id);
                }
                component
                  .get('parseEventService')
                  .postParseEvent(PARSE_EVENTS.SAVE_ASSESSMENT);
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

    selectSubject: function(subject) {
      this.set('selectedSubject', subject);
      this.set('isShowFluency', true);
      const subCode = getGutCodeFromSubjectId(subject.get('id'));
      const fluData = {
        subject_code: subCode,
        fw_id: subject.frameworkId,
        tenant_id: this.get('session.tenantId')
      };
      this.getFluenciesData(fluData);
    },

    selectedFluency: function(fluencyData) {
      this.set('tempCollection.metadata.fluency', fluencyData);
    },
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
          return this.get('assessmentService').deleteAssessment(
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
        router.transitionTo(previewRoute, { queryParams });
      } else {
        window.history.back();
      }
    },

    /**
     * Cancel edit content
     */
    cancelEdit: function() {
      var assessmentForCancelEditing = this.get('collection').copy();
      this.set('isEditing', false);
      this.set('tempCollection', assessmentForCancelEditing);
    },

    onDiagnosticChange: function(checked) {
      const component = this;
      const content = {
        is_diagnostic_assessment: checked
      };
      this.get('assessmentService')
        .diagnosticAssessment(content, this.get('collection.id'))
        .then(
          function(response) {
            response.get('content_subtype')
              ? component.set('tempCollection.metadata.content_subtype', [
                Number(response.get('content_subtype'))
              ])
              : component.set('tempCollection.metadata.content_subtype', []);
            component.set('isShowCompetencyNotTagged', false);
          },
          function() {
            component.set('isShowCompetencyNotTagged', true);
            component.set('collection.enableDiagnostic', false);
          }
        );
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

  getFluenciesData(fluData) {
    this.get('fluencyService')
      .getFluencyLevel(fluData)
      .then(res => {
        this.set('fluencyData', res);
      });
  },
  init: function() {
    this._super(...arguments);
    let collection = this.get('collection').copy();
    // let audience = collection.audience || Ember.A([]);
    // this.set(collection, 'audience', audience);
    this.set('tempCollection', collection);
    if (this.get('selectedSubject')) {
      const fluData = {
        subject_code: this.get('selectedSubject').subjectCode,
        fw_id: this.get('selectedSubject').frameworkCode,
        tenant_id: this.get('session.tenantId')
      };
      this.getFluenciesData(fluData);
      this.set('isShowFluency', true);
    }
  }
});
