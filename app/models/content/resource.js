import Ember from 'ember';
import PlayerResource from 'gooru-web/models/resource/resource';
import { getCategoryCodeFromSubjectId } from 'gooru-web/utils/taxonomy';

import EditResourceValidations from 'gooru-web/validations/edit-resource';
/**
 * Resource model
 *
 * @typedef {Object} Resource
 */
const ResourceModel = Ember.Object.extend({
  /**
   * @property {Number} id
   */
  id: 0,

  /**
   * @property {Number} assessmentId - if has a linked assessment in the study player
   */
  assessmentId: 0,

  /**
   * @property {String} url
   */
  url: null,

  htmlContent: null,

  /**
   * @property {String} assetUrl
   * TODO: Remove this once API 3.0 integration is completed
   */
  assetUrl: Ember.computed.alias('url'),

  /**
   * @property {String} thumbnailUrl
   */
  thumbnailUrl: null,

  /**
   * @property {Boolean} isEditing
   */
  isEditing: false,

  /**
   * @property {string}
   */
  format: null,

  /**
   * @property {string}
   */
  title: null,

  /**
   * @property {string}
   */
  description: null,

  /**
   * @property {string}
   */
  narration: null,

  /**
   * @property {string} published|unpublished|requested
   */
  publishStatus: null,

  /**
   * @property { Content/User }
   */
  owner: null,

  /**
   * The original creator
   * @property { Content/User }
   */
  creator: null,

  /**
   * When the owner and the creator are the same
   * @property {boolean}
   */
  sameOwnerAndCreator: Ember.computed.equal('owner.id', 'creator.id'),

  /**
   * @property {Boolean} isPublic
   */
  isPublished: Ember.computed.equal('publishStatus', 'published'),

  /**
   * @property {Boolean} isVisibleOnProfile - Indicates if the Question is visible on Profile. By default it is false
   */
  isVisibleOnProfile: false,

  /**
   * @property {TaxonomyTagData[]} an array with Taxonomy data
   */
  standards: [],

  /**
   * @property {Number[]} Array with the centurySkills ids
   */
  centurySkills: [],

  /**
   * @property {Number[]} Array with the free form tag
   */
  freeFormTag: [],

  /**
   * Some metadata properties
   * @property {{}}
   */
  info: null,

  /**
   * @property {string}
   */
  publisher: null,

  /**
   * @property {boolean}
   */
  amIThePublisher: false,

  /**
   * Sequence number, when is part of a collection
   * @property {number}
   */
  order: null,

  /**
   * @property {{}}
   */
  displayGuide: null,

  /**
   * @property {String} category - Category the course belongs to
   */
  category: Ember.computed('subject', function() {
    let subjectId = this.get('subject');
    if (subjectId) {
      return getCategoryCodeFromSubjectId(subjectId);
    }
  }),

  /**
   * @property {String} Taxonomy primary subject ID
   */
  subject: '',

  /**
   * @property {String} Indicates the resource type. i.e video/youtube, assessment-question, image/png
   */
  resourceType: Ember.computed('format', function() {
    let format = this.get('format');
    let resourceUrl = this.get('url');
    let youtubePattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    let vimeoPattern = /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|)(\d+)(?:|\/\?)/;
    let pdfPattern = /.*\.pdf/;
    let resourceType = 'resource/url'; // Default type
    if (format === 'html') {
      resourceType = 'resource/html';
    }
    if (resourceUrl) {
      switch (format) {
      case 'audio':
      case 'interactive':
      case 'webpage':
        resourceType = 'resource/url'; // Default type
        break;
      case 'image':
        resourceType = pdfPattern.test(resourceUrl) ? 'handouts' : 'image';
        break;
      case 'text':
        resourceType = 'handouts';
        break;
      case 'video':
        if (youtubePattern.test(resourceUrl)) {
          resourceType = 'video/youtube';
        } else if (vimeoPattern.test(resourceUrl)) {
          resourceType = 'vimeo/video';
        } else {
          resourceType = 'resource/url';
        }
        break;
      default:
        resourceType = 'resource/url'; // Default type
      }
    }
    return resourceType;
  }),

  /**
   * Indicates if it is an image resource
   * @property {boolean}
   */
  isImageResource: Ember.computed('resourceType', function() {
    var resourceType = this.get('resourceType');
    return resourceType && resourceType.indexOf('image') >= 0;
  }),

  /**
   * Indicates if it is an youtube resource
   * @property {boolean}
   */
  isYoutubeResource: Ember.computed.equal('resourceType', 'video/youtube'),

  /**
   * Indicates if it is an pdf resource
   * @property {boolean}
   */
  isPDFResource: Ember.computed.equal('resourceType', 'handouts'),

  /**
   * Indicates if it is an url resource
   * @property {boolean}
   */
  isUrlResource: Ember.computed.equal('resourceType', 'resource/url'),
  playerMetadata: Ember.A([]),
  /**
   * Indicates if it is an vimeo resource
   * @property {boolean}
   */
  isVimeoResource: Ember.computed.equal('resourceType', 'vimeo/video'),

  /**
   * Indicates if the resources is a 3rd party/remote url
   * Uploaded resources are not considered remote
   * @property {boolean}
   */
  isRemote: true,

  /**
   * Return a copy of the resource
   *
   * @function
   * @return {Resource}
   */
  copy: function() {
    var properties = this.getProperties(this.modelProperties());

    let standards = this.get('standards');
    let info = this.get('info');
    let centurySkills = this.get('centurySkills');
    let freeFormTag = this.get('freeFormTag');

    // Copy standards and info values
    properties.standards = standards.slice(0);
    properties.info = JSON.parse(JSON.stringify(info));
    properties.centurySkills = centurySkills.slice(0);
    properties.freeFormTag = freeFormTag.slice(0);

    var ResourceValidation = ResourceModel.extend(EditResourceValidations);

    return ResourceValidation.create(
      Ember.getOwner(this).ownerInjection(),
      properties
    );
  },

  /**
   * Copy a list of property values from another model to override the current ones
   *
   * @function
   * @param {Resource} model
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(model, propertyList = []) {
    var properties = model.getProperties(propertyList);
    this.setProperties(properties);
  },
  /**
   * Return a list of properties
   *
   * @function
   * @return {Array}
   */
  modelProperties: function() {
    var properties = [];
    const enumerableKeys = Object.keys(this);
    for (let i = 0; i < enumerableKeys.length; i++) {
      let key = enumerableKeys[i];
      let value = Ember.typeOf(this.get(key));
      if (value === 'string' || value === 'number' || value === 'boolean') {
        properties.push(key);
      }
    }
    return properties;
  },

  /**
   * Returns a player resource
   * @return {Resource}
   */
  toPlayerResource: function() {
    const model = this;
    return PlayerResource.create({
      id: model.get('id'),
      order: model.get('order'),
      owner: model.get('owner'),
      title: model.get('title'),
      resourceType: model.get('resourceType'),
      htmlContent: model.get('htmlContent'),
      resourceFormat: model.get('format'),
      format: model.get('format'),
      description: model.get('description'),
      thumbnail: model.get('thumbnailUrl'),
      assetUrl: model.get('assetUrl'),
      url: model.get('url'),
      displayGuide: model.get('displayGuide'),
      narration: model.get('narration'), //TODO missing
      options: null, //TODO missing
      taxonomy: model.get('standards'),
      isRemote: model.get('isRemote'),
      playerMetadata: model.get('playerMetadata')
    });
  },

  /**
   * Sets the subject of the course
   *
   * @function
   * @param {TaxonomyRoot} taxonomySubject
   */
  setTaxonomySubject: function(taxonomySubject) {
    if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
      this.set('subject', taxonomySubject ? taxonomySubject.get('id') : null);
    }
  }
});

ResourceModel.reopenClass({
  /**
   * Serializes the resource format to be API compliant
   * @param format
   * @returns {string}
   * TODO move to util
   */
  serializeResourceFormat: function(format) {
    const interactiveFormat = [
      'h5p_interactive_video',
      'h5p_interactive_slide',
      'h5p_interactive_personality_quiz',
      'h5p_drag_and_drop_resource'
    ];

    return interactiveFormat.includes(format)
      ? `${format}`
      : format
        ? `${format}_resource`
        : undefined;
  },

  /**
   * Converts several app format values to api values
   * @param {string[]} values values to format
   * TODO move to util
   */
  serializeAllResourceFormat: function(values) {
    const model = this;
    return values.map(function(format) {
      return model.serializeResourceFormat(format);
    });
  },

  /**
   * Normalizes the resource format to be App compliant
   * @param format
   * @returns {string}
   * TODO move to util
   */
  normalizeResourceFormat: function(format) {
    return format ? format.split('_')[0] : undefined; // i.e video_resource to video
  }
});

export default ResourceModel;
