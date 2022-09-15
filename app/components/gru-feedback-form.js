import Ember from 'ember';
import { FEEDBACK_RATING_TYPE } from 'gooru-web/config/config';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Service

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {activityFeedbackService}
   */
  activityFeedbackService: Ember.inject.service('api-sdk/activity-feedback'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    const component = this;
    component.fetchLearningActivityFeedback();
  },

  /**
   * Observe the resource change
   */
  feedbackContentObserver: Ember.observer('feedbackContent', function() {
    const component = this;
    component.fetchLearningActivityFeedback();
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    updateFeedback: function() {
      if (!this.get('isStudyPlayer')) {
        this.set('isFeedbackModified', true);
      }
    },
    onToggleCategoryDetails(category, index) {
      $(
        `.feedback-container .feedback-body-panel .category-panel .category-info.category-${index}`
      ).slideToggle();
      category.set('isExpanded', !category.get('isExpanded'));
    },

    selectCategoryLevel(category, ratingIndex) {
      let score =
        (ratingIndex + 1) * Math.floor(100 / category.maxScale.length);
      category.set('rating', ratingIndex + 1);
      category.set('scoreInPrecentage', score);
      this.send('updateFeedback');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * content id
   * @property {Number}
   */
  contentId: Ember.computed.alias('feedbackContent.id'),

  /**
   * @property {Boolean}
   */
  isFeedbackModified: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchLearningActivityFeedback
   * Method to fetch learning activity feedback
   */

  fetchLearningActivityFeedback() {
    const component = this;
    let userId = component.get('session.userId');
    let contentId = component.get('contentId');
    let listOfCategory = getObjectsDeepCopy(
      component.get('feedbackCategoryLists')
    );
    Ember.RSVP.hash({
      categoryLists: listOfCategory,
      activityFeedback: component
        .get('activityFeedbackService')
        .fetchActivityFeedback(contentId, userId)
    }).then(function(hash) {
      if (hash.activityFeedback.length) {
        hash.activityFeedback.map(feedback => {
          let category = hash.categoryLists.findBy(
            'categoryId',
            feedback.categoryId
          );
          if (category) {
            if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUANTITATIVE) {
              category.set('rating', feedback.rating);
            } else if (
              category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUALITATIVE
            ) {
              category.set('quality', feedback.qualitative);
            } else {
              category.set('comments', feedback.qualitative);
            }
          }
        });
      }
      hash.categoryLists.map(category => {
        let score = category.rating * Math.floor(100 / category.maxScale);
        category.set('scoreInPrecentage', score);
        category.set('isExpanded', true);
      });
      component.set('categoryLists', hash.categoryLists);
    });
  }
});
