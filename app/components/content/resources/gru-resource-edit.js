import Ember from 'ember';
import ContentEditMixin from 'gooru-web/mixins/content/edit';
import ProtocolMixin from 'gooru-web/mixins/content/protocol';
import {
  RESOURCE_COMPONENT_MAP,
  RESOURCE_TYPES,
  CONTENT_TYPES,
  EDUCATION_CATEGORY,
  UPLOADABLE_TYPES,
  VIDEO_RESOURCE_TYPE
} from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import ModalMixin from 'gooru-web/mixins/modal';
import {
  isVideoURL,
  etlSecCalculation,
  validateHhMmSs,
  isYouTubeURL
} from 'gooru-web/utils/utils';
import {
  getCategoryCodeFromSubjectId,
  getSubjectId,
  getGutCodeFromSubjectId
} from 'gooru-web/utils/taxonomy';
import VideoTimeLine from 'gooru-web/models/video-timeline';
export default Ember.Component.extend(
  ContentEditMixin,
  ModalMixin,
  ProtocolMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    session: Ember.inject.service('session'),

    /**
     * @requires service:notifications
     */
    notifications: Ember.inject.service(),

    /**
     * @property {MediaService} Media service API SDK
     */
    mediaService: Ember.inject.service('api-sdk/media'),

    /**
     * @requires service:api-sdk/resource
     */
    resourceService: Ember.inject.service('api-sdk/resource'),

    /**
     * @requires service:api-sdk/question
     */
    questionService: Ember.inject.service('api-sdk/question'),

    /**
     * @requires service:api-sdk/profile
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @property {Service} I18N service
     */
    i18n: Ember.inject.service(),

    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['content', 'resources', 'gru-resource-edit'],

    tagName: 'article',

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Edit Content
       */
      editContent: function() {
        var resourceForEditing = this.get('resource').copy();
        var tempResource = this.get('tempResource');
        var tempData;
        tempData = Ember.merge(resourceForEditing, tempResource);
        this.set('tempResource', tempData ? tempData : resourceForEditing);
        this.get('tempResource').set('owner', this.get('resource.owner'));
        this.set('isEditing', true);
      },

      /**
       * Select resource type
       */
      selectType: function(type) {
        this.set('tempResource.format', type);
      },

      /**
       * Save updated content
       */
      updateContent: function() {
        this.set('isUrlChange', false);
        this.saveContent();
      },

      /**
       * Save settings profile visibility option
       */
      publishToProfile: function() {
        var resourceForEditing = this.get('resource').copy();
        this.set('tempResource', resourceForEditing);
        this.saveContent();
      },

      /**
       * Delete resource
       */
      deleteResource: function() {
        const myId = this.get('session.userId');
        const collection = this.get('collection');
        var model = {
          content: this.get('resource'),
          deleteMethod: function() {
            return this.get('resourceService').deleteResource(
              this.get('resource.id'),
              collection
            );
          }.bind(this),
          type: CONTENT_TYPES.RESOURCE,
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
          'content.modals.gru-delete-resource',
          model,
          null,
          null,
          null,
          false
        );
      },

      addToCollection: function() {
        const component = this;
        if (component.get('session.isAnonymous')) {
          component.send('showModal', 'content.modals.gru-login-prompt');
        } else {
          component
            .get('profileService')
            .readCollections(component.get('session.userId'))
            .then(function(collections) {
              component.send(
                'showModal',
                'content.modals.gru-add-to-collection',
                {
                  content: component.get('resource'),
                  collections
                },
                null,
                'add-to'
              );
            });
        }
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

      selectSubjectVideoTimeline: function(subject) {
        this.set('selectedSubjectVideoTimeline', subject);
        this.set('standardDisabledVideoTimeline', false);
      },

      selectCategoryVideoTimeline: function(category) {
        let component = this;
        var standardLabel = category === EDUCATION_CATEGORY.value;
        component.set('standardLabelVideoTimeline', !standardLabel);
        if (category === component.get('selectedCategoryVideoTimeline')) {
          component.set('selectedCategoryVideoTimeline', null);
        } else {
          component.set('selectedCategoryVideoTimeline', category);
        }
        component.set('selectedSubjectVideoTimeline', null);
      },

      /**
       * Remove tag data from the taxonomy list in tempUnit
       */
      removeTag: function(taxonomyTag) {
        var tagData = taxonomyTag.get('data');
        this.get('tempResource.standards').removeObject(tagData);
      },

      /**
       * Remove tag data from the taxonomy list in tempUnit
       */
      deleteVideoList: function(list) {
        this.get('videoTimeList').removeObject(list);
      },

      /**
       * Remove tag data from the taxonomy list in tempUnit
       */
      removeTagVideoTimeline: function(taxonomyTag) {
        var tagData = taxonomyTag.get('data');
        this.get('standardsVideoTimeline').removeObject(tagData);
      },

      openTaxonomyModal: function() {
        this.openTaxonomyModal();
      },

      openVideoTaxonomyModal: function() {
        this.openVideoTaxonomyModal();
      },

      addTimeline: function() {
        let component = this;
        var standardsVideoTimeline = component.get('standardsVideoTimeline');
        var videoTimeList = component.get('videoTimeList');
        var timeLine = component.get('timeLine');

        if (
          validateHhMmSs(component.get('timeLine.startTime')) &&
          validateHhMmSs(component.get('timeLine.endTime')) &&
          component.get('timeLine.startTime') <
            component.get('timeLine.endTime')
        ) {
          component.set('isStartTimeError', false);
          component.set('isEndTimeError', false);
          component.set('isEndTimeEqual', false);
          timeLine.validate().then(function({ validations }) {
            if (
              validations.get('isValid') &&
              standardsVideoTimeline &&
              standardsVideoTimeline.length
            ) {
              standardsVideoTimeline.forEach(object => {
                var obj = {
                  gut_comp_code: object.code,
                  fw_comp_code: object.frameworkCode,
                  fw_comp_desc: object.description,
                  start_time: component.get('timeLine.startTime'),
                  end_time: component.get('timeLine.endTime')
                };
                videoTimeList.pushObject(obj);
              });
              component.set('standardsVideoTimeline', Ember.A([]));
              component.set('timeLine.startTime', null);
              component.set('timeLine.endTime', null);
              Ember.$('.gru-input.startTime input').val('');
              Ember.$('.gru-input.endTime input').val('');
              component.set('standardDisabledVideoTimeline', true);
              component.set('selectedSubjectVideoTimeline', null);
              component.set('selectedCategoryVideoTimeline', null);
            }
          });
        } else {
          if (validateHhMmSs(component.get('timeLine.startTime'))) {
            component.set('isStartTimeError', false);
          } else {
            component.set('isStartTimeError', true);
          }

          if (validateHhMmSs(component.get('timeLine.endTime'))) {
            component.set('isEndTimeError', false);
          } else {
            component.set('isEndTimeError', true);
          }

          if (
            component.get('timeLine.startTime') <
            component.get('timeLine.endTime')
          ) {
            component.set('isEndTimeEqual', false);
          } else {
            component.set('isEndTimeEqual', true);
          }
        }
      },

      setPublisher: function(checked) {
        var tempResource = this.get('tempResource');
        if (checked) {
          tempResource.set('publisher', this.get('session.userData.username'));
          tempResource.set('amIThePublisher', true);
        } else {
          tempResource.set('publisher', '');
          tempResource.set('amIThePublisher', false);
        }
      },

      linkSwitch: function() {
        var tempResource = this.get('tempResource');
        tempResource.set('displayGuide', this.get('tempResource.displayGuide'));
      },

      openSkillsModal: function() {
        this.openSkillsModal();
      },

      /**
       * Remove century skill id
       */
      removeSkill: function(skillItemId) {
        this.get('tempResource.centurySkills').removeObject(skillItemId);
      },

      //Action triggered when click on back
      onClickBack() {
        window.history.back();
      },

      //Action triggered when click on edit button in resource
      editResource: function() {
        var resourceForEditing = this.get('resource').copy();
        var tempResource = this.get('tempResource');
        var tempData;
        tempData = Ember.merge(resourceForEditing, tempResource);
        this.set('tempResource', tempData ? tempData : resourceForEditing);
        this.get('tempResource').set('owner', this.get('resource.owner'));
        this.set('isResourceEditing', true);
      },

      //Action triggered when change the resource urlResourceFactory
      onURLChange: function() {
        this.detectVimeoYoutubeVideoURL(this.get('tempResource.url'));
      },

      //Action triggered when click on save button in resource
      updateResource: function() {
        const component = this;
        var editedResource = component.get('tempResource');
        if (this.get('isResourceUpload') && !this.get('tempResource.file')) {
          this.set(
            'emptyFileError',
            this.get('i18n').t('common.errors.file-upload-missing', {
              extensions: this.get('tempResource.extensions')
            })
          );
        } else {
          editedResource.validate().then(function({ validations }) {
            if (validations.get('isValid')) {
              if (editedResource.format === 'html') {
                component.saveContent();
                return;
              }
              return Ember.RSVP.hash({
                resultResource: component.get('tempResource.file')
                  ? component.handleResourceUpload(editedResource)
                  : editedResource
              }).then(({ resultResource }) => {
                component.set('tempResource', resultResource);
                if (
                  component.get('tempResource.url') &&
                  component.get('tempResource.url') ===
                    component.get('resource.url') &&
                  !component.get('isEditing')
                ) {
                  component.set('isResourcesAlreadyExists', false);
                  component.set('isResourceEditing', false);
                } else {
                  component.set('isUrlChange', true);
                  component.saveContent();
                }
              });
            }
            component.set('didValidate', true);
          });
        }
      },

      //Action triggered when click on cancel button in resource
      cancelEditResources: function() {
        this.set('isResourceEditing', false);
        this.set('isResourcesAlreadyExists', false);
        this.set('tempResource', this.get('resource').copy());
      },

      selectFile: function(file) {
        this.set('tempResource.file', file);
        if (file) {
          const isSelectType = this.isSelectType(file.name);
          let checkExtension = UPLOADABLE_TYPES.find(types => {
            return types.validExtensions === `.${isSelectType}`;
          });
          if (!checkExtension) {
            checkExtension = UPLOADABLE_TYPES[0];
          }
          this.send('selectUploadType', checkExtension);
        }
      },
      selectUploadType: function(uploadType) {
        if (uploadType) {
          this.set('tempResource.format', uploadType.value);
          this.set('tempResource.extensions', uploadType.validExtensions);
          this.set('tempResource.mimeType', uploadType.validType);
        }
      },

      toggleSuggestion() {
        const component = this;
        Ember.run.later(function() {
          if (component.get('showSuggestion')) {
            component.set('showSuggestion', false);
          }
        }, 500);
      },

      inputTyping(text) {
        const component = this;
        let tagList = component.get('tagList');
        let isExist = tagList.find(element => element === text);
        let suggestionList = Ember.A([]);
        const labelText = component.get('i18n').t('common.new-label').string;
        if (!isExist && text) {
          component
            .get('questionService')
            .getTags(text, 10, 0)
            .then(function(tag) {
              if (tag && tag.length) {
                tag.map(item => {
                  let data = Ember.Object.create({
                    name: item,
                    displayName: item
                  });
                  suggestionList.pushObject(data);
                });
              }
              let dataItem = Ember.Object.create({
                name: text,
                displayName: `${text} (${labelText})`
              });
              suggestionList.pushObject(dataItem);
              component.set('suggestionList', suggestionList);
              component.set('showSuggestion', true);
            });
        }
      },

      addTag(tag) {
        const component = this;
        let tagList = component.get('tagList');
        let isExist = tagList.find(element => element === tag);
        if (!isExist && tag) {
          tagList.pushObject(tag);
          let metadata = component.get('tempResource');
          metadata.freeFormTag = tagList;
        }
        component.set('tagValue', null);
        component.set('showSuggestion', false);
      },

      removeTagAtIndex(index) {
        const component = this;
        let tagList = component.get('tagList');
        tagList.removeAt(index);
        let metadata = component.get('tempResource');
        metadata.freeFormTag = tagList;
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * Indicates if the url is a video url
     * @property {boolean}
     */
    isVideo: Ember.computed('resource.url', function() {
      return isVideoURL(this.get('resource.url'));
    }),
    /**
     * Copy of the resource model used for editing.
     * @property {Resource}
     */
    tempResource: null,

    tagList: [],

    tagValue: null,

    showSuggestion: false,

    suggestionList: Ember.A([]),

    /**
     * List of resource types
     * @property {Array}
     */
    resourceTypes: RESOURCE_TYPES,

    /**
     * Determines the name of the component that renders the resource
     * @property {String}
     */
    resourceComponent: Ember.computed('resource.resourceType', function() {
      return RESOURCE_COMPONENT_MAP[this.get('resource.resourceType')];
    }),

    isH5PContent: Ember.computed('resource', function() {
      return this.get('resource.format') === 'h5p';
    }),

    /**
     * @property {String}
     */
    accessToken: Ember.computed.alias('session.token-api3'),

    contentURL: Ember.computed('isH5PContent', function() {
      if (this.get('isH5PContent')) {
        let accessToken = this.get('accessToken');
        let resourceId = this.get('resource.id');
        let resourceType = this.get('resource.type');
        let format = 'resource';
        let contentURL = `${window.location.protocol}//${window.location.host}/tools/h5p/edit/${resourceId}?accessToken=${accessToken}&contentType=${resourceType}&format=${format}`;
        return contentURL;
      }
    }),

    isLoading: Ember.computed('contentURL', function() {
      return !!this.get('contentURL');
    }),

    /**
     * @property {boolean}
     */
    isResourceUpload: Ember.computed('resource', function() {
      if (
        this.get('resource.format') === 'image' ||
        this.get('resource.format') === 'text'
      ) {
        let defaultUploadType = UPLOADABLE_TYPES.find(item => {
          return item.value === this.get('resource.format');
        });
        this.send('selectUploadType', defaultUploadType);
        return true;
      } else {
        return false;
      }
    }),

    // -------------------------------------------------------------------------
    // Observers

    clearEmptyFileError: Ember.observer('tempResource.file', function() {
      if (this.get('emptyFileError')) {
        this.set('emptyFileError', null);
      }
    }),

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
    standardLabelVideoTimeline: true,

    /**
     * @property {boolean}
     */
    standardsVideoTimeline: Ember.A([]),

    /**
     * @property {boolean}
     */
    standardDisabled: Ember.computed.not('selectedSubject'),

    /**
     * @property {boolean}
     */
    standardDisabledVideoTimeline: Ember.computed.not(
      'selectedSubjectVideoTimeline'
    ),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    tags: Ember.computed('resource.standards.[]', function() {
      return TaxonomyTag.getTaxonomyTags(this.get('resource.standards'), false);
    }),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    tagsVideoTimeline: Ember.computed('standardsVideoTimeline.[]', function() {
      return TaxonomyTag.getTaxonomyTags(
        this.get('standardsVideoTimeline'),
        false
      );
    }),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    editableTags: Ember.computed('tempResource.standards.[]', function() {
      return TaxonomyTag.getTaxonomyTags(
        this.get('tempResource.standards'),
        false,
        true
      );
    }),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    editableTagsVideoTimeline: Ember.computed(
      'standardsVideoTimeline.[]',
      function() {
        return TaxonomyTag.getTaxonomyTags(
          this.get('standardsVideoTimeline'),
          false,
          true
        );
      }
    ),

    /**
     * Toggle Options
     * @property {Ember.Array}
     */
    switchOptions: Ember.A([
      Ember.Object.create({
        label: 'common.on',
        value: true
      }),
      Ember.Object.create({
        label: 'common.off',
        value: false
      })
    ]),

    timeLine: Ember.A([
      Ember.Object.create({
        startTime: null,
        endTime: null
      })
    ]),

    videoTimeList: Ember.computed('resource.playerMetadata', function() {
      const resource = this.get('resource.playerMetadata');
      return resource ? resource : Ember.A([]);
    }),

    /**
     * Indicates if the current resource type is resource
     * @property {boolean}
     */
    isNotIframeUrl: Ember.computed('resource', function() {
      const resource = this.get('resource');
      return resource && resource.displayGuide;
    }),

    /**
     * Indicates is the resource type edit option should be disabled
     * @property {boolean}
     */
    disableTypeEdition: Ember.computed('resource.url', function() {
      return isVideoURL(this.get('resource.url'));
    }),

    isYouTubeVideoURL: Ember.computed('resource.url', function() {
      return isYouTubeURL(this.get('resource.url'));
    }),

    /**
     * @property {CenturySkill[]} List of selected century skills
     */
    tempSelectedSkills: Ember.computed(
      'tempResource.centurySkills.[]',
      'centurySkills.[]',
      function() {
        let selectedCenturySkillsIds = this.get('tempResource.centurySkills');

        return this.selectedCenturySkillsData(selectedCenturySkillsIds);
      }
    ),

    /**
     * @property {CenturySkill[]} List of selected century skills
     */
    selectedSkills: Ember.computed(
      'resource.centurySkills.[]',
      'centurySkills.[]',
      function() {
        let selectedCenturySkillsIds = this.get('resource.centurySkills');

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
    selectedCategory: Ember.computed('resource', function() {
      let standard = this.get('resource.standards.firstObject');
      let subjectId = standard ? getSubjectId(standard.get('id')) : null;
      return subjectId ? getCategoryCodeFromSubjectId(subjectId) : null;
    }),

    selectedCategoryVideoTimeline: Ember.computed('resource', function() {
      let standard = this.get('standardsVideoTimeline.firstObject');
      let subjectId = standard ? getSubjectId(standard.get('id')) : null;
      return subjectId ? getCategoryCodeFromSubjectId(subjectId) : null;
    }),

    selectedSubject: Ember.computed('resource', function() {
      let standard = this.get('resource.standards.firstObject');
      if (standard) {
        standard.set(
          'subjectCode',
          getGutCodeFromSubjectId(getSubjectId(standard.get('id')))
        );
      }
      return standard ? standard : null;
    }),

    selectedSubjectVideoTimeline: Ember.computed('resource', function() {
      let standard = this.get('standardsVideoTimeline.firstObject');
      if (standard) {
        standard.set(
          'subjectCode',
          getGutCodeFromSubjectId(getSubjectId(standard.get('id')))
        );
      }
      return standard ? standard : null;
    }),

    /**
     * @property {boolean}
     */
    isResourceEditing: false,

    /**
     * @type {String} emptyFileError
     */
    emptyFileError: null,

    /**
     * @property {boolean}
     */
    isResourcesAlreadyExists: false,

    /**
     * @property {boolean}
     */
    isUrlChange: false,

    isEditResources: Ember.computed('resource', function() {
      let resourceOwner = this.get('resource.owner');
      let ownerId = resourceOwner ? resourceOwner.get('id') : null;
      let userId = this.get('session.userId');
      let originalResourceId = this.get('resource.originalResourceId');
      let creatorId = this.get('resource.creatorId');
      return (
        (!originalResourceId && userId === ownerId) || creatorId === userId
      );
    }),

    // -------------------------------------------------------------------------
    // Methods

    openTaxonomyModal: function() {
      var component = this;
      var standards = component.get('tempResource.standards') || [];
      var subject = component.get('selectedSubject');
      var subjectStandards = TaxonomyTagData.filterBySubject(
        subject,
        standards
      );
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
            component.get('tempResource.standards').pushObjects(standards);
            component.set(
              'tempResource.standards',
              component.get('tempResource.standards').uniqBy('code')
            );
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

    openVideoTaxonomyModal: function() {
      var component = this;
      var standards = component.get('standardsVideoTimeline') || [];
      var subject = component.get('selectedSubjectVideoTimeline');
      var subjectStandards = TaxonomyTagData.filterBySubject(
        subject,
        standards
      );
      var notInSubjectStandards = TaxonomyTagData.filterByNotInSubject(
        subject,
        standards
      );
      var model = {
        selected: subjectStandards,
        shortcuts: null, // TODO: TBD
        subject: subject,
        standardLabel: component.get('standardLabelVideoTimeline'),
        callback: {
          success: function(selectedTags) {
            var dataTags = selectedTags.map(function(taxonomyTag) {
              return taxonomyTag.get('data');
            });
            const standards = Ember.A(dataTags);
            standards.pushObjects(notInSubjectStandards.toArray());
            component.get('standardsVideoTimeline').pushObjects(standards);
            component.set(
              'standardsVideoTimeline',
              component.get('standardsVideoTimeline').uniqBy('code')
            );
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

    /**
     * Save Content
     */
    saveContent: function() {
      const component = this;
      const collection = component.get('collection');
      const editedResource = component.get('tempResource');
      const etlHrs = editedResource.get('resourceHours');
      const etlMins = editedResource.get('resourceMinutes');
      etlSecCalculation(editedResource, etlHrs, etlMins);
      editedResource.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          if (editedResource.url === component.get('resource.url')) {
            delete editedResource.url;
          }
          var videoTimeList = component.get('videoTimeList');
          if (videoTimeList && videoTimeList.length) {
            var playerMetadata = {
              video_timeline_by_competencies: videoTimeList
            };
            Ember.set(editedResource, 'player_metadata', playerMetadata);
          }
          if (
            editedResource.htmlContent !==
            component.get('tempResource').htmlContent
          ) {
            Ember.set(
              editedResource,
              'htmlContent',
              component.get('tempResource.htmlContent')
            );
          }
          component
            .get('resourceService')
            .updateResource(
              component.get('resource.id'),
              editedResource,
              collection
            )
            .then(
              function() {
                if (!editedResource.url) {
                  Ember.set(
                    editedResource,
                    'url',
                    component.get('resource.url')
                  );
                }
                component.set(
                  'videoTimeList',
                  editedResource.player_metadata
                    ? editedResource.player_metadata
                      .video_timeline_by_competencies
                    : []
                );
                component.set('resource', editedResource);
                component.set('isEditing', false);
                component.set('isResourceEditing', false);
                component.set('isResourcesAlreadyExists', false);
              },
              function(data) {
                if (data.resourceId) {
                  //already exists
                  component.set('isResourcesAlreadyExists', true);
                }
              }
            )
            .catch(function() {
              var message = component
                .get('i18n')
                .t('common.errors.resource-not-updated').string;
              component.get('notifications').error(message);
            });
        }
        component.set('didValidate', true);
      });
    },

    openSkillsModal: function() {
      var component = this;
      var model = {
        selectedCenturySkills: component.get('tempResource.centurySkills'),
        centurySkills: component.get('centurySkills'),
        callback: {
          success: function(selectedCenturySkills) {
            component.set(
              'tempResource.centurySkills',
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
    },

    /**
     * Check it can be render inside player or not
     * @property {boolean}
     */

    isLinkOut: Ember.computed('resource', function() {
      let currentProtocol = this.get('currentProtocol');
      let resourceProtocol = this.get('resourceProtocol');
      if (
        currentProtocol === 'https:' &&
        resourceProtocol === 'http:' &&
        this.get('resource').format !== 'html'
      ) {
        return true;
      }
      return false;
    }),

    detectVimeoYoutubeVideoURL: function(url) {
      if (isVideoURL(url)) {
        this.set('isVideo', true);
        this.set('tempResource.format', VIDEO_RESOURCE_TYPE);
      } else {
        this.set('isVideo', false);
      }
    },
    isSelectType: function(url) {
      return (
        url &&
        url
          .split(/[#?]/)[0]
          .split('.')
          .pop()
          .trim()
      );
    },

    init() {
      this._super(...arguments);
      this.set(
        'timeLine',
        VideoTimeLine.create(Ember.getOwner(this).ownerInjection(), {
          startTime: '',
          endTime: ''
        })
      );
      this.set('isResourceEditing', this.get('isEditing'));
      let tempResource = this.get('tempResource');
      this.set('tagList', []);
      if (tempResource.freeFormTag && tempResource.freeFormTag.length) {
        let tagList = this.get('tagList');
        tempResource.freeFormTag.forEach(item => {
          tagList.pushObject(item);
        });
      }
    },

    didRender() {
      const getCheckbox = this.$('.checkbox-inline > input[type="checkbox"]');
      if (getCheckbox) {
        for (let i = 0; i < getCheckbox.length; i++) {
          getCheckbox[i].title = 'im-publisher';
        }
      }

      const getInputBox = this.$('input[type="file"]');
      if (getInputBox) {
        for (let i = 0; i < getInputBox.length; i++) {
          getInputBox[i].title = getInputBox[i].id;
        }
      }

      const component = this;
      /**
       * method used to listen the events from iframe.
       **/
      function receiveMessage(event) {
        if (event.data === 'loading_completed') {
          component.set('isLoading', false);
        }
      }

      window.addEventListener('message', receiveMessage, false);
    },

    /**
     * Create a resource (url/upload)
     * @param {Resource}
     * @return {Promise.<Resource>}
     */
    handleResourceUpload: function(resource) {
      return new Ember.RSVP.Promise(
        function(resolve) {
          this.get('mediaService')
            .uploadContentFile(resource.file)
            .then(function(filename) {
              resource.set('url', filename);
              resource.set(
                'fileName',
                filename.substring(filename.lastIndexOf('/') + 1)
              );
              resolve(resource);
            });
        }.bind(this)
      );
    }
  }
);
