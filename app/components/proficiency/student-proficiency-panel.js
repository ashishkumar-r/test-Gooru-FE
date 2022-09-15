import Ember from 'ember';
import { SCREEN_SIZES } from 'gooru-web/config/config';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  classNames: ['student-proficiency-panel'],

  // -------------------------------------------------------------------------
  // Dependencies
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Object}
   * Property to store active subject selected
   */
  activeSubject: null,

  /**
   * @property {Object}
   * Property to store timeLine
   */
  timeLine: null,

  /**
   * @property {Object}
   * Property to store class data
   */
  class: null,

  /**
   * @property {Object}
   * Property to store selected grade
   */
  selectedGrade: null,

  /**
   * @property {Boolean}
   * Property to find is student or not
   */
  isStudent: null,

  /**
   * @property {Array}
   * Property to store taxonomy categories
   */
  categories: null,
  /**
   * @property {Boolean}
   * Property to show matrix chart or not
   */
  isShowMatrixChart: null,

  /**
   * @property {Boolean}
   * Property to store given screen value is compatible
   */
  isMobile: isCompatibleVW(SCREEN_SIZES.SMALL - 1),

  /**
   * @property {Array}
   * Property to store competency domains
   */
  competencyMatrixDomains: null,

  /**
   * @property {Object}
   * Property to store user proficiency baseline data
   */
  userProficiencyBaseLine: null,

  /**
   * @property {Array}
   * Property to store taxonomy subjects
   */
  taxonomySubjects: null,

  /**
   * @property {Array}
   * Property to store competency coordinates
   */
  competencyMatrixCoordinates: null,

  /**
   * @property {Object}
   * Property to store tagged subject bucket
   */
  subjectBucket: null,

  /**
   * @property {Array}
   * Property to identify baseline is selected or not
   */
  isSelectBaseLine: null,

  isLegendPullup: false,

  /**
   * @property {Boolean} isShowTimeSeries
   */
  isShowTimeSeries: true,

  /**
   * @property {Date} timeSeriesEndDate
   */
  timeSeriesEndDate: moment().toDate(),

  /**
   * @property {Date} timeSeriesStartDate
   */
  timeSeriesStartDate: Ember.computed('class', function() {
    return moment(this.get('class.startDate')).format('YYYY-MM-DD');
  }),
  /**
   * @property {Object} studentDestination
   */
  studentDestination: Ember.computed('class', function() {
    let memberbounds = this.get('class.memberGradeBounds');
    let userId = this.get('studentProfile.id');
    let activeStudentGrade =
      memberbounds && memberbounds.find(item => item[userId]);
    return activeStudentGrade ? activeStudentGrade[userId] : null;
  }),

  selectedCategory: null,

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

  proficiencyChartData: Ember.A([]),

  totalTopics: Ember.computed('proficiencyChartData', function() {
    return this.get('proficiencyChartData.length');
  }),

  getTenantFW: Ember.observer('activeSubject', function() {
    let tenantSetting = this.get('tenantSettingsObj');
    if (
      tenantSetting &&
      tenantSetting.tx_fw_prefs &&
      this.get('isPublic') &&
      this.get('isEnableNavigatorPrograms')
    ) {
      let activeSubject = this.get('activeSubject');
      let isFound = tenantSetting.tx_fw_prefs[activeSubject.id];
      let tenantFW = isFound ? isFound.default_fw_id : null;
      this.set('tenantFW', tenantFW);
    }
  }),

  disableHeader: false,

  actions: {
    onSelectCategory(category) {
      let component = this;
      component.sendAction('onSelectCategory', category);
    },
    /**
     * Action triggered when select a month from chart
     */
    onSelectMonth(date) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_SELECT_MONTH
      );
      this.sendAction('onSelectMonth', date);
    },

    onToggleBaseline() {
      let component = this;
      component.toggleProperty('isSelectBaseLine');
    },

    goBack() {
      let component = this;
      let isStudent = component.get('isStudent');
      let classId = component.get('class.id');
      let courseId = component.get('course.id');
      if (isStudent) {
        component.get('router').transitionTo('student-locate', {
          queryParams: {
            classId: classId,
            courseId: courseId
          }
        });
      } else {
        component.sendAction('onChangeToBack');
      }
    },
    goBackDashboard() {
      let component = this;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.BACK_COMPETENCY_GAIN_TO_DASHBOARD
      );
      component.get('router').transitionTo('student.class.dashboard');
    },

    /**
     * Action triggered at once the baseline is drawn
     */
    onShownBaseLine() {
      let component = this;
      component.set('isShowTimeSeries', true);
    },
    /**
     * Action triggered when select a subject
     */
    onSelectSubject(subject) {
      let component = this;
      component.set('isSelectBaseLine', false);
      component.set('activeSubject', subject);
      component.sendAction('onSubjectChange', subject);
    },

    /**
     * Action triggered when select a competency
     */
    onSelectCompetency(competency, domainCompetencyList) {
      let component = this;
      component.sendAction(
        'onSelectCompetency',
        competency,
        domainCompetencyList
      );
    },
    showPullup() {
      this.set('isLegendPullup', true);
    },
    /**
     * Action triggered when select a domain
     */
    onDomainSelect(domain, isNotSet) {
      let component = this;
      component.sendAction('onDomainSelect', domain, isNotSet);
    },

    onSelectTopic(topic) {
      this.sendAction('onSelectTopic', topic);
    },

    onClickPrev() {
      let startDate = this.get('timeSeriesEndDate');
      const getStartMonth = startDate.getMonth();
      const getStartYear = startDate.getFullYear();
      let startDomainDate = new Date(getStartYear - 1, getStartMonth);
      this.set('timeSeriesEndDate', startDomainDate);
      this.showButton(
        this.get('timeSeriesEndDate'),
        this.get('timeSeriesStartDate')
      );
    },

    onClickNext() {
      let startDate = this.get('timeSeriesEndDate');
      const getStartMonth = startDate.getMonth();
      const getStartYear = startDate.getFullYear();
      let startDomainDate = new Date(getStartYear + 1, getStartMonth);
      this.set('timeSeriesEndDate', startDomainDate);
      this.showButton(
        this.get('timeSeriesEndDate'),
        this.get('timeSeriesStartDate')
      );
    },

    isShowLoaderSet(value) {
      this.set('isShowLoader', value);
    }
  },

  showButton(timeSeriesEndDate, endDate) {
    let component = this;
    let timeSeriesEndDates = `01-${moment(timeSeriesEndDate).format(
      'MM-YYYY'
    )}`;
    let currentDate = `01-${moment().format('MM-YYYY')}`;
    let getEndDate = `01-${moment(endDate).format('MM-YYYY')}`;
    component.set('showNextbtn', currentDate !== timeSeriesEndDates);
    let checkPrevDate = `01-${moment(endDate).format('MM')}-${parseInt(
      moment(timeSeriesEndDate).format('YYYY')
    ) - 1}`;
    component.set('showPrevtbtn', getEndDate >= checkPrevDate);
  },

  didDestroyElement() {
    let component = this;
    component.set('isSelectBaseLine', false);
  },
  didInsertElement() {
    let component = this;
    let currentDate = moment().toDate();
    component.set('timeSeriesEndDate', currentDate);
    component.showButton(
      this.get('timeSeriesEndDate'),
      this.get('timeSeriesStartDate')
    );
    if (component.get('isStudent')) {
      component.set('disableHeader', true);
    }
  }
});
