import { CONTENT_TYPES } from 'gooru-web/config/config';
import LearningBaseRoute from 'gooru-web/routes/student-independent-learning/learning-base';

export default LearningBaseRoute.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * @property {String} the content type
   */
  contentType: CONTENT_TYPES.COURSE,

  /**
   * @property {String} the menu item name
   */
  item: 'courses'

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Methods
});
