import Ember from 'ember';
import { DEFAULT_K12_SUBJECT } from 'gooru-web/config/config';

import { getSubjectIdFromSubjectBucket } from 'gooru-web/utils/utils';
import { getCategoryCodeFromSubjectId } from 'gooru-web/utils/taxonomy';

export default Ember.Component.extend({
  classNames: ['learner-proficiency-pull-up'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * Competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    component.loadData();
    Ember.$('body').css('overflow', 'hidden');
  },

  willDestroyElement() {
    Ember.$('body').css('overflow', 'auto');
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when select a month from chart
     */
    onSelectMonth(date) {
      let timeLine = {
        month: date.getMonth() + 1,
        year: date.getFullYear()
      };
      this.set('timeLine', timeLine);
    },

    /**
     * Action triggered when select a subject
     */
    onSelectSubject(subject) {
      let component = this;
      component.set('activeSubject', subject);
    },

    /**
     * Action triggered at once the baseline is drawn
     */
    onShownBaseLine(createdDate) {
      let component = this;
      component.set(
        'timeSeriesStartDate',
        createdDate ? new Date(createdDate) : component.get('courseStartDate')
      );
      component.set('isShowTimeSeries', true);
    },

    /**
     * Action triggered when select a competency
     */
    onSelectCompetency(competency, domainCompetencyList) {
      let component = this;
      let userId = component.get('student.id');
      component.sendAction(
        'onSelectCompetency',
        competency,
        userId,
        domainCompetencyList
      );
    },

    isShowLoaderSet(value) {
      this.set('isShowLoader', value);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * This method will load the initial set  of data
   */
  loadData() {
    let component = this;
    component.fetchCategories().then(() => {
      let categories = component.get('categories');
      let categoryCode = component.get('categoryCode');
      let selectedCategory = categories.findBy('code', categoryCode);
      if (selectedCategory) {
        component.set('selectedCategory', selectedCategory);
        component.fetchSubjectsByCategory(selectedCategory);
      }
    });
  },

  /**
   * @function fetchCategories
   * Method  fetch list of taxonomy categories
   */
  fetchCategories() {
    let component = this;
    return new Ember.RSVP.Promise(reslove => {
      component
        .get('taxonomyService')
        .getCategories()
        .then(categories => {
          let category = categories.objectAt(0);
          component.set('selectedCategory', category);
          component.set('categories', categories);
          reslove();
        });
    });
  },

  /**
   * @function fetchSubjectsByCategory
   * @param subjectCategory
   * Method to fetch list of subjects using given category level
   */
  fetchSubjectsByCategory(category) {
    let component = this;
    component
      .get('taxonomyService')
      .getTaxonomySubjects(category.get('id'))
      .then(subjects => {
        let subject = component.getActiveSubject(subjects);
        component.set('taxonomySubjects', subjects);
        component.set('activeSubject', subject);
      });
  },

  /**
   * @function getActiveSubject
   * Method to get active subject by using subject bucket
   */
  getActiveSubject(subjects) {
    let component = this;
    let defaultSubject = subjects.findBy('id', DEFAULT_K12_SUBJECT);
    let activeSubject = defaultSubject ? defaultSubject : subjects.objectAt(0);
    let subjectBucket = component.get('subjectBucket');
    subjects.map(subject => {
      if (subjectBucket) {
        if (subjectBucket && subjectBucket.split(subject.id).length > 1) {
          activeSubject = subject;
        }
      }
    });
    return activeSubject;
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {JSON}
   * Property to store currently selected month and year
   */
  timeLine: Ember.computed(function() {
    let curDate = new Date();
    return {
      month: curDate.getMonth() + 1,
      year: curDate.getFullYear()
    };
  }),

  /**
   * @property {Array}
   * Property to store list of taxonomy subjects
   */
  taxonomySubjects: Ember.A([]),

  /**
   * @property {JSON}
   * Property to store active category
   */
  selectedCategory: null,

  /**
   * @property {Object}
   * Property to store active subject
   */
  activeSubject: null,

  /**
   * @property {String}
   * Property to store currently selected student's full name
   */
  studentFullName: Ember.computed('student', function() {
    let component = this;
    let firstName = component.get('student.firstName') || '';
    let lastName = component.get('student.lastName') || '';
    return `${lastName}, ${firstName}`;
  }),

  /**
   * @property {Date}
   * Property to store course started date or one year before date
   */
  courseStartDate: Ember.computed('course', function() {
    let component = this;
    let course = component.get('course');
    let courseCreatedDate = new Date();
    if (course && course.createdDate) {
      courseCreatedDate = new Date(course.createdDate);
    } else {
      let curMonth = courseCreatedDate.getMonth();
      let curYear = courseCreatedDate.getFullYear();
      let oneYearBeforeFromCurrentDate = courseCreatedDate;
      courseCreatedDate = new Date(
        oneYearBeforeFromCurrentDate.setMonth(curMonth - 11)
      );
      courseCreatedDate = new Date(
        oneYearBeforeFromCurrentDate.setFullYear(curYear - 1)
      );
    }
    return courseCreatedDate;
  }),

  /**
   * @property {Boolean} isShowMatrixChart
   */
  isShowMatrixChart: Ember.computed('taxonomySubjects', function() {
    let component = this;
    let course = component.get('course');
    let isShowMatrixChart = false;
    if (course.get('id')) {
      let taxonomySubjects = component.get('taxonomySubjects');
      let subjectBucket = component.get('subjectBucket');
      let subjectCode = subjectBucket
        ? getSubjectIdFromSubjectBucket(subjectBucket)
        : null;
      let isSupportedTaxonomySubject = taxonomySubjects.findBy(
        'code',
        subjectCode
      );
      let aggregatedTaxonomy = course.get('aggregatedTaxonomy');
      isShowMatrixChart = !!(aggregatedTaxonomy && isSupportedTaxonomySubject);
    }
    return isShowMatrixChart;
  }),

  /**
   * @property {Boolean} isShowTimeSeries
   */
  isShowTimeSeries: false,

  /**
   * @property {Date} timeSeriesStartDate
   */
  timeSeriesStartDate: Ember.computed('class', function() {
    return this.get('class.startDate');
  }),

  /**
   * Parse  category from subject id
   */
  categoryCode: Ember.computed('course', function() {
    let course = this.get('course');
    let subject = this.get('subjectBucket');
    if (course && course.get('id') && subject) {
      return getCategoryCodeFromSubjectId(subject);
    }
  })
});
