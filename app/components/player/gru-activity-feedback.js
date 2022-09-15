import Ember from 'ember';
import {
  ROLES,
  FEEDBACK_USER_CATEGORY,
  FEEDBACK_RATING_TYPE
} from 'gooru-web/config/config';

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
  // Attributes
  classNames: ['gru-activity-feedback'],

  classNameBindings: ['isStudyPlayer:study-player-feedback'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  /**
   * Observe the user feedback category
   */
  feedbackObserver: Ember.observer('isShowFeedback', function() {
    // this.$().slideToggle();
    this.toggleProperty('isShowBackdrop');
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * action trigger when click feedback tab for show/hide the feedback popup`
     */
    onToggleFeedbackContent: function() {
      const component = this;
      if (
        component.get('isFeedbackModified') &&
        !component.get('isStudyPlayer')
      ) {
        let learningFeedback = component.getFeedbackObject();
        component
          .get('activityFeedbackService')
          .submitUserFeedback(learningFeedback)
          .then(() => {
            // component.$().slideUp();
            component.set('isShowBackdrop', false);
            component.set('isFeedbackModified', false);
          });
      } else {
        // component.$().slideToggle();
        component.toggleProperty('isShowBackdrop');
      }
    },

    /**
     * action trigger when click backdrop`
     */
    onCloseFeedback: function() {
      const component = this;
      // component.$().slideToggle();
      component.toggleProperty('isShowBackdrop');
      component.sendAction('showFeedbackContainer');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicates when the back drop is shown
   * @property {boolean}
   */
  isShowBackdrop: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getFeedbackObject
   * Method to return feedback objective
   */

  getFeedbackObject() {
    const component = this;
    let userId = component.get('session.userId');
    let role = component.get('session.role')
      ? component.get('session.role')
      : ROLES.STUDENT;
    let userCategoryId = FEEDBACK_USER_CATEGORY[`${role}`];
    let userFeedback = Ember.A([]);
    let categoryLists = component.get('categoryLists');
    let collection = component.get('feedbackContent');
    categoryLists.map(category => {
      let feedbackObj = {
        feeback_category_id: category.categoryId
      };
      if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUANTITATIVE) {
        feedbackObj.user_feedback_quantitative = category.rating;
      } else if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.BOTH) {
        feedbackObj.user_feedback_qualitative = category.comments;
      } else if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUALITATIVE) {
        feedbackObj.user_feedback_qualitative = category.quality;
      }
      userFeedback.pushObject(feedbackObj);
    });
    let userFeedbackObj = {
      content_id: collection.get('id'),
      content_type: component.get('format'),
      user_category_id: userCategoryId,
      user_feedbacks: userFeedback,
      user_id: userId
    };
    return userFeedbackObj;
  }
});
