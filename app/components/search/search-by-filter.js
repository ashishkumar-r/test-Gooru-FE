import Ember from 'ember';
import { getCategoryCodeFromSubjectId } from 'gooru-web/utils/taxonomy';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import { SCREEN_SIZES, TEACHER, STUDENTS } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  classNames: ['search-by-filter'],

  classNameBindings: ['isShow:active'],
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service(),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} LookupService service
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Service} Taxonomy service
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean}
   * Property to handle to show the component
   */
  isShow: false,

  /**
   * @property {Boolean}
   * Property to handle to show the component
   */
  hideAppScroll: false,

  /**
   * @property {Array}
   * Property to store resourceTypes
   */
  resourceTypes: Ember.A([]),

  /**
   * @property {Array}
   * Property to hold selected subject courses
   */
  selectedCourse: null,

  /**
   * @property {boolean}
   * Property help to hide the other filter
   */
  isClassActivity: false,

  /**
   * @property {Observer}
   * Observer to load taxonomy picker whenever subject changes
   */
  onSubjectSelected: Ember.observer('selectedSubject.courses.[]', function() {
    let component = this;
    component.set('selectedCourse', component.get('selectedSubject.courses'));
    component.loadTaxonomyPicker();
  }),

  /**
   * @property {Boolean} isCompatibleMode
   * Property to handle is mobile view
   */
  isCompatiableMode: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * i18n key for the browse selector text
   * @property {string}
   */
  browseSelectorText: Ember.computed(
    'taxonomyPickerData.standardLabel',
    function() {
      const standardLabel = this.get('taxonomyPickerData.standardLabel');
      return standardLabel
        ? 'taxonomy.modals.gru-standard-picker.browseSelectorText'
        : 'taxonomy.modals.gru-standard-picker.browseCompetencySelectorText';
    }
  ),

  /**
   * i18n key for the selected text key
   * @property {string}
   */
  selectedTextKey: Ember.computed(
    'taxonomyPickerData.standardLabel',
    function() {
      const standardLabel = this.get('taxonomyPickerData.standardLabel');
      return standardLabel
        ? 'taxonomy.modals.gru-standard-picker.selectedText'
        : 'taxonomy.modals.gru-standard-picker.selectedCompetencyText';
    }
  ),

  /**
   * @property {Array} domain
   * Property to hold selected domain
   */
  domain: null,

  /**
   * @property {Array} domian
   * Property to hold selected course
   */
  course: null,

  /**
   * @type {String} the selected category
   */
  selectedCategory: Ember.computed('preference', function() {
    let subjectId = this.get('preference.subject');
    return subjectId ? getCategoryCodeFromSubjectId(subjectId) : null;
  }),

  init() {
    let component = this;
    component._super(...arguments);
    component.fetchAudiences();
    component.fetchLanguages();
    component.fetchEducationalUse();
    component.loadResourceTypes();
    component.loadFilters();
    component.loadSubjects();
  },

  actions: {
    applyFilter() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_APPLY_FILTER);
      component.toggleProperty('isShow');
      component.sendAction('onFilterApply', false);
    },

    selectSubject(subject) {
      let component = this;
      component.set('selectedSubject.courses', Ember.A([]));
      component.set('selectedSubject', subject);
      let selectedFilters = component.get('selectedFilters');
      selectedFilters.removeObjects(
        selectedFilters.filterBy('filter', 'flt.subject')
      );
      selectedFilters.pushObject({
        filter: 'flt.subject',
        id: subject.id,
        name: subject.subjectTitle
      });
      selectedFilters.removeObjects(
        selectedFilters.filterBy('filter', 'flt.standard')
      ); //remove previous object
      component.set('taxonomyPickerData.selected', Ember.A([]));
      component.set('course', null);
      component.set('domain', null);
    },

    selectCategory(category) {
      let component = this;
      let selectedFilters = component.get('selectedFilters');
      if (category === component.get('selectedCategory')) {
        component.set('selectedCategory', null);
        selectedFilters.removeObjects(
          selectedFilters.filterBy('filter', 'flt.taxGrade')
        );
        selectedFilters.removeObjects(
          selectedFilters.filterBy('filter', 'flt.fwCode')
        );
        selectedFilters.removeObjects(
          selectedFilters.filterBy('filter', 'flt.subject')
        );
      } else {
        component.set('selectedCategory', category);
      }
      component.set('course', null);
      component.set('domain', null);
      component.set('selectedSubject', null);
    },

    setAuthor() {
      let component = this;
      let term = this.get('authorName').trim();
      let filterItems = component.get('selectedFilters');
      filterItems['flt.authorName'] = term;
    },

    updateSelectedTags(selectedTags) {
      const component = this;
      component.set('taxonomyPickerData.selected', selectedTags);
      let selectedFilters = component.get('selectedFilters');
      selectedFilters.removeObjects(
        selectedFilters.filterBy('filter', 'flt.standard')
      ); //remove previous object
      selectedTags.map(standard => {
        standard.set('filter', 'flt.standard');
        standard.set('name', standard.get('data.code'));
        standard.set('id', standard.get('data.id'));
        component.get('selectedFilters').pushObject(standard);
      });
    },

    /**
     * @function loadTaxonomyData
     * Method to load taxonomy data
     */
    loadTaxonomyData(path) {
      return new Ember.RSVP.Promise(
        function(resolve) {
          const subject = this.get('taxonomyPickerData.subject');
          const taxonomyService = this.get('taxonomyService');

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

    /**
     * @function onSelectItem
     * Method to handle selected item
     */
    onSelectItem(item) {
      const component = this;
      component.onSelectFilter(item);
    },
    selectedGrade(item) {
      const component = this;
      let filterItems = component.get('selectedFilters');
      const selectGradeFilter = [];
      if (item.level === 2) {
        filterItems.removeObjects(filterItems.filterBy('filter', 'flt.domain'));
        selectGradeFilter.push({
          filter: 'flt.domain',
          id: item.code,
          name: item.title
        });
      } else {
        filterItems.removeObjects(
          filterItems.filterBy('filter', 'flt.taxGrade')
        );
        filterItems.removeObjects(filterItems.filterBy('filter', 'flt.fwCode'));

        selectGradeFilter.push(
          {
            filter: 'flt.fwCode',
            id: component.get('selectedSubject').frameworkId,
            name: component.get('selectedSubject').title
          },
          {
            filter: 'flt.taxGrade',
            name: item.title,
            id: item.id
          }
        );
      }
      selectGradeFilter.forEach(filter => {
        filterItems.pushObject(filter);
      });
    },
    listToggleItem(parentClass, currentClass) {
      if ($(`.${parentClass} .${currentClass}`).hasClass('in')) {
        $(`.${parentClass} .${currentClass}`).removeClass('in');
      } else {
        $(`.${parentClass} .${currentClass}`).addClass('in');
        $(`.${parentClass} .${currentClass}`).css('height', 'auto');
      }
    }
  },

  onSelectFilter(item) {
    const component = this;
    let selectedFilters = component.get('selectedFilters');
    let selectedName = item.get('name');
    let selectedFilter = selectedFilters.findBy('name', selectedName);
    if (
      selectedFilter &&
      selectedName !== TEACHER &&
      selectedName !== STUDENTS
    ) {
      selectedFilters.removeObject(selectedFilter);
    } else {
      if (selectedName !== TEACHER && selectedName !== STUDENTS) {
        selectedFilters.pushObject(item);
      }
    }
    const isTeacher = component.get('isTeacher');
    const teacherExist = selectedFilters.findBy('name', TEACHER);
    const studentExist = selectedFilters.findBy('name', STUDENTS);
    if (isTeacher && !teacherExist && !studentExist) {
      const defaultFilter = [
        {
          filter: 'flt.audience',
          name: TEACHER
        },
        {
          filter: 'flt.audience',
          name: STUDENTS
        }
      ];
      defaultFilter.forEach(filter => {
        selectedFilters.pushObject(filter);
      });

      let selectedFilter = selectedFilters.findBy('name', item.get('name'));
      if (selectedFilter) {
        selectedFilters.removeObject(selectedFilter);
      } else {
        selectedFilters.pushObject(item);
      }
      component.set('selectedFilters', selectedFilters);
    }
  },

  /**
   * @function fetchAudiences
   * Method to fetch audiences
   */
  fetchAudiences() {
    const component = this;
    const lookupService = component.get('lookupService');
    lookupService.readAudiences().then(audiences => {
      let serializeData = audiences.map(audience => {
        return Ember.Object.create({
          name: audience.get('name'),
          filter: 'flt.audience'
        });
      });
      if (!component.isDestroyed) {
        component.set('audiences', Ember.A(serializeData));
      }
    });
  },

  /**
   * @function fetchEducationalUse
   * Method to fetch educational uses
   */
  fetchEducationalUse() {
    const component = this;
    const lookupService = component.get('lookupService');
    lookupService.getEducationalUse().then(educationalUses => {
      let serializeData = educationalUses.map(educationalUse => {
        return Ember.Object.create({
          name: educationalUse.get('label'),
          filter: 'flt.educational'
        });
      });
      if (!component.isDestroyed) {
        component.set('educationalUses', Ember.A(serializeData));
      }
    });
  },

  /**
   * Loads subjects by category
   */
  loadSubjects() {
    const component = this;
    component
      .get('taxonomyService')
      .getSubjects(component.get('selectedCategory'))
      .then(function(subjects) {
        if (subjects) {
          let preference = component.get('preference');
          if (preference) {
            let preferedSubjects = subjects.findBy(
              'code',
              preference.get('subject')
            );
            let subject = preferedSubjects
              .get('frameworks')
              .findBy('frameworkId', preference.get('framework'));
            if (!component.isDestroyed) {
              component.set('selectedSubject', subject);
            }
          }
        }
      });
  },

  /**
   * @function fetchAudiences
   * Method to fetch audiences
   */
  fetchLanguages() {
    const component = this;
    const lookupService = component.get('lookupService');
    lookupService.getLanguages().then(languages => {
      let serializeData = languages.map(language => {
        return Ember.Object.create({
          name: language.get('name'),
          filter: 'flt.language'
        });
      });
      if (!component.isDestroyed) {
        component.set('languages', Ember.A(serializeData));
      }
    });
  },

  loadResourceTypes() {
    const component = this;
    component.set('resourceTypes', component.getResourceTypes());
  },

  getResourceTypes() {
    const component = this;
    return Ember.A([
      Ember.Object.create({
        name: component.get('i18n').t('resource.video').string,
        type: 'flt.resources'
      }),
      Ember.Object.create({
        name: component.get('i18n').t('resource.webpage').string,
        type: 'flt.resources'
      }),
      Ember.Object.create({
        name: component.get('i18n').t('resource.webpage').string,
        type: 'flt.resources'
      }),
      Ember.Object.create({
        name: component.get('i18n').t('resource.interactive').string,
        type: 'flt.resources'
      }),
      Ember.Object.create({
        name: component.get('i18n').t('resource.image').string,
        type: 'flt.resources'
      }),
      Ember.Object.create({
        name: component.get('i18n').t('resource.text').string,
        type: 'flt.resources'
      }),
      Ember.Object.create({
        name: component.get('i18n').t('resource.audio').string,
        type: 'flt.resources'
      })
    ]);
  },

  /**
   * @function loadTaxonomyPicker
   * Method to load taxonomy picker
   */
  loadTaxonomyPicker() {
    const component = this;
    let standards = component.get('taxonomyPickerData.selected') || [];
    let subject = component.get('selectedSubject');
    let taxonomyPickerData = {
      selected: standards,
      shortcuts: null,
      subject,
      standardLabel: true
    };
    component.set('taxonomyPickerData', taxonomyPickerData);
    const standardLabel = this.get('taxonomyPickerData.standardLabel')
      ? 'common.standard'
      : 'common.competency';

    component.set('panelHeaders', [
      component.get('i18n').t('common.course').string,
      component.get('i18n').t('common.domain').string,
      component.get('i18n').t(standardLabel).string
    ]);
  },

  loadFilters() {
    const component = this;
    component.set('filters', component.getFilters());
  },

  getFilters() {
    const component = this;
    return Ember.A([
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.courses').string,
        type: 'courses'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.collections').string,
        type: 'collections'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.assessments').string,
        type: 'assessments'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.resources').string,
        type: 'resources'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.rubrics').string,
        type: 'rubrics'
      })
    ]);
  }
});
