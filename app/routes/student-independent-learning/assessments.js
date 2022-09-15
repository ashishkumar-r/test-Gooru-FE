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
  contentType: CONTENT_TYPES.ASSESSMENT,

  /**
   * @property {String} the menu item name
   */
  item: 'assessments'

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Methods
});
