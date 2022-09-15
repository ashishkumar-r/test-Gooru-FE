import Ember from 'ember';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['gru-content-resource-filter'],

  /**
   * @type {scopeAndSequenceService}
   */
  scopeAndSequenceService: Ember.inject.service('api-sdk/scope-sequence'),

  /**
   * @type {taxonomyService}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // ----------------------------------------------------------------------
  // Dependencies

  // ----------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} primaryClass has current class details
   */
  primaryClass: null,

  /**
   * @property {boolean} hasCourse help to identify class has course or not
   */
  hasCourse: Ember.computed('primaryClass', function() {
    return !!this.get('primaryClass.courseId');
  }),

  /**
   * @property {Array} contentResource help to hold the list of content sources for the class
   */
  contentResource: Ember.A([]),

  /**
   * @property {Array} selectedContentResource help to hold selected content resources
   */
  selectedContentResource: Ember.computed(
    'contentResource.@each.isActive',
    function() {
      let activeContentResource = this.get('contentResource').filterBy(
        'isActive',
        true
      );
      return activeContentResource;
    }
  ),

  selectedFilters: Ember.A(),

  /**
   * @property {Array} audienceList it has audience type
   */
  audienceList: Ember.A([
    Ember.Object.create({
      name: 'Teachers',
      label: 'Teachers'
    }),
    Ember.Object.create({
      name: 'All Students',
      label: 'Students'
    })
  ]),
  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.yes',
      value: true
    }),
    Ember.Object.create({
      label: 'common.no',
      value: false
    })
  ]),

  /**
   * @property {Array} selectedAudienceList
   */
  selectedAudienceList: Ember.computed.filterBy(
    'audienceList.@each.isActive',
    'isActive',
    true
  ),

  /**
   * @property {Object} additionalFilter
   */
  additionalFilter: Ember.computed(
    'selectedAudienceList.@each',
    'activeCompetencyList.@each',
    function() {
      let filterList = {
        filters: {}
      };
      let activeAudience = this.get('selectedAudienceList');
      let activeCompetencies = this.get('activeCompetencyList');
      filterList.filters['flt.audience'] = activeAudience.length
        ? activeAudience.mapBy('name').toString()
        : {};
      filterList.standard = activeCompetencies
        ? activeCompetencies.mapBy('id')
        : [];
      filterList.filters['flt.taxGrade'] = activeCompetencies.findBy(
        'filter',
        'flt.taxGrade'
      )
        ? activeCompetencies.findBy('filter', 'flt.taxGrade').name
        : null;
      filterList.filters['flt.fwCode'] = activeCompetencies.findBy(
        'filter',
        'flt.fwCode'
      )
        ? activeCompetencies.findBy('filter', 'flt.fwCode').id
        : null;
      filterList.filters['flt.subject'] = activeCompetencies.findBy(
        'filter',
        'flt.subject'
      )
        ? activeCompetencies.findBy('filter', 'flt.subject').id
        : null;
      filterList.filters['flt.domain'] = activeCompetencies.findBy(
        'filter',
        'flt.domain'
      )
        ? activeCompetencies.findBy('filter', 'flt.domain').id
        : null;
      return filterList;
    }
  ),

  /**
   * @property {boolean} isFilterApplied
   */
  isFilterApplied: Ember.computed(
    'selectedAudienceList.@each',
    'activeCompetencyList.@each',
    'contentResource.@each.isActive',
    function() {
      let activeAudience = this.get('selectedAudienceList');
      let activeCompetencies = this.get('activeCompetencyList');
      let contentResource = this.get('contentResource');
      let selectedContentResource = this.get('selectedContentResource');
      return (
        activeAudience.length > 0 ||
        activeCompetencies.length > 0 ||
        JSON.stringify(contentResource) !==
          JSON.stringify(selectedContentResource)
      );
    }
  ),

  isShowdiagnosticKey: Ember.computed(function() {
    return this.get('isEnableCaBaseline');
  }),

  /**
   * @property {Array} activeCompetencyList
   */
  activeCompetencyList: Ember.A([]),

  isShowFilter: false,

  removedFilterItem: null,

  // ------------------------------------------------------------------------
  // Hooks
  didInsertElement() {
    this.fetchContentSources().then(() => {
      let selectedContentResource = this.get('selectedContentResource');
      this.get('applyFilter')(
        selectedContentResource,
        this.get('isFilterApplied'),
        this.get('additionalFilter')
      );
    });
  },
  // -----------------------------------------------------------------------
  // Actions
  actions: {
    // Action trigger when select on checkbox
    onSelectResourceContent(selectedResource) {
      selectedResource.toggleProperty('isActive');
    },
    // Action trigger when click on any toggle
    onToggleBox(container) {
      this.set('isShowFilter', true);
      this.$(`.${container}`).slideToggle();
    },
    // Action trigger when click on filter
    applyFilters() {
      this.$('.dropdown-blk').slideUp();
      let selectedContentResource = this.get('selectedContentResource').length
        ? this.get('selectedContentResource')
        : this.get('contentResource');
      this.get('applyFilter')(
        selectedContentResource,
        this.get('isFilterApplied'),
        this.get('additionalFilter'),
        true,
        this.get('enableCaBaseline')
      );
    },
    // Action trigger when click on domain
    onSelectDomain(domain) {
      domain.set('isActive', !domain.get('isActive'));
      if (!domain.get('competenciesList')) {
        this.fetchCompetencies(domain);
      }
    },

    // Action trigger when click on competency from filter
    onSelectCompetency(competency) {
      let competencies = this.get('activeCompetencyList');
      competencies = competencies.filter(item => item.id !== competency.id);

      /**Remove subject**/
      if (competency.filter === 'flt.subject') {
        const removeItem = competencies.filter(
          item =>
            item.filter === 'flt.subject' ||
            item.filter === 'flt.fwCode' ||
            item.filter === 'flt.taxGrade' ||
            item.filter === 'flt.domain' ||
            item.filter === 'flt.standard'
        );
        competencies.removeObjects(removeItem);
        this.set('selectedSubject', null);
      }

      /**Remove grade**/
      if (competency.filter === 'flt.taxGrade') {
        const removeItem = competencies.filter(
          item =>
            item.filter === 'flt.fwCode' ||
            item.filter === 'flt.domain' ||
            item.filter === 'flt.standard'
        );
        competencies.removeObjects(removeItem);
      }

      /**Remove domain**/
      if (competency.filter === 'flt.domain') {
        const removeItem = competencies.filter(
          item => item.filter === 'flt.standard'
        );
        competencies.removeObjects(removeItem);
      }
      this.set('removedFilterItem', competency);
      this.set('activeCompetencyList', competencies);
    },

    onFilter() {
      let selectedFilters = this.get('selectedFilters');
      this.set('activeCompetencyList', selectedFilters);
      this.$('.domain-competency-blk').slideUp();
    },
    onEnableToggle(isChecked) {
      if (!isChecked) {
        this.set('enableCaBaseline', false);
      } else {
        this.set('enableCaBaseline', true);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  // Methods help to parse the path params
  parseDefaultSequenceFilter() {
    return {
      'course-map': {
        'flt.courseId': this.get('primaryClass.courseId'),
        'flt.publishStatus': 'published,unpublished'
      },
      'open-library': {
        scopeKey: 'open-library',
        'flt.publishStatus': 'published,unpublished',
        scopeTargetNames: ''
      },
      'tenant-library': {
        scopeKey: 'tenant-library',
        'flt.publishStatus': 'published,unpublished',
        scopeTargetNames: ''
      },
      'open-all': {
        scopeKey: 'open-all',
        'flt.publishStatus': 'published'
      },
      'my-content': {
        scopeKey: 'my-content',
        'flt.publishStatus': 'published,unpublished'
      }
    };
  },

  // Method help to fetch list of content source that are assigned for the class grade
  fetchContentSources() {
    const preference = this.get('primaryClass.preference');
    const subjectCode = preference ? preference.get('subject') : '';
    return this.get('scopeAndSequenceService')
      .fetchContentSources({ subjectId: subjectCode })
      .then(contentSource => {
        const buildSequence = Ember.A([]);
        contentSource.forEach(item => {
          if (!this.get('hasCourse') && item.key === 'course-map') {
            return;
          }
          item.filters = this.parseDefaultSequenceFilter()[item.key]
            ? Object.assign(this.parseDefaultSequenceFilter()[item.key])
            : {};
          if (item.key === 'open-library' || item.key === 'tenant-library') {
            item.filters.scopeTargetNames = item.short_name;
          }
          item.isActive = true;
          buildSequence.pushObject(Ember.Object.create(item));
        });
        this.set('contentResource', buildSequence.sortBy('seq_id'));
      });
  }
});
