import Ember from 'ember';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['filter', 'gru-gut-filter'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:taxonomy
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  competencyService: Ember.inject.service('api-sdk/competency'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadCategories().then(function(categories) {
      component.reloadGutFilters(categories);
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when selecting a category
    onSelectCategory(category) {
      const component = this;
      if (component.get('activeCategory.id') !== category.get('id')) {
        component.loadSubjects(category);
        component.set('activeCategory', category);
        component.updateGutFilters('category');
      }
    },

    //Action triggered when selecting a subject
    onSelectSubject(subject) {
      const component = this;
      if (component.get('activeSubject.id') !== subject.get('id')) {
        component.loadDomainCompetencies(subject);
        component.set('activeSubject', subject);
        component.updateGutFilters('subject', subject.get('code'));
      }
    },

    //Action triggered when selecting a domain
    onSelectDomain(domain) {
      const component = this;
      if (
        component.get('activeDomain.domainCode') !== domain.get('domainCode')
      ) {
        const domainCompetencies = component.get('domainCompetencies');
        const selectedDomainCompetencies = domainCompetencies.findBy(
          'domainCode',
          domain.domainCode
        );
        component.set(
          'competencies',
          selectedDomainCompetencies
            ? selectedDomainCompetencies.competencies
            : Ember.A([])
        );
        component.set('activeDomain', domain);
        component.updateGutFilters('domain', domain.get('domainCode'));
      }
    },

    //Action triggered when selecting a competency
    onSelectCompetency(competency) {
      const component = this;
      if (
        component.get('activeCompetency.competencyCode') !==
        competency.get('competencyCode')
      ) {
        component.set('activeCompetency', competency);
        component.updateGutFilters(
          'competency',
          competency.get('competencyCode')
        );
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} userId
   * Userid of active user
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Array} competencies
   * List of competencies aligned to selected domain
   */
  competencies: Ember.A([]),

  /**
   * @property {Object} activeCategory
   */
  activeCategory: null,

  /**
   * @property {Object} activeSubject
   */
  activeSubject: null,

  /**
   * @property {Object} activeDomain
   */
  activeDomain: null,

  /**
   * @property {Object} activeCompetency
   */
  activeCompetency: null,

  /**
   * @property {Object} gutFilters
   * Default filter object item
   */
  gutFilters: {
    subjectCode: undefined,
    domainCode: undefined,
    gutCode: undefined
  },

  /**
   * @property {Object} standardPreference
   * Student selected subject and framework preference
   */
  standardPreference: Ember.computed(function() {
    const component = this;
    return component.get('userPreference.standard_preference') || {};
  }),

  /**
   * @property {Boolean} isLoading
   */
  isLoading: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadCategories
   * @return {Array}
   * Method to load categories
   */
  loadCategories() {
    const component = this;
    return component
      .get('taxonomyService')
      .getCategories()
      .then(categories => {
        component.set('categories', categories);
        return categories;
      });
  },

  /**
   * @function loadCategories
   * @param {Object} category
   * @return {Array}
   * Method to load subjects aligned to given category
   */
  loadSubjects(category) {
    const component = this;
    const categoryId = category.get('id');
    component.set('isLoading', true);
    return component
      .get('taxonomyService')
      .getTaxonomySubjects(categoryId)
      .then(function(subjects) {
        if (!component.isDestroyed) {
          component.set('subjects', subjects);
          component.set('isLoading', false);
        }
        return subjects;
      });
  },

  /**
   * @function loadDomainCompetencies
   * @param {Object} activeSubject
   * Method to load domain competencies aligned to given subject
   */
  loadDomainCompetencies(activeSubject) {
    const component = this;
    const subject = activeSubject || component.get('activeSubject');
    const standardPreference = component.get('standardPreference');
    const frameworkId = standardPreference[subject.get('code')] || null;
    const taxonomyService = component.get('taxonomyService');
    const competencyService = component.get('competencyService');
    const userId = component.get('userId');
    const subjectId = subject.get('id');
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      domainCompetencies: competencyService.getCompetencyMatrixDomain(
        userId,
        subjectId
      ),
      matrixCoordinates: competencyService.getCompetencyMatrixCoordinates(
        subjectId
      ),
      crossWalkFWCompetencies: frameworkId
        ? taxonomyService.fetchCrossWalkFWC(frameworkId, subjectId)
        : Ember.RSVP.resolve(null)
    }).then(
      ({ domainCompetencies, matrixCoordinates, crossWalkFWCompetencies }) => {
        if (!component.isDestroyed) {
          component.set(
            'domains',
            matrixCoordinates.get('domains') || Ember.A([])
          );
          component.set(
            'domainCompetencies',
            domainCompetencies.domains || Ember.A([])
          );
          if (crossWalkFWCompetencies) {
            component.set(
              'fwCompetencies',
              flattenGutToFwCompetency(crossWalkFWCompetencies)
            );
            component.set(
              'fwDomains',
              flattenGutToFwDomain(crossWalkFWCompetencies)
            );
          }
          component.set('isLoading', false);
        }
        return domainCompetencies;
      }
    );
  },

  /**
   * @function updateGutFilters
   * @param {String} dataKey
   * @param {String} value
   * Method to update selected gut filters
   */
  updateGutFilters(dataKey, value) {
    const component = this;
    if (!component.isDestroyed) {
      let gutFilters = component.get('gutFilters') || {};
      if (dataKey === 'category') {
        gutFilters.subjectCode = undefined;
        gutFilters.domainCode = undefined;
        gutFilters.gutCode = undefined;
        component.setProperties({
          subjects: Ember.A([]),
          domains: Ember.A([]),
          competencies: Ember.A([])
        });
        component.setProperties({
          activeSubject: null,
          activeDomain: null,
          activeCompetency: null
        });
      } else if (dataKey === 'subject') {
        gutFilters.subjectCode = value;
        gutFilters.domainCode = undefined;
        gutFilters.gutCode = undefined;
        component.setProperties({
          domains: Ember.A([]),
          competencies: Ember.A([])
        });
        component.setProperties({
          activeDomain: null,
          activeCompetency: null
        });
      } else if (dataKey === 'domain') {
        gutFilters.domainCode = value;
        gutFilters.gutCode = undefined;
        component.setProperties({
          competencies: Ember.A([])
        });
        component.setProperties({
          activeCompetency: null
        });
      } else if (dataKey === 'competency') {
        gutFilters.gutCode = value;
      }
      component.set('gutFilters', gutFilters);
    }
  },

  /**
   * @function reloadGutFilters
   * @param {Array} categories
   * Method to reload gut filters based on selection
   */
  reloadGutFilters(categories) {
    const component = this;
    const appliedFilters = component.get('appliedFilters');
    const filterSubjectCode = appliedFilters.subjectCode;
    const filterDomainCode = appliedFilters.domainCode;
    const filterGutCode = appliedFilters.gutCode;
    if (filterSubjectCode) {
      const activeCategory = categories.findBy(
        'code',
        filterSubjectCode.split('.')[0]
      );
      component.set('activeCategory', activeCategory);
      component.loadSubjects(activeCategory).then(function(subjects) {
        const activeSubject = subjects.findBy('code', filterSubjectCode);
        component.set('activeSubject', activeSubject);
        if (filterDomainCode) {
          component
            .loadDomainCompetencies(activeSubject, filterDomainCode)
            .then(function(domainCompetencies) {
              const activeDomain = domainCompetencies.domains.findBy(
                'domainCode',
                filterDomainCode
              );
              component.set('activeDomain', activeDomain);
              component.set('competencies', activeDomain.get('competencies'));
              if (filterGutCode) {
                const activeCompetency = activeDomain
                  .get('competencies')
                  .findBy('competencyCode', filterGutCode);
                component.set('activeCompetency', activeCompetency);
                component.set(
                  'appliedFilters.gutCode',
                  activeCompetency.get('competencyCode')
                );
              }
            });
        }
      });
    }
  }
});
