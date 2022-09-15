import Ember from 'ember';
import {
  FEEDBACK_USER_CATEGORY,
  CONTENT_TYPES,
  PLAYER_EVENT_MESSAGE
} from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';

export default Ember.Controller.extend({
  queryParams: [
    'collectionId',
    'isIframeMode',
    'role',
    'type',
    'score',
    'timespent',
    'isPreviewReferrer'
  ],

  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * @property {activityFeedbackService}
   */
  activityFeedbackService: Ember.inject.service('api-sdk/activity-feedback'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isAnonymous
   */
  isAnonymous: Ember.computed.alias('session.isAnonymous'),

  /**
   * @property {Boolean} isShowActivityFeedback
   * Property to evaluate whether the feedback tab should shown
   */
  isShowActivityFeedback: false,

  /**
   * @property {array[]} feedbackCategory
   * store feedback category list
   */
  feedbackCategory: null,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collection.standards.[]', function() {
    let standards = this.get('collection.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    closePlayer: function() {
      let controller = this;
      controller.set('isShowActivityFeedback', false);
      let isIframeMode = controller.get('isIframeMode');
      let isPreviewReferrer = controller.get('isPreviewReferrer');
      let contentType = controller.get('type');
      let collectionId = controller.get('collectionId');
      if (
        isPreviewReferrer &&
        (isPreviewReferrer === true || isPreviewReferrer === 'true')
      ) {
        controller.transitionToRoute(
          contentType === 'collection-external'
            ? 'content.external-collections.edit'
            : 'content.external-assessments.edit',
          collectionId,
          {
            queryParams: {
              isLibraryContent: true,
              isPreviewReferrer: false,
              editing: false
            }
          }
        );
      } else {
        if (isIframeMode) {
          window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
        }
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchActivityFeedbackCateory
   * Method to fetch learning activity feedback
   */

  fetchActivityFeedbackCateory() {
    const controller = this;
    let role = controller.get('session.role');
    let userCategoryId = FEEDBACK_USER_CATEGORY[`${role}`];
    controller
      .get('activityFeedbackService')
      .getFeedbackCategory(userCategoryId)
      .then(categoryLists => {
        controller.set('categoryLists', categoryLists);
        let isCollection = controller.get('collection.isCollection');
        let type = isCollection
          ? CONTENT_TYPES.COLLECTION
          : CONTENT_TYPES.ASSESSMENT;
        let contentCategory = categoryLists.get(`${type}s`);
        if (contentCategory && contentCategory.length) {
          controller.set('isShowActivityFeedback', true);
          controller.set(
            'feedbackCategory',
            contentCategory.sortBy('feedbackTypeId')
          );
          controller.set('format', type);
        } else {
          controller.set('isShowActivityFeedback', false);
          controller.set('feedbackCategory', null);
        }
      });
  }
});
