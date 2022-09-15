import Ember from 'ember';
import ResourceModel from 'gooru-web/models/content/resource';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import {
  addProtocolIfNecessary,
  checkDomains,
  serializeEtlSec
} from 'gooru-web/utils/utils';

/**
 * Serializer to support the Resource CRUD operations for API 3.0
 *
 * @typedef {Object} ResourceSerializer
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serialize a Resource object into a JSON representation required by the Create Resource endpoint
   *
   * @param resourceModel The Resource model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeCreateResource: function(resourceModel) {
    const format = ResourceModel.serializeResourceFormat(
      resourceModel.get('format')
    );
    let serializedResource = {
      title: resourceModel.get('title'),
      url: resourceModel.get('url'),
      content_subformat: format,
      visible_on_profile: resourceModel.get('isVisibleOnProfile'),
      primary_language: resourceModel.get('primaryLanguage'),
      is_remote: resourceModel.get('isRemote') !== false //if true or undefined should be true
    };
    if (format === 'html_resource') {
      delete serializedResource.url;
      serializedResource.is_remote = false;
      serializedResource.description = resourceModel.description;
      serializedResource.html_content = resourceModel.get('htmlContent')
        ? window.btoa(resourceModel.get('htmlContent'))
        : null;
    }
    if (resourceModel.get('author_etl_secs')) {
      serializedResource.author_etl_secs =
        resourceModel.get('author_etl_secs') === '0'
          ? null
          : resourceModel.get('author_etl_secs');
    }
    return serializedResource;
  },

  /**
   * Serialize a Resource object into a JSON representation required by the Update Resource endpoint
   *
   * @param resourceModel The Resource model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateResource: function(resourceModel, isPublisher) {
    const serializer = this;
    const show_scores = resourceModel.get('showScore');
    let serializedResource = {
      title: resourceModel.get('title'),
      description: resourceModel.get('description'),
      narration: resourceModel.get('narration'),
      html_content: resourceModel.get('htmlContent')
        ? btoa(unescape(encodeURIComponent(resourceModel.get('htmlContent'))))
        : null,
      content_subformat:
        resourceModel.get('format') === 'h5p'
          ? resourceModel.get('type')
          : ResourceModel.serializeResourceFormat(resourceModel.get('format')),
      taxonomy: serializer
        .get('taxonomySerializer')
        .serializeTaxonomy(resourceModel.get('standards')),
      visible_on_profile: resourceModel.get('isVisibleOnProfile'),
      primary_language: resourceModel.get('primaryLanguage'),
      //"depth_of_knowledge": null, // Not required at the moment
      //"thumbnail": null // Not required at the moment
      //one publisher for now
      is_copyright_owner: resourceModel.get('amIThePublisher'),
      display_guide: resourceModel.get('displayGuide')
        ? { is_broken: 0, is_frame_breaker: 1, show_scores }
        : { is_broken: 0, is_frame_breaker: 0, show_scores },
      metadata: {
        '21_century_skills': [],
        tags: resourceModel.get('freeFormTag')
          ? resourceModel.get('freeFormTag')
          : []
      },
      author_etl_secs: resourceModel.get('author_etl_secs')
    };
    if (isPublisher) {
      serializedResource.copyright_owner = resourceModel.get('publisher')
        ? [resourceModel.get('publisher')]
        : [''];
    }
    serializedResource.metadata['21_century_skills'] =
      resourceModel.get('centurySkills') || [];
    if (resourceModel.get('url')) {
      serializedResource.url = resourceModel.get('url');
    }
    if (resourceModel.get('player_metadata')) {
      serializedResource.player_metadata = resourceModel.get('player_metadata');
    }
    return serializedResource;
  },

  /**
   * Serialize the resource title
   *
   * @param title
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateResourceTitle: function(title) {
    let serialized = {
      title: title
    };
    return serialized;
  },

  /**
   * Normalize the resource data into a Resource object
   * @param resourceData
   * @returns {Resource}
   */
  normalizeReadResource: function(resourceData) {
    const serializer = this;
    const format = ResourceModel.normalizeResourceFormat(
      resourceData.content_subformat
    );
    const standards = resourceData.taxonomy || {};
    const cdnUrl = serializer.get('session.cdnUrls.content');
    const info = resourceData.info || {};
    const metadata = resourceData.metadata || {};
    const etlSeconds = serializeEtlSec(resourceData.author_etl_secs);
    const computedEtlSec = serializeEtlSec(
      resourceData.system_computed_etl_secs
    );
    const resource = ResourceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        id: resourceData.id,
        title: resourceData.title,
        url: resourceData.url,
        creatorId: resourceData.creator_id,
        format: format,
        content_format: resourceData.content_format,
        description: resourceData.description,
        narration: resourceData.narration,
        htmlContent: resourceData.html_content
          ? decodeURIComponent(escape(atob(resourceData.html_content)))
          : null,
        publishStatus: resourceData.publish_status,
        originalResourceId: resourceData.original_content_id,
        standards: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(standards),
        owner: resourceData.creator_id,
        info: info,
        amIThePublisher: resourceData.is_copyright_owner || false,
        primaryLanguage: resourceData.primary_language || 1,
        publisher: resourceData.copyright_owner
          ? resourceData.copyright_owner[0]
          : null,
        isVisibleOnProfile:
          typeof resourceData.visible_on_profile !== 'undefined'
            ? resourceData.visible_on_profile
            : true,
        order: resourceData.sequence_id,
        displayGuide:
          resourceData.display_guide &&
          (resourceData.display_guide.is_broken === 1 ||
            resourceData.display_guide.is_frame_breaker === 1),
        isRemote: resourceData.is_remote !== false, //if true or undefined should be true
        centurySkills:
          metadata['21_century_skills'] &&
          metadata['21_century_skills'].length > 0
            ? metadata['21_century_skills']
            : [],
        freeFormTag:
          metadata.tags && metadata.tags.length > 0 ? metadata.tags : [],
        author_etl_secs: resourceData.author_etl_secs,
        resourceHours:
          etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
        resourceMinutes:
          etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes,
        computedHours:
          computedEtlSec.etlHours === '0 hr' ? '' : computedEtlSec.etlHours,
        computedMinutes:
          computedEtlSec.etlMinutes === '0 min'
            ? ''
            : computedEtlSec.etlMinutes,
        playerMetadata: resourceData.player_metadata
          ? resourceData.player_metadata.video_timeline_by_competencies
          : [],
        type: resourceData.content_subformat,
        showScore: !(
          resourceData &&
          resourceData.display_guide &&
          resourceData.display_guide.show_scores === false
        )
      }
    );
    resource.set(
      'displayGuide',
      resource.get('displayGuide') || this.checkURLProtocol(resourceData.url)
    );

    if (resourceData.url) {
      const protocolPattern = /^((http|https|ftp):\/\/)/;
      if (!protocolPattern.test(resourceData.url)) {
        //if no protocol add it
        let resourceUrl = resourceData.url;
        let containsCdnUrl = checkDomains(resourceUrl, cdnUrl);
        if (!containsCdnUrl) {
          resourceUrl = cdnUrl + resourceUrl;
        }
        resource.set('url', addProtocolIfNecessary(resourceUrl, true));
      }
      let url = resource.get('url').split('/');
      resource.set('fileName', url[url.length - 1]);
    }
    return resource;
  },
  checkURLProtocol: function(url) {
    return window.location.protocol === 'https:' && /^((http):\/\/)/.test(url);
  }
});
