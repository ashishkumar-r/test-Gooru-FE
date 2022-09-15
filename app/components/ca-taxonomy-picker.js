import Ember from 'ember';
import { getCategoryCodeFromSubjectId } from 'gooru-web/utils/taxonomy';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['ca-taxonomy-picker'],

  // -------------------------------------------------------------------------
  // Dependencies
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.set('isLoadTaxonomyPicker', false);
    component.loadData();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    updateSelectedTags(selectedTags, course, domain, isCloseBrowser) {
      const component = this;
      var dataTags = selectedTags.map(function(taxonomyTag) {
        return taxonomyTag.get('data');
      });
      const standards = Ember.A(dataTags);
      component.set('selectedCompetencies', standards);
      if (isCloseBrowser) {
        component.sendAction('onSubmitCompetencies', standards, course, domain);
      }
    },

    loadTaxonomyData(path) {
      return new Ember.RSVP.Promise(
        function(resolve) {
          var subject = this.get('taxonomyPickerData.subject');
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

    //Action triggered when close taxonomy picker
    onCloseTaxonomyPicker() {
      const component = this;
      component.sendAction('onCloseTaxonomyPicker');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String} subjectPreference
   */
  subjectPreference: Ember.computed.alias('classPreference.subject'),

  /**
   * @property {String} categoryPreference
   */
  categoryPreference: Ember.computed('classPreference.subject', function() {
    const component = this;
    let subjectPreference = component.get('classPreference.subject');
    return getCategoryCodeFromSubjectId(subjectPreference);
  }),

  /**
   * @property {String} frameworkPreference
   */
  frameworkPreference: Ember.computed.alias('classPreference.framework'),

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
   * @property {Boolean} isLoadTaxonomyPicker
   * property to show/hide taxonomy picker
   */
  isLoadTaxonomyPicker: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * Method to load initial data
   */
  loadData() {
    const component = this;
    let category = component.get('categoryPreference');
    component.getSubjects(category).then(function(subjects) {
      let subjectPreference = component.get('subjectPreference');
      let activeSubject = subjects.findBy('code', subjectPreference);
      if (activeSubject) {
        let frameworkId = component.get('frameworkPreference');
        let subjectId = `${frameworkId}.${subjectPreference}`;
        activeSubject.set('frameworkId', frameworkId);
        activeSubject.set('id', subjectId);
        component.set('activeSubject', activeSubject);
        component.getCourses(activeSubject).then(function() {
          component.loadTaxonomyPicker();
        });
      }
    });
  },

  /**
   * @function getSubjects
   * Method to get subjects
   */
  getSubjects(category) {
    const component = this;
    const taxonomyService = component.get('taxonomyService');
    return Ember.RSVP.hash({
      subjects: taxonomyService.getSubjects(category)
    }).then(({ subjects }) => {
      return subjects;
    });
  },

  /**
   * @function getCourses
   * Method to get courses
   */
  getCourses(subject) {
    const component = this;
    const taxonomyService = component.get('taxonomyService');
    return Ember.RSVP.hash({
      courses: Ember.RSVP.resolve(taxonomyService.getCourses(subject))
    }).then(({ courses }) => {
      return courses;
    });
  },

  /**
   * @function loadTaxonomyPicker
   * Method to load taxonomy picker
   */
  loadTaxonomyPicker() {
    const component = this;
    var standards = component.get('selectedCompetencies') || [];
    var subject = component.get('activeSubject');
    var taxonomyPickerData = {
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
    component.set('isLoadTaxonomyPicker', true);
  }
});
