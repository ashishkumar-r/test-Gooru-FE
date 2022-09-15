import QuizzesReport from 'quizzes-addon/controllers/reports/context';
/**
 *
 * Controller for collection/assessment report
 *
 * Controls the gathering and merging of class performance data
 * for a collection/assessment
 *
 * @module
 * @augments ember/Route
 */
export default QuizzesReport.extend({
  queryParams: ['anonymous', 'source', 'collectionType', 'caContentId']
});
