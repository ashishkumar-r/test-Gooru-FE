import Ember from 'ember';
import { CONTENT_TYPE_ENUM } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {service} searchService
   */
  searchService: Ember.inject.service('api-sdk/search'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['learning-map-content'],

  /**
   * @property {Array} activityContents
   */
  activityContents: Ember.A([]),

  /**
   * @property {String} activityContentType
   */
  activityContentType: '',

  /**
   * @property {Number} startAt
   */
  startAt: 0,

  /**
   * @property {Number} length
   */
  length: 5,

  actions: {
    onSuggestContent(collection) {
      const component = this;
      const activityContentType = component.get('activityContentType');
      component.sendAction('onSuggestContent', collection, activityContentType);
    },

    onSelectActivityContent(contentType) {
      let component = this;
      component.set('activityContentType', contentType);
      component.loadActivityContentData(contentType);
    },

    onClickShowMoreActivity() {
      let component = this;
      component.loadActivityContentData(component.get('activityContentType'));
    },

    onResetPullUpData() {
      let component = this;
      component.resetActivityContentData();
    },
    onShowContentPreview(previewContent) {
      const component = this;
      component.set('previewContent', previewContent);
      if (previewContent.get('format') === 'offline-activity') {
        component.set('isShowOfflineActivityPreview', true);
      } else {
        component.set('isShowContentPreview', true);
      }
    }
  },
  loadActivityContentData(contentType) {
    let component = this;
    component.set('isLoading', true);
    let competencyCode = component.get('learningMapData.gutCode');
    let learningMapDataContents = component.get('learningMapData.contents');
    let contentStats = learningMapDataContents[CONTENT_TYPE_ENUM[contentType]];
    component.set('activityTotalHitCount', contentStats.stats.totalHitCount);
    let activityContents = component.get('activityContents');
    let activityContentType =
      contentType || component.get('activityContentType');
    let startAt = component.get('startAt');
    let length = component.get('length');
    let languageId = component.get('class.primaryLanguage');

    let filter = {
      'flt.gutCode': competencyCode
    };
    if (
      activityContentType === 'course' ||
      activityContentType === 'unit' ||
      activityContentType === 'lesson'
    ) {
      filter = {
        'flt.relatedGutCode': competencyCode
      };
    }
    if (languageId) {
      filter.languageId = languageId;
    }

    let params = {
      page: startAt / length,
      pageSize: length,
      filters: filter
    };
    component
      .loadingMoreLearnMapData(activityContentType, params)
      .then(loadMoreLearningMapData => {
        component.set(
          'activityContents',
          activityContents.concat(loadMoreLearningMapData)
        );
        component.set('isShowActivityPullup', true);
        component.set('offsetCount', component.get('startAt'));
        component.set('isLoading', false);
      });
    component.set('startAt', startAt + length);
    let contentKey;
    if (contentType === 'course') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_COURSE;
    } else if (contentType === 'unit') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_UNIT;
    } else if (contentType === 'lesson') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_LESSON;
    } else if (contentType === 'collection') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_COLLECTION;
    } else if (contentType === 'assessment') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_ASSESSMENT;
    } else if (contentType === 'resource') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_RESOURCE;
    } else if (contentType === 'question') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_QUESTION;
    } else if (contentType === 'rubric') {
      contentKey = PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_SEARCH_RUBRIC;
    }
    component.get('parseEventService').postParseEvent(contentKey);
  },

  loadingMoreLearnMapData(contentType, params) {
    let component = this;
    let competencyCode = component.get('competencyGutCode');
    params.contentType = contentType;
    params.competencyCode = competencyCode;
    let searchService = component.get('searchService');
    return searchService.searchLearningMapCourses('*', params);
  },

  /**
   * @function resetActivityContentData
   * Method to reset activity content data to default
   */
  resetActivityContentData() {
    let component = this;
    component.set('activityContents', Ember.A([]));
    component.set('startAt', 0);
    component.set('isShowActivityPullup', false);
    component.set('activityContentType', '');
    component.set('offsetCount', 0);
  }
});
