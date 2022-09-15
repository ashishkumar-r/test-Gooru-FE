import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';

/**
 * Resource and Question card
 *
 * Component responsible of showing the resource or question information in cards, so that most useful information is summarized there.
 * @module
 */
export default Ember.Component.extend(ModalMixin, {
  // Dependencies

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'gru-resource-card'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered to edit the resource/question
     */
    editResource: function() {
      this.sendAction('onEditResource', this.get('resource'));
    },
    /**
     * Action triggered to play the resource/question
     */
    playResource: function() {
      this.sendAction('onPlayResource', this.get('resource'));
    },
    /**
     * Action triggered to remix the question
     */
    remixQuestion: function() {
      if (this.get('session.isAnonymous')) {
        this.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        this.sendAction('onRemixQuestion', this.get('resource'));
      }
    },

    selectSingleBox: function(content) {
      this.sendAction('selectSingleBox', content);
    },

    /**
     * Action triggered to add to collection
     */
    addToCollection: function() {
      const component = this;
      if (component.get('session.isAnonymous')) {
        component.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        let assessmentsPromise = Ember.RSVP.resolve(null);
        if (component.get('isQuestion')) {
          assessmentsPromise = component
            .get('profileService')
            .readAssessments(component.get('session.userId'));
        }
        assessmentsPromise
          .then(function(assessments) {
            return component
              .get('profileService')
              .readCollections(component.get('session.userId'))
              .then(function(collections) {
                return {
                  content: component.get('resource'),
                  collections,
                  assessments
                };
              });
          })
          .then(model =>
            component.send(
              'showModal',
              'content.modals.gru-add-to-collection',
              model,
              null,
              'add-to'
            )
          );
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Resource|Question} resource
   */
  resource: null,

  /**
   * Indicates if this resource is a question
   * @property {boolean}
   */
  isQuestion: Ember.computed.equal('resource.format', 'question'),

  /**
   * Indicates if the edit functionality is enabled
   * @property {boolean}
   */
  editEnabled: false,

  /**
   * Indicates if the add functionality is enabled
   * @property {boolean}
   */
  addEnabled: true,

  /**
   * Indicates if the remix functionality is enabled
   * @property {boolean}
   */
  remixEnabled: Ember.computed.not('editEnabled'),

  /**
   * @property {string} edit action
   */
  onEditResource: null,

  /**
   * @property {string} remix action
   */
  onRemixQuestion: null,

  /**
   * Indicates if the publish icon is visible
   * @property {boolean}
   */
  publishVisible: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('resource.standards.[]', function() {
    var standards = this.get('resource.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
    }
    return TaxonomyTag.getTaxonomyTags(standards);
  }),
  /**
   * Show the publisher if the resource has publisher and is publish
   * @property {boolean}
   */
  showPublisher: Ember.computed('resource', function() {
    return this.get('resource')
      ? this.get('resource').isPublished && this.get('resource').publisher
      : false;
  }),

  /**
   * Indicates if it allow profile navigation or not in the cards
   * @property {boolean} allowProfileNavigation
   */
  allowProfileNavigation: true,

  /**
   * Indicates if the student logged in and search for resources
   * @property {boolean} isStudentSearch
   */
  isStudentSearch: Ember.computed('profile.isStudent', function() {
    let isStudent = this.get('profile.isStudent');
    let isSearch = this.get('isSearch');
    if (isStudent && isSearch) {
      return true;
    }
    return false;
  }),

  /**
   * Indicates if the teacher logged in and search for resources
   * @property {boolean} isTeacherSearch
   */
  isTeacherSearch: Ember.computed('profile.isTeacher', function() {
    let isTeacher = this.get('profile.isTeacher');
    let isSearch = this.get('isSearch');
    if (isTeacher && isSearch) {
      return true;
    }
    return false;
  }),

  isH5PContent: Ember.computed('resource', function() {
    return this.get('resource.format') === 'h5p';
  })
});
