import Ember from 'ember';
import { RESOURCE_COMPONENT_MAP } from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import ProtocolMixin from 'gooru-web/mixins/content/protocol';
import { isVideoURL } from 'gooru-web/utils/utils';

export default Ember.Component.extend(ProtocolMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/resource
   */
  resourceService: Ember.inject.service('api-sdk/resource'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'resources', 'gru-resource-play'],

  tagName: 'article',

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Performs a back action in the browser history
     */
    goBack: function() {
      window.history.go(-1);
    },

    onCloseWindow() {
      window.close();
    }
  },

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  didInsertElement: function() {
    this.calculateResourceContentHeight();
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
   * @property {Resource}
   */
  playerResource: Ember.computed('resource', function() {
    return this.get('resource').toPlayerResource();
  }),

  /* Calculated height designated for the content area of a resource
   * @see components/player/resources/gru-url-resource.js
   * @property {Number}
   */
  calculatedResourceContentHeight: 0,

  /**
   * Calculates the component name that renders the resource
   */
  resourceComponent: Ember.computed('resource.resourceType', function() {
    return RESOURCE_COMPONENT_MAP[this.get('resource.resourceType')];
  }),

  /**
   * Indicates if the current resource type is resource
   * @property {boolean}
   */
  isNotIframeUrl: Ember.computed('resource', function() {
    const resource = this.get('resource');
    return resource && resource.displayGuide;
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
      let resourceScore = this.get('resource.showScore');
      let format = 'resource';
      let contentURL = `${window.location.protocol}//${window.location.host}/tools/h5p/play/${resourceId}?accessToken=${accessToken}&contentType=${resourceType}&format=${format}&showScore=${resourceScore}`;
      return contentURL;
    }
  }),

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observes for the resource change
   */
  resourceObserver: Ember.observer('resource.id', function() {
    this.calculateResourceContentHeight();
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('resource.standards.[]', function() {
    return TaxonomyTag.getTaxonomyTags(this.get('resource.standards'), false);
  }),

  /**
   * @property {Boolean} Whether or not the currently logged in user is the creator/owner of the resource
   */
  isCreator: Ember.computed('resource.owner', function() {
    return this.get('resource.owner.id') === this.get('session.userId');
  }),

  /**
   * Show the publisher if the resource has publisher and is publish
   * @property {boolean}
   */
  showPublisher: Ember.computed('resource', function() {
    return this.get('resource').isPublished && this.get('resource').publisher;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Calculates the height of the content area (it will change depending on height
   * of the narration -if there is one)
   */
  calculateResourceContentHeight: function() {
    if (
      this.get('resource.isUrlResource') ||
      this.get('resource.isPDFResource') ||
      this.get('resource.isImageResource')
    ) {
      let $component = this.$();
      let $windowHeight = $(window).outerHeight(true);
      let $mainHeaderHeight = $('.gru-header').outerHeight(true);
      let $componentHeaderHeight = $component.find('header').outerHeight(true);

      // The 7 pixels subtracted are to make sure no scroll bar will appear for the content
      // (Users should rely on the iframe scroll bar instead)
      this.set(
        'calculatedResourceContentHeight',
        $windowHeight - $mainHeaderHeight - $componentHeaderHeight - 7
      );
    }
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
  })
});
