import Ember from 'ember';

/**
 * Library Content model
 */
const LibraryContentModel = Ember.Object.extend({
  /**
   * @property {Library} library
   */
  library: null,

  /**
   * @property {courses: [], collections: [], assessments: [], resources: [], questions: [], rubrics: []} - libraryContent
   */
  libraryContent: null
});

export default LibraryContentModel;
