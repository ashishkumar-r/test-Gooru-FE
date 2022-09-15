import Ember from 'ember';

/**
 * Standard Picker
 *
 * Component responsible for displaying three panels (course, domain and standards) for a tree
 * of browse items. Uses @see ../gru-taxonomy-picker
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:api-sdk/taxonomy
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['taxonomy', 'modals', 'gru-standard-picker'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    loadTaxonomyData(path) {
      return new Ember.RSVP.Promise(
        function(resolve) {
          var subject = this.get('model.subject');
          var taxonomyService = this.get('taxonomyService');

          if (path.length > 1) {
            let courseId = path[0];
            let domainId = path[1];
            taxonomyService
              .getCourseDomains(subject, courseId)
              .then(function() {
                taxonomyService
                  .getDomainCodes(subject, courseId, domainId)
                  .then(function(standards) {
                    resolve(standards);
                  });
              });
          } else {
            let courseId = path[0];
            taxonomyService
              .getCourseDomains(subject, courseId)
              .then(function(domains) {
                resolve(domains);
              });
          }
        }.bind(this)
      );
    },

    updateSelectedTags(selectedTags) {
      this.get('model.callback').success(selectedTags);
      this.triggerAction({ action: 'closeModal' });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    const standardLabel = this.get('model.standardLabel')
      ? 'common.standard'
      : 'common.competency';

    this.set('panelHeaders', [
      this.get('i18n').t('common.course').string,
      this.get('i18n').t('common.domain').string,
      this.get('i18n').t(standardLabel).string
    ]);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Object with necessary picker information:
   * - callback: {Object} Callback object made up of two properties: success and fail
   *             callback.success will be called on the 'updateSelectedTags' action.
   * - selected: {TaxonomyTagData[]} List of references to a set of taxonomy tag data
   * - subject: {TaxonomyRoot} Currently selected subject
   * @prop {Object}
   */
  model: null,

  /**
   * Headers to display at the top of each one of the panels (course, domain
   * and standards). There *must* be one for each panel.
   * @prop {String[]}
   */
  panelHeaders: [],

  /**
   * i18n key for the modal title label
   * @property {string}
   */
  titleLabelKey: Ember.computed('model.standardLabel', function() {
    const standardLabel = this.get('model.standardLabel');
    const fromSearch = this.get('model.fromSearch');
    var label = 'common.add-competency';

    if (standardLabel) {
      label = 'common.add-standards';
      if (fromSearch) {
        label = 'common.search-standards';
      }
    } else {
      if (fromSearch) {
        label = 'common.search-competency';
      }
    }
    return label;
  }),

  /**
   * i18n key for the browse selector text
   * @property {string}
   */
  browseSelectorText: Ember.computed('model.standardLabel', function() {
    const standardLabel = this.get('model.standardLabel');

    return standardLabel
      ? 'taxonomy.modals.gru-standard-picker.browseSelectorText'
      : 'taxonomy.modals.gru-standard-picker.browseCompetencySelectorText';
  }),

  /**
   * i18n key for the selected text key
   * @property {string}
   */
  selectedTextKey: Ember.computed('model.standardLabel', function() {
    const standardLabel = this.get('model.standardLabel');

    return standardLabel
      ? 'taxonomy.modals.gru-standard-picker.selectedText'
      : 'taxonomy.modals.gru-standard-picker.selectedCompetencyText';
  })
});
