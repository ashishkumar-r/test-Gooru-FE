import Ember from 'ember';
import { FEEDBACK_USER_CATEGORY, ROLES } from 'gooru-web/config/config';
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {activityFeedbackService}
   */
  activityFeedbackService: Ember.inject.service('api-sdk/activity-feedback'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchActivityFeedbackCateory
   * Method to fetch learning activity feedback
   */

  fetchActivityFeedbackCateory() {
    const component = this;
    let role = component.get('session.role')
      ? component.get('session.role')
      : ROLES.STUDENT;
    let userCategoryId = FEEDBACK_USER_CATEGORY[`${role}`];
    return component
      .get('activityFeedbackService')
      .getFeedbackCategory(userCategoryId)
      .then(categoryLists => {
        component.set('categoryLists', categoryLists);
      });
  }
});
