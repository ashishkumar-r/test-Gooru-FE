import Ember from 'ember';
import ContentEditMixin from 'gooru-web/mixins/content/edit';
import ModalMixin from 'gooru-web/mixins/modal';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import Collection from 'gooru-web/models/content/external-collection';
import { CONTENT_TYPES, EDUCATION_CATEGORY } from 'gooru-web/config/config';
import {
  getCategoryCodeFromSubjectId,
  getSubjectId,
  getGutCodeFromSubjectId
} from 'gooru-web/utils/taxonomy';
import { etlSecCalculation } from 'gooru-web/utils/utils';
export default Ember.Component.extend(ContentEditMixin, ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @requires service:api-sdk/course
   */
  externalCollectionService: Ember.inject.service(
    'api-sdk/external-collection'
  ),

  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'collections', 'gru-collection-edit'],

  tagName: 'article',

  isLoading: false,

  collectionType: 'collection-external',

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Edit Content
     */
    editContent: function() {
      let component = this;
      var collectionForEditing = this.get('collection').copy();
      collectionForEditing.standards.forEach(function(standardObj) {
        Ember.set(standardObj, 'isRemovable', true);
      });
      this.set('tempCollection', collectionForEditing);
      this.set('isEditing', true);
      let aggregatedStandards = [];
      let unitStandards = this.get('tempCollection.children');
      let selectedStandards = this.get('collection.standards');
      let selectedStandardCodes = [];
      selectedStandards.forEach(function(standardObj) {
        selectedStandardCodes.push(standardObj.code);
      });
      unitStandards.forEach(function(unitstandardObj) {
        let unitStandardTag = unitstandardObj.standards;
        unitStandardTag.forEach(function(onestandardObj) {
          Ember.set(onestandardObj, 'tagAlreadyexist', true);
          Ember.set(onestandardObj, 'isRemovable', false);
          aggregatedStandards.push(onestandardObj);
          if (selectedStandardCodes.length !== 0) {
            selectedStandardCodes.forEach(function(newstandardObj) {
              if (newstandardObj === onestandardObj.code) {
                Ember.set(onestandardObj, 'tagAlreadyexist', false);
                Ember.set(onestandardObj, 'isRemovable', false);
                aggregatedStandards.push(onestandardObj);
              }
            });
          }
        });
      });
      component
        .get('tempCollection.standards')
        .forEach(function(suggeststanObj) {
          component
            .get('tempCollection.standards')
            .removeObject(suggeststanObj);
          let newtaxonomyObj = Ember.Object.create({
            code: suggeststanObj.get('code'),
            frameworkCode: suggeststanObj.get('frameworkCode'),
            id: suggeststanObj.get('id'),
            isRemovable: true,
            tagAlreadyexist: false
          });
          component.get('tempCollection.standards').addObject(newtaxonomyObj);
        });
      let result = aggregatedStandards.reduceRight(function(r, a) {
        r.some(function(b) {
          return a.code === b.code;
        }) || r.push(a);
        return r;
      }, []);
      this.set('tempCollection.aggregatedTag', result);
    },

    /**
     * Save Content
     */
    updateContent: function() {
      let component = this;
      let editedCollection = component.get('tempCollection');
      let collection = component.get('collection');
      const etlHrs = editedCollection.get('hours');
      const etlMins = editedCollection.get('minutes');
      etlSecCalculation(editedCollection, etlHrs, etlMins);
      editedCollection.validate().then(
        function({ validations }) {
          if (validations.get('isValid')) {
            let imageIdPromise = new Ember.RSVP.resolve(
              editedCollection.get('thumbnailUrl')
            );
            if (
              editedCollection.get('thumbnailUrl') &&
              editedCollection.get('thumbnailUrl') !==
                collection.get('thumbnailUrl')
            ) {
              imageIdPromise = component
                .get('mediaService')
                .uploadContentFile(editedCollection.get('thumbnailUrl'));
            }
            imageIdPromise.then(function(imageId) {
              editedCollection.set('thumbnailUrl', imageId);
              component
                .get('externalCollectionService')
                .updateExternalCollection(
                  editedCollection.get('id'),
                  editedCollection
                )
                .then(function() {
                  collection.merge(editedCollection, [
                    'title',
                    'learningObjectives',
                    'isVisibleOnProfile',
                    'thumbnailUrl',
                    'standards',
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
                    .t('common.errors.collection-not-updated').string;
                  component.get('notifications').error(message);
                  Ember.Logger.error(error);
                });
            });
          }
          this.set('didValidate', true);
        }.bind(this)
      );
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
     * Delete collection
     */
    deleteItem: function() {
      const myId = this.get('session.userId');
      var model = {
        content: this.get('collection'),
        isHeaderDelete: true,
        parentName: this.get('course.title'),
        deleteMethod: function() {
          return this.get('externalCollectionService').deleteExternalCollection(
            this.get('collection.id')
          );
        }.bind(this),
        type: CONTENT_TYPES.COLLECTION,
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

    selectSubject: function(subject) {
      this.set('selectedSubject', subject);
    },

    selectCategory: function(category) {
      let component = this;
      var standardLabel = category === EDUCATION_CATEGORY.value;
      component.set('standardLabel', !standardLabel);
      if (category === component.get('selectedCategory')) {
        component.set('selectedCategory', null);
      } else {
        component.set('selectedCategory', category);
      }
      component.set('selectedSubject', null);
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
     * Remove century skill id
     */
    removeSkill: function(skillItemId) {
      this.get('tempCollection.centurySkills').removeObject(skillItemId);
    },

    openTaxonomyModal: function() {
      this.openTaxonomyModal();
    },

    openSkillsModal: function() {
      this.openSkillsModal();
    },

    //Action triggered when click back
    onClickBack() {
      let isPreview = this.get('isPreviewReferrer');
      const router = this.get('router');
      const previewRoute = 'library-search';
      const myId = this.get('session.userId');

      let queryParams = {
        profileId: myId,
        type: 'my-content',
        activeContentType: 'collection'
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
  // -------------------------------------------------------------------------
  // Properties

  init: function() {
    this._super(...arguments);
    var collection = this.get('tempCollection');
    if (!collection) {
      collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
        title: null,
        audience: []
      });
    } else {
      if (collection && !collection.audience) {
        this.set('tempCollection', 'audience', Ember.A([]));
        this.set('tempCollection', 'centurySkills', Ember.A([]));
      }
    }
    this.set('tempCollection', collection);
  },

  /**
   * Collection model as instantiated by the route. This is the model used when not editing
   * or after any collection changes have been saved.
   * @property {Collection}
   */
  collection: null,

  /**
   * Course model as instantiated by the route. This is the course that have the assigned collection
   * @property {Course}
   */
  course: null,

  /**
   * Copy of the collection model used for editing.
   * @property {Collection}
   */
  tempCollection: null,

  /**
   * i18n key for the standard/competency dropdown label
   * @property {string}
   */
  standardLabelKey: Ember.computed('standardLabel', function() {
    return this.get('standardLabel')
      ? 'common.standards'
      : 'common.competencies';
  }),

  /**
   * @property {boolean}
   */
  standardLabel: true,

  /**
   * @property {boolean}
   */
  standardDisabled: Ember.computed.not('selectedSubject'),

  /**
   * Indicate if the button "Back to course" is available.
   */
  allowBack: Ember.computed('collection', function() {
    return this.get('collection.courseId');
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collection.standards.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('collection.standards'), false);
  }),

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

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  editableTags: Ember.computed('tempCollection.standards.[]', function() {
    return TaxonomyTag.getTaxonomyTags(
      this.get('tempCollection.standards'),
      false,
      true
    );
  }),

  /**
   * @property {CenturySkill[]} List of selected century skills
   */
  tempSelectedSkills: Ember.computed(
    'tempCollection.centurySkills.[]',
    'centurySkills.[]',
    function() {
      let selectedCenturySkillsIds = this.get('tempCollection.centurySkills');

      return this.selectedCenturySkillsData(selectedCenturySkillsIds);
    }
  ),

  /**
   * @property {CenturySkill[]} List of selected century skills
   */
  selectedSkills: Ember.computed(
    'collection.centurySkills.[]',
    'centurySkills.[]',
    function() {
      let selectedCenturySkillsIds = this.get('collection.centurySkills');

      return this.selectedCenturySkillsData(selectedCenturySkillsIds);
    }
  ),

  /**
   * List of Century Skills
   * @prop {CenturySkill[]}
   */
  centurySkills: Ember.A([]),

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

  // ----------------------------
  // Methods
  openTaxonomyModal: function() {
    var component = this;
    var standards = component.get('tempCollection.standards') || [];
    var subject = component.get('selectedSubject');
    var subjectStandards = TaxonomyTagData.filterBySubject(subject, standards);
    var notInSubjectStandards = TaxonomyTagData.filterByNotInSubject(
      subject,
      standards
    );
    var model = {
      selected: subjectStandards,
      shortcuts: null, // TODO: TBD
      subject: subject,
      standardLabel: component.get('standardLabel'),
      callback: {
        success: function(selectedTags) {
          var dataTags = selectedTags.map(function(taxonomyTag) {
            return taxonomyTag.get('data');
          });
          const standards = Ember.A(dataTags);
          standards.pushObjects(notInSubjectStandards.toArray());
          component.get('tempCollection.standards').pushObjects(standards);
          component.set(
            'tempCollection.standards',
            component.get('tempCollection.standards').uniqBy('code')
          );
          component
            .get('tempCollection.standards')
            .forEach(function(suggeststanObj) {
              suggeststanObj.set('isRemovable', true);
            });
        }
      }
    };

    this.actions.showModal.call(
      this,
      'taxonomy.modals.gru-standard-picker',
      model,
      null,
      'gru-standard-picker'
    );
  },

  openSkillsModal: function() {
    var component = this;
    var model = {
      selectedCenturySkills: component.get('tempCollection.centurySkills'),
      centurySkills: component.get('centurySkills'),
      callback: {
        success: function(selectedCenturySkills) {
          component.set(
            'tempCollection.centurySkills',
            Ember.A(selectedCenturySkills)
          );
        }
      }
    };
    this.actions.showModal.call(
      this,
      'century-skills.modals.gru-century-skills',
      model,
      null,
      'gru-century-skills'
    );
  },

  /**
   * Returns selectedCenturySkills data
   * @param {Number[]} compareAggregatedTags ids
   * @return {centurySkill[]}
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

  /**
   * Returns selectedCenturySkills data
   * @param {Number[]} selectedCenturySkills ids
   * @return {centurySkill[]}
   */
  selectedCenturySkillsData: function(selectedCenturySkillsIds) {
    var selectedCenturySkillsData = Ember.A([]);
    let centurySkills = this.get('centurySkills');

    if (selectedCenturySkillsIds && centurySkills) {
      for (var i = 0; i < selectedCenturySkillsIds.length; i++) {
        var skillItem = selectedCenturySkillsIds[i];

        centurySkills.filter(function(centurySkill) {
          if (centurySkill.get('id') === skillItem) {
            selectedCenturySkillsData.pushObject(centurySkill);
          }
        });
      }
    }
    return selectedCenturySkillsData;
  }
});
