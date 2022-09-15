import Ember from 'ember';
import {
  isCompatibleVW
} from 'gooru-web/utils/utils';
import {
  SCREEN_SIZES
} from 'gooru-web/config/config';
/**
 * Taxonomy subject picker component
 *
 * Component responsible for displaying subjects
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['taxonomy', 'gru-subject-picker'],

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Set Subject
     */
    setSubject(subject) {
      const component = this;
      component.set('selectedSubject', subject);
      if (component.get('onSubjectSelected')) {
        component.sendAction('onSubjectSelected', subject);
      }
    }
  },

  //
  // Methods

  didRender() {
    const component = this;
    if (component.get('isCompatiableMode')) {
      component.$('.trigger').click(function(e) {
        e.stopPropagation();
      });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Array} List of subjects
   */
  subjects: null,

  /**
   * @type {Array} List of subjects
   */
  subjectsWithStandards: Ember.computed('subjects', function() {
    return this.get('subjects').filter(function(subject) {
      return subject.get('hasStandards');
    });
  }),

  /**
   * @property {boolean}
   */
  onlySubjectsWithStandards: false,

  /**
   * the subject selected
   * @property {TaxonomyRoot}
   */
  selectedSubject: null,

  /**
   * when a subject is selected
   * @property {string}
   */
  onSubjectSelected: null,

  /**
   * @property {string}
   */
  placeholderLabelKey: 'taxonomy.gru-taxonomy-selector.choose-subject',

  /**
   * @property {string} dropdown alignment, right | left
   */
  alignment: null,

  /**
   * @property {Boolean} indicates if the control is disabled
   */
  disabled: false,

  /**
   * @property {Boolean} isCompatibleMode
   * Property to handle is mobile view
   */
  isCompatiableMode: isCompatibleVW(SCREEN_SIZES.MEDIUM)
});
