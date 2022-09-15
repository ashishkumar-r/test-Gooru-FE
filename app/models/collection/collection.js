import Ember from 'ember';
import { ASSESSMENT_SHOW_VALUES } from 'gooru-web/config/config';

/**
 * @typedef {Object} Collection
 */

export default Ember.Object.extend({
  /**
   * @property {string}
   */
  id: null,

  /**
   * @property {string} Collection's type
   */
  collectionType: null,

  /**
   * @property {string} Collection's title
   */
  title: null,
  /**
   * @property {string} Collection's remixes
   */
  remixes: null,
  /**
   * @property {string} Collection's views
   */
  views: null,
  /**
   * @property {string} Collection's image url
   */
  imageUrl: null,
  /**
   * @property {string} Collection's url
   */
  url: null,
  /**
   * @property {string} Collection's author
   */
  author: null,
  /**
   * @property {string} Collection's author id
   */
  authorId: null,
  /**
   * @property {Array} List of Collection's Remixed by
   */
  remixedBy: Ember.A(),
  /**
   * @property {string} Collection's Course
   */
  course: null,

  /**
   * @property {string} Author's avatar
   */
  avatarUrl: null,
  /**
   * @property {string} Author's profile page url
   */
  profilePageUrl: null,
  /**
   * @property {string} Collection's description
   */
  description: null,
  /**
   * @property {number} Total of resources in the collection
   */
  resourceCount: null,
  /**
   * @property {number} Total of questions in the collection
   */
  questionCount: null,
  /**
   * @property {boolean} It says if collection's owner has a team
   */
  hasTeam: null,
  /**
   * @property {boolean} It says if collection's is visible or not
   */
  visibility: null,
  /**
   * @property {Array} List of libraries
   */
  libraries: Ember.A(),
  /**
   * @property {Array} List of resources associated to the collection
   */
  resources: Ember.A(),

  /**
   * @property {Array} List of standards associated to the collection
   */
  standards: Ember.A(),

  /**
   * @property {boolean} hasResources
   */
  hasResources: Ember.computed.bool('resources.length'),

  /**
   * @property {boolean} Returnn true is the collection is an assessment
   */
  isAssessment: Ember.computed.equal('collectionType', 'assessment'),

  /**
   * @property {boolean} Returns true is the collection type is collection
   */
  isCollection: Ember.computed.not('isAssessment'),

  isExternalAssessment: Ember.computed('isAssessment', function() {
    return (
      this.get('isAssessment') && this.get('format') === 'assessment-external'
    );
  }),

  isExternalCollection: Ember.computed('isCollection', function() {
    return (
      this.get('isCollection') && this.get('format') === 'collection-external'
    );
  }),

  /**
   * Number of attempts for an assessment
   * @property {integer}
   */
  attempts: -1,

  /**
   * Indicates if the number of attempts for an assessment is unlimited
   * @property {boolean}
   */
  hasUnlimitedAttempts: Ember.computed.equal('attempts', -1),

  /**
   * Is bidirectional navigation enabled for collection/assessment
   * @property {boolean}
   */
  bidirectional: true,

  /**
   * When should feedback be shown for a question in an assessment
   * @property {string}
   */
  showFeedback: null,

  immediateFeedback: Ember.computed('showFeedback', function() {
    return this.get('showFeedback') === ASSESSMENT_SHOW_VALUES.IMMEDIATE;
  }),

  /**
   * When should the answer key be shown for a question in an assessment
   * @property {string}
   */
  showKey: null,

  /**
   * Gets the next resource based on the resource provided
   * @param {Resource} resource
   * @returns {Resource|undefined} next resource
   */
  nextResource: function(resource) {
    var next;
    if (this.get('hasResources')) {
      const resources = this.get('resources'),
        index = resources.indexOf(resource);
      next = resources.objectAt(index + 1);
    }
    return next;
  },

  /**
   * Gets the previous resource based on the resource provided
   * @param {Resource} resource
   * @returns {Resource|undefined} previous resource
   */
  prevResource: function(resource) {
    var next;
    if (this.get('hasResources')) {
      const resources = this.get('resources'),
        index = resources.indexOf(resource);
      next = resources.objectAt(index - 1);
    }
    return next;
  },

  /**
   * Gets the resource by id
   * @param {string }resourceId
   * @returns {Resource|undefined}
   */
  getResourceById: function(resourceId) {
    var resource;
    if (this.get('hasResources')) {
      const resources = this.get('resources').filterBy('id', resourceId);
      if (resources.get('length')) {
        resource = resources.get('firstObject');
      }
    }
    return resource;
  },

  /**
   * Returns true if it's the last resource of the collection
   * @param {Resource}resource
   * @returns {Resource|undefined}
   */
  isLastResource: function(resource) {
    const resources = this.get('resources');
    var index = resources.indexOf(resource);
    var collectionLength = resources.get('length');
    return index + 1 === collectionLength;
  }
});
