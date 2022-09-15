import LearningBaseController from 'gooru-web/controllers/student-independent-learning/learning-base';

/**
 * Independent Learning Courses controller
 *
 * Controller responsible of the logic for the Independent Learning Courses page
 */
export default LearningBaseController.extend({
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {String} translation name to use in no results text
   */
  contentTypeTranslation: 'common.courses'
});
