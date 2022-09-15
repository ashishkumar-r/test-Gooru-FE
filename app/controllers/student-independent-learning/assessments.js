import LearningBaseController from 'gooru-web/controllers/student-independent-learning/learning-base';

/**
 * Independent Learning Assessments controller
 *
 * Controller responsible of the logic for the Independent Learning Assessments page
 */
export default LearningBaseController.extend({
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {String} translation name to use in no results text
   */
  contentTypeTranslation: 'common.assessments'
});
