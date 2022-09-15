import Ember from 'ember';

/**
 * Library model
 */
const LibraryModel = Ember.Object.extend({
  /**
   * @property {String} id - Gooru id for the library
   */
  id: null,

  /**
   * @property {String} name - Name of the library
   */
  name: null,

  /**
   * @property {String} description - Description of the library
   */
  description: null,

  /**
   * @property {String} image - Library's image url
   */
  image: null,

  /**
   * @property {String} tenantId - Gooru id for the tenant
   */
  tenantId: null,

  /**
   * @property {String} tenantRoot - The tenant root
   */
  tenantRoot: null,

  /**
   * @property {String} shortName - The short name
   */
  shortName: null,

  /**
   * @property {Number} courseCount - Count of courses
   */
  courseCount: null,

  /**
   * @property {Number} assessmentCount - Count of assessments
   */
  assessmentCount: null,

  /**
   * @property {Number} collectionCount - Count of collections
   */
  collectionCount: null,

  /**
   * @property {Number} resourceCount - Count of resources
   */
  resourceCount: null,

  /**
   * @property {Number} questionCount - Count of questions
   */
  questionCount: null,

  /**
   * @property {Number} rubricCount - Count of rubrics
   */
  rubricCount: null,

  /**
   * @property {Number} sequence - sequence order among other libraries
   */
  sequence: 0
});

export default LibraryModel;
