import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';
import d3 from 'd3';
import {
  STUDENT_PROGRESS_COLOR,
  SEL_STUDENT_REPORT_COLOR
} from 'gooru-web/config/config';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(tenantSettingsMixin, {
  classNames: ['class-atc-view'],
  // -------------------------------------------------------------------------
  // Dependencies
  reportService: Ember.inject.service('api-sdk/report'),

  /**
   * Analytics Service
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @type {Service} performance service
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * Class Service
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * Session Service
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * Class Activities Service
   */
  classActivitiesService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * Competency Service
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * Struggling compentency service
   */
  strugglingCompetencyService: Ember.inject.service(
    'api-sdk/struggling-competency'
  ),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  didInsertElement() {
    const component = this;
    if (component.get('class') && component.get('course')) {
      component.loadData();
    } else {
      component.loadClassData();
    }
    component.fetchPerformanceData();
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} courseId
   */
  courseId: Ember.computed.alias('course.id'),

  /**
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed.alias('course.subject'),

  /**
   * @type {Boolean}
   * Property to check whether a class is premium
   */
  isPremiumClass: Ember.computed('class', function() {
    let component = this;
    const currentClass = component.get('class') || null;
    let setting = currentClass ? currentClass.get('setting') : null;
    return setting ? setting['course.premium'] : false;
  }),
  /**
   * @property {Boolean} isShowCompetencyCompletionReport
   */
  isShowCompetencyCompletionReport: false,

  /**
   * Maintains the value which of month activities displaying
   * @type {Integer}
   */
  activeMonth: Ember.computed(function() {
    return moment().format('MM');
  }),

  /**
   * @property {Boolean} isCurrentMonth
   */
  isCurrentMonth: Ember.computed('activeMonth', function() {
    const component = this;
    let activeMonth = component.get('activeMonth');
    let currentMonth = moment().format('MM');
    return activeMonth === currentMonth;
  }),

  /**
   * @property {Boolean} isClassStartMonth
   */
  isClassStartMonth: Ember.computed('activeMonth', 'activeYear', function() {
    const component = this;
    let activeMonth = component.get('activeMonth');
    let activeYear = component.get('activeYear');
    let activeMonthYear = `${activeMonth}-${activeYear}`;
    let startClass = moment(this.get('class.startDate')).format('MM-YYYY');
    return activeMonthYear === startClass;
  }),

  /**
   * Maintains the value which of year activities displaying
   * @type {Integer}
   */
  activeYear: Ember.computed(function() {
    return moment().format('YYYY');
  }),

  /**
   * @property {String} userAgent
   */
  userAgent: 'desktop',

  /**
   * @property {Boolean} isExpandedView
   */
  isExpandedView: false,

  /**
   * @property {Boolean} isShowAtcView
   */
  isShowAtcView: Ember.computed('students', 'courseId', function() {
    const component = this;
    let isStudentsAvailable = component.get('students.length');
    let courseId = this.get('courseId');
    return this.get('isPremiumClass')
      ? !!isStudentsAvailable
      : isStudentsAvailable && courseId;
  }),

  /**
   * @property {Boolean} isShowActivitySearchContentPullup
   * Property to show/hide activity search content pullup
   */
  isShowActivitySearchContentPullup: false,

  /**
   * @property {String} defaultContentTypeToSuggest
   * Property to hold default content suggstion
   */
  defaultContentTypeToSuggest: 'collection',

  /**
   * @property {Array} selectedStudents
   * Property to hold list of students to suggest
   */
  selectedStudents: Ember.A([]),

  /**
   * @property {Json} classPreference
   */
  classPreference: Ember.computed.alias('class.preference'),

  /**
   * @property {Number} maxLimitToSuggestContent
   */
  maxLimitToSuggestContent: 6,

  /**
   * @property {Array} fwDomains
   */
  multiClassList: Ember.A([]),

  students: Ember.computed('class', function() {
    return this.get('class.members');
  }),

  /**
   * @property {Boolean} isShowStrugglingCompetencyReport
   * property hold the show / hide activity for grade competency
   */
  isShowStrugglingCompetencyReport: false,

  /**
   * @property {Boolean} isShowOtherGradeCompetency
   * property hold show/hide activity for other grade competency
   */
  isShowOtherGradeCompetency: false,

  /**
   * @property {Boolean} isShowGradeCompetency
   * property hold show/hide activity for struggling competency
   */
  isShowGradeCompetency: false,

  /**
   * @property {Array} gradeDomainsList
   * property hold struggling competency for current grade Domain
   */
  gradeDomainsList: [],

  /**
   * @property {Array} otherGradeCompetency
   * property hold struggling competency for other grade Domain
   */
  otherGradeCompetency: [],

  /**
   * @property {Array} otherGradeTopComp
   * property hold top competency for other grade domain
   */
  otherGradeTopComp: [],

  /**
   * @property {Number} gradeDomainIndex
   * property hold grade Domain index
   */
  gradeDomainIndex: null,

  /**
   * @property {Object} selectedCompetency
   * property hold selected competency
   */
  selectedCompetency: null,

  /**
   * @property {Array} collectionContents
   * property hold collection based on competency code
   */
  collectionContents: null,

  /**
   * @property {Boolean} isShowContentPreview
   * property help to show the preview collection from the competency pullup
   */
  isShowContentPreview: false,

  /**
   * @property {String} previewContentType
   * property hold the content type of the preview
   */
  previewContentType: null,

  /**
   * @property {Array} previewContent
   * property hold the content type of the preview
   */
  previewContent: null,

  /**
   * @property {Object} selectedContentForSchedule
   * property hold the selected sheduled content
   */
  selectedContentForSchedule: null,

  /**
   * @property {Array} memberGradeBounds
   */
  memberGradeBounds: Ember.computed('class', function() {
    return this.get('class.memberGradeBounds');
  }),

  /**
   * @property {Object} gradeRange
   */
  gradeRange: null,

  /**
   * @property {Array} studentsPerformanceList
   */
  studentsPerformanceList: [],

  /**
   * @property {String} currentGradeName
   */
  currentGradeName: '',

  /**
   * watchingSecondaryClass
   */
  watchingSecondaryClass: Ember.observer('classInfo', function() {
    const component = this;
    if (this.get('classInfo')) {
      component.loadClassData();
    }
  }),

  /**
   * @property {Boolean} isEnableCreateClass
   * Property help to show hide create class card
   */
  isSelEnabled: Ember.computed('tenantSettingsObj', function() {
    let tenantSetting = this.get('tenantSettingsObj');
    const preference = this.get('class.preference');
    if (preference) {
      let selReports =
        tenantSetting &&
        tenantSetting.ui_element_visibility_settings &&
        tenantSetting.ui_element_visibility_settings
          .sel_reports_enabled_subjects
          ? tenantSetting.ui_element_visibility_settings
            .sel_reports_enabled_subjects
          : false;
      if (
        preference.subject &&
        preference.framework &&
        selReports &&
        selReports.length
      ) {
        return selReports.find(
          element =>
            element === preference.framework.concat('.', preference.subject)
        );
      } else {
        return false;
      }
    } else {
      return false;
    }
  }),

  /**
   * @property {boolean} isShowCompetencyStudentList
   */
  isShowCompetencyStudentList: false,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click a domain
    onSelectGrade(domainIndex) {
      const component = this;
      if (component.get('gradeCompetencyDomainList')) {
        component.set('gradeDomainIndex', domainIndex);
        component.set('isShowGradeCompetency', true);
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_GROWTH_LEARNING_CHALLENGES);
      }
    },

    //Action triggered when click a grade
    onSelectOtherGrade(gradeIndex, domainIndex) {
      let component = this;
      if (
        component.get('otherGradeTopComp') &&
        component.get('otherGradeTopComp').length
      ) {
        this.set('gradeDomainIndex', {
          gradeIndex,
          domainIndex
        });
        component.set('isShowOtherGradeCompetency', true);
      }
    },

    onSelectMonth(date) {
      let component = this;
      let startDate = `${date}-01`;
      let forMonth = moment(startDate).format('MM');
      let forYear = moment(startDate).format('YYYY');
      component.set('activeMonth', forMonth);
      component.set('activeYear', forYear);
      component.set('selectedMonth', date);
    },

    //Action triggered when click a competency
    onSelectCompetency(selectedCompetency, domain = null) {
      let component = this;
      if (domain && domain.domainName && domain.domainCode) {
        selectedCompetency.set('domainName', domain.get('domainName'));
        selectedCompetency.set('domainCode', domain.get('domainCode'));
      }
      component.set('selectedCompetency', selectedCompetency);
      component.set('isShowStrugglingCompetencyReport', true);
      component.set('isShowCompetencyStudentList', false);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION
      );
    },

    onShowStudentList(selectedCompetency) {
      this.set('selectedCompetency', selectedCompetency);
      this.set('isShowStrugglingCompetencyReport', true);
      this.set('isShowCompetencyStudentList', true);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_GROWTH_PROFILE
      );
    },

    //Action triggered when change month
    onChangeMonth() {
      const component = this;
      component.loadData();
      component.fetchPerformanceData();
      if (component.get('gradeRange')) {
        component.fetchStrugglingCompetency();
      }
    },

    onToggleDatePicker() {
      const component = this;
      component.$('.month-picker .ca-datepicker-container').slideToggle();
    },

    //Action triggered when click class progress box
    showClassProgress() {
      const component = this;
      const classId = component.get('classId');
      component.set('class.isDisable', true);
      const landingPage = 'class-progress';
      let queryParams = {
        landingPage
      };
      let context = {
        classId: component.get('classId'),
        courseId: component.get('courseId')
      };
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS, context);
      component
        .get('router')
        .transitionTo('teacher.class.students-proficiency', classId, {
          queryParams
        });
    },

    //Action triggered when click student sel box
    showSelDetailView() {
      const component = this;
      component.get('router').transitionTo('teacher.class.sel-dashboard');
    },

    //Action triggered when click student progress box
    showStudentProgress() {
      const component = this;
      const classId = component.get('classId');
      component.set('class.isDisable', true);
      const landingPage = 'student-progress';
      let queryParams = {
        landingPage
      };
      let context = {
        classId: component.get('classId'),
        courseId: component.get('courseId')
      };
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_STUDENT_PROGRESS, context);
      component
        .get('router')
        .transitionTo('teacher.class.students-proficiency', classId, {
          queryParams
        });
    },

    //Action triggered when click activities count box
    onRedirectToCA() {
      const component = this;
      const classId = component.get('classId');
      let month = component.get('activeMonth');
      let year = component.get('activeYear');
      let queryParams = {
        month,
        year
      };
      component
        .get('router')
        .transitionTo('teacher.class.class-activities', classId, {
          queryParams
        });
    },

    //Action triggered when click on competency suggestion
    onSuggestAtCompetency(
      competency,
      selectedContentType = null,
      selectedStudents = []
    ) {
      const component = this;
      let contextParams = {
        classId: component.get('classId'),
        class: component.get('class'),
        course: component.get('course'),
        courseId: component.get('courseId')
      };
      component.set('contextParams', contextParams);
      component.set('selectedCompetencyData', competency);
      component.set('isShowActivitySearchContentPullup', true);
      component.set(
        'selectedContentType',
        selectedContentType || component.get('defaultContentTypeToSuggest')
      );
      component.set('selectedStudents', selectedStudents);
    },

    //Action triggered at once an activity added into the DCA
    addedContentToDCA(activityData) {
      const component = this;
      let selectedStudents = component.get('selectedStudents');
      if (selectedStudents.length) {
        let studentIds = selectedStudents.map(student => {
          return student.get('id');
        });
        let activityId = activityData.get('id');
        component.assignStudentsToContent(studentIds, activityId);
      }
    },

    onToggleMultiClassSelector() {
      this.$(
        '.performance-overview-header .class-selector .multi-class-list'
      ).slideToggle();
    },

    onSelectSecondaryClass(secondaryClass) {
      this.sendAction('onSelectSecondaryClass', secondaryClass);
    },

    onRemoveClassView(secondaryClass) {
      this.sendAction('onRemoveClassView', secondaryClass);
    },

    // action trigger when close struggling competency pull up
    onClosePullUp(isCloseAll) {
      if (isCloseAll) {
        this.set('isShowOtherGradeCompetency', false);
        this.set('isShowGradeCompetency', false);
      }
      this.set('isShowContentPreview', false);
      this.set('isShowStrugglingCompetencyReport', false);
      this.set('isShowCompetencyStudentList', false);
    },

    // action trigger when click backbutton in other grade pull up
    onCloseOtherGrade() {
      this.set('isShowOtherGradeCompetency', false);
    },

    // action trigger when click backbutton in pull up
    onCloseGradePullUp() {
      this.set('isShowGradeCompetency', false);
    },

    // Action trigger when click ah play button
    onPreviewContent(content) {
      let component = this;
      component.set(
        'previewContentType',
        content.get('format') || content.get('collectionType')
      );
      component.set('previewContent', content);
      component.set('isShowContentPreview', true);
    },

    // Action trigger when click add to class activity
    onAddCollectionToDCA(content, studentList) {
      let component = this;
      let classId = component.get('classId');
      let contentType = content.get('format');
      let contentId = content.get('id');
      let date = moment().format('YYYY-MM-DD');
      component
        .get('classActivitiesService')
        .addActivityToClass(classId, contentId, contentType, date)
        .then(newContentId => {
          component.saveUsersToCA(newContentId, studentList);
          content.set('isAdded', true);
        });
    },

    /**
     * It will takes care of content will schedule for the specific date.
     * @param  {String} scheduleDate
     */
    onScheduleDate(scheduleDate, scheduleEndDate) {
      let component = this;
      let classId = component.get('classId');
      let contentType = component.get('selectedContentForSchedule.format');
      let contentId = component.get('selectedContentForSchedule.id');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      let forMonth = moment(scheduleDate).format('MM');
      let forYear = moment(scheduleDate).format('YYYY');
      component
        .get('classActivitiesService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          scheduleDate,
          forMonth,
          forYear,
          scheduleEndDate
        )
        .then(newContentId => {
          let studentList = component.get('studentsPerformanceList');
          component.saveUsersToCA(newContentId, studentList);
          component.set('selectedContentForSchedule.isScheduled', true);
        });
    },

    /**
     * It will takes care of content will schedule for the specific month.
     * @param  {Moment} Month
     * @param  {Moment} Year
     */
    onScheduleForMonth(forMonth, forYear) {
      let component = this;
      let classId = component.get('classId');
      let contentType = component.get('selectedContentForSchedule.format');
      let contentId = component.get('selectedContentForSchedule.id');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      component
        .get('classActivitiesService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          null,
          forMonth,
          forYear
        )
        .then(newContentId => {
          let studentList = component.get('studentsPerformanceList');
          component.saveUsersToCA(newContentId, studentList);
          component.set('selectedContentForSchedule.isScheduled', true);
        });
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content, studentList) {
      let component = this;
      component.set('studentsPerformanceList', studentList);
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.show();
      component.set('selectedContentForSchedule', content);
      component.set('endDate', null);
    },
    /**
     * Action triggered when the user click on close
     */
    onCloseDatePicker() {
      let datepickerEle = Ember.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
    },

    onGoDataDashboard(page = 'milestone') {
      if (page === 'milestone') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PO_DATA_BY_MILESTONE
        );
      } else if (page === 'diagnostic') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC
        );
      }
      this.sendAction('onGoDataDashboard', page);
    }
  },

  // -------------------------------------------------------------------------
  // Functions

  loadClassData() {
    const component = this;
    const classId = component.get('classId');
    component.set('isLoading', true);
    Ember.RSVP.hash({
      classData: component.get('classService').readClassInfo(classId),
      classMembers: component.get('classService').readClassMembers(classId)
    }).then(({ classData, classMembers }) => {
      if (!component.get('isDestroyed')) {
        const setting = classData.get('setting');
        const preference = classData.get('preference');
        const isPremiumClass = setting != null && setting['course.premium'];
        const competencyCompletionStats = isPremiumClass
          ? component.get('competencyService').getCompetencyCompletionStats([
            {
              classId: classId,
              subjectCode: preference.subject
            }
          ])
          : Ember.RSVP.resolve(Ember.A());
        competencyCompletionStats.then(competencyStats => {
          if (!component.isDestroyed) {
            classData.set(
              'competencyStats',
              competencyStats.findBy('classId', classId)
            );
          }
        });
        component.set('class', classData);
        component.set('class.members', classMembers.get('members'));
        component.set(
          'class.memberGradeBounds',
          classMembers.get('memberGradeBounds')
        );
        if (classData.get('courseId')) {
          component
            .get('courseService')
            .fetchById(classData.get('courseId'))
            .then(function(courseData) {
              component.set('class.course', courseData);
              component.set('course', courseData);
              component.loadData();
            });
        } else {
          component.loadData();
        }
        component.set('class.isSecondaryClass', true);
      }
    });
  },

  /**
   * @function fetchDcaSummaryPerformance
   * Method to fetch dca summary performance for offline class
   */
  fetchPerformanceData() {
    let component = this;
    let classes = component.get('class');
    let startDate = moment(classes.get('startDate')).format('YYYY-MM-DD');
    let endDate;
    let activeMonth = component.get('activeMonth');
    let activeYear = component.get('activeYear');
    let activeYM = `${activeYear}-${activeMonth}`;
    let isSelEnabled = component.get('isSelEnabled');
    endDate = moment(activeYM, 'YYYY-MM')
      .endOf('month')
      .format('YYYY-MM-DD');

    if (startDate < endDate && classes.get('preference')) {
      let dataParam = {
        fromDate: startDate,
        toDate: endDate,
        subjectCode: classes.get('preference.subject')
      };
      let classCourseId = null;
      if (component.get('courseId')) {
        classCourseId = Ember.A([
          {
            classId: classes.get('id'),
            courseId: component.get('courseId')
          }
        ]);
      }
      const performanceSummaryPromise = classCourseId
        ? component
          .get('performanceService')
          .findClassPerformanceSummaryByClassIds(classCourseId)
        : component
          .get('analyticsService')
          .getDCASummaryPerformance(classes.get('id'));
      return Ember.RSVP.hash({
        performanceData: performanceSummaryPromise,
        getTimeSpend: component
          .get('classActivityService')
          .getTimeSpend(classes.get('id'), startDate, endDate),
        getMilestone:
          classes &&
          classes.preference &&
          classes.preference.framework &&
          classes.preference.subject
            ? component
              .get('classActivityService')
              .getMilestone(classes.get('id'), startDate, endDate)
            : null,
        getDiagnosticReport:
          classes &&
          classes.preference &&
          classes.preference.framework &&
          classes.preference.subject
            ? component
              .get('classActivityService')
              .getDiagnosticReport(classes.get('id'), startDate, endDate)
            : null,
        getStudentProgressChart:
          classes && classes.preference
            ? component
              .get('reportService')
              .fetchStudentsSummaryReport(classes.get('id'), dataParam)
            : null,
        getStudentSelReport: isSelEnabled
          ? component
            .get('reportService')
            .fetchStudentSelReport(classes.get('id'), dataParam)
          : null
      }).then(function(hash) {
        let summaryReportData = hash.getStudentProgressChart;
        let studentSelReportData = hash.getStudentSelReport;
        component.set(
          'studentSelReportData',
          studentSelReportData && studentSelReportData.data
        );
        let parsedStudentsSummaryReportData = Ember.A([]);
        let studentsSummaryReportData = summaryReportData.get(
          'studentsSummaryData'
        );
        let gainedCompetencies = 0;
        let inProgressCompetencies = 0;
        studentsSummaryReportData.map(studentSummaryReportData => {
          let summaryData = studentSummaryReportData.get('summaryData');
          let weeklySummaryData = summaryData || null;
          if (weeklySummaryData) {
            if (
              weeklySummaryData.completedCompetencies.length ||
              weeklySummaryData.masteredCompetencies.length
            ) {
              gainedCompetencies += 1;
            }
            if (weeklySummaryData.inprogressCompetencies.length) {
              inProgressCompetencies += 1;
            }
            parsedStudentsSummaryReportData.pushObject(weeklySummaryData);
          }
        });
        component.set('inProgressData', inProgressCompetencies);
        component.set('gainedData', gainedCompetencies);

        let milestone = hash.getMilestone;
        component.set('diagnosticReport', hash.getDiagnosticReport);
        component.set('totalTimespent', hash.getTimeSpend[0].total_timespent);
        component.set(
          'performanceData',
          component.get('courseId') &&
            hash.performanceData &&
            hash.performanceData.length
            ? hash.performanceData[0]
            : hash.performanceData
        );
        let members = classes.get('members').filterBy('isActive', true);
        let diagnosticCount = Ember.A([]);
        if (hash && hash.getDiagnosticReport) {
          hash.getDiagnosticReport.domains.map(domain => {
            diagnosticCount = diagnosticCount.concat(
              domain.students ? domain.students.mapBy('id') : []
            );
          });
        }
        component.set(
          'diagnosticReportCount',
          [...new Set(diagnosticCount)].length
        );

        component.set('totalStudents', members.length);
        if (milestone && milestone.milestones) {
          component.loadMilestoneChart(milestone.milestones);
        }
        component.loadStudentProgressChart(parsedStudentsSummaryReportData);
        if (studentSelReportData && studentSelReportData.data) {
          component.loadSelReportChart(studentSelReportData);
        }
      });
    } else {
      component.loadMilestoneChart();
      component.loadStudentProgressChart();
    }
  },

  loadSelReportChart(studentSelReportData) {
    let data = Ember.A([]);
    let totalStudentCount = studentSelReportData.context.total_students;
    let setTick = totalStudentCount <= 5 ? 5 : totalStudentCount;
    studentSelReportData.data.forEach((item, index) => {
      let itemObj = {
        categorie: `L${index + 1}`,
        title: item.title,
        selReportData: item,
        values: [
          {
            value: item.started ? item.started : 0,
            rate: 'Not at all'
          },
          {
            value: item.completed ? item.completed : 0,
            rate: 'Not very much'
          }
        ]
      };
      data.pushObject(itemObj);
    });

    var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
      },
      width =
        (data.length === 1 ? 130 : 90) * data.length -
        margin.left -
        margin.right,
      height = 200 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg
      .axis()
      .scale(x0)
      .tickSize(0)
      .orient('bottom');

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .ticks(setTick <= 5 ? 5 : null)
      .orient('left');

    var color = d3.scale.ordinal().range(SEL_STUDENT_REPORT_COLOR);

    var svg = d3
      .select('#sel_data')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    var categoriesNames = data.map(function(d) {
      return d.categorie;
    });
    var rateNames = data[0].values.map(function(d) {
      return d.rate;
    });

    x0.domain(categoriesNames);
    x1.domain(rateNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, setTick]);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('class', 'y axis')
      .style('opacity', '0')
      .call(yAxis);

    svg
      .select('.y')
      .transition()
      .duration(500)
      .delay(1300)
      .style('opacity', '1');

    svg.selectAll('.x.axis .tick')[0].forEach(function(d1) {
      d3.select(d1)
        .on('mouseover', function(d) {
          d3.select('.textlbl')
            .transition()
            .duration(200)
            .style('opacity', 1);
          d3.select('.textlbl')
            .html(function() {
              var label = data.find(element => element.categorie === d);
              return label.title;
            })
            .style('display', 'block')
            .style('top', `${d3.event.pageY - 10}px`)
            .style('left', `${d3.event.pageX + 10}px`);
        })
        .on('mouseout', function() {
          d3.select('.textlbl')
            .style('display', 'none')
            .style('opacity', 0);
        });
    });

    var slice = svg
      .selectAll('.slice')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'g')
      .attr('transform', function(d) {
        return `translate(${x0(d.categorie)},0)`;
      });

    slice
      .selectAll('rect')
      .data(function(d) {
        return d.values;
      })
      .enter()
      .append('rect')
      .attr('width', x1.rangeBand())
      .attr('x', function(d) {
        return x1(d.rate);
      })
      .style('fill', function(d) {
        return color(d.rate);
      })
      .attr('y', function() {
        return y(0);
      })
      .attr('height', function() {
        return height - y(0);
      });

    slice
      .selectAll('rect')
      .transition()
      .delay(function() {
        return Math.random() * 1000;
      })
      .duration(1000)
      .attr('y', function(d) {
        return y(d.value) - 1;
      })
      .attr('height', function(d) {
        return height - y(d.value);
      });

    slice
      .selectAll('.bar')
      .data(function(d) {
        return d.values;
      })
      .enter()
      .append('text')
      .data(function(d) {
        return d.values;
      })
      .attr('x', function(d) {
        return x1(d.rate) - 6;
      })
      .attr('y', function(d) {
        return y(d.value);
      })
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('width', 40)
      .attr('transform', 'translate(20, -20)')
      .text(function(d) {
        return d.value;
      });
  },

  loadStudentProgressChart(atcPerformance) {
    let keys = {};
    if (atcPerformance && atcPerformance.length) {
      atcPerformance.forEach(performanceData => {
        const totalCounts =
          performanceData.completedCompetencies.length +
          performanceData.masteredCompetencies.length;
        if (!keys[totalCounts]) {
          keys[totalCounts] = 0;
        }
        keys[totalCounts]++;
      });
    } else {
      keys[0] = 1;
    }
    let maxGained = Object.keys(keys).reduce((a, b) => (+a > +b ? +a : +b));
    this.set('totalCompetency', maxGained);
    let maxValue = this.findMaxValue(keys);
    let finalParseValue;
    if (maxValue > 5 || Object.keys(keys).length > 5) {
      finalParseValue = this.getParseData(keys, maxValue);
    } else {
      finalParseValue = keys;
    }
    let totalMaxGaind = Ember.A([]);
    Object.keys(finalParseValue).map(function(items) {
      let totalPercentage = (
        (finalParseValue[items] /
          (atcPerformance && atcPerformance.length
            ? atcPerformance.length
            : 1)) *
        100
      ).toFixed(1);
      let total = {
        label: items,
        value: `${totalPercentage}%`
      };
      totalMaxGaind.pushObject(total);
    });
    this.set('totalMaxGaind', totalMaxGaind);
    this.$('.donut_chart').remove();

    var width = 180,
      height = 190,
      radius = Math.min(width, height) / 2;

    var arc = d3.svg
      .arc()
      .outerRadius(radius * 0.6)
      .innerRadius(radius * 0.3);

    var pie = d3.layout
      .pie()
      .sort(null)
      .value(function(d) {
        return d.value;
      });

    d3.select('#graft_data')
      .select('svg')
      .remove();
    var svg = d3
      .select('#graft_data')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    let key = function(d) {
      return d.data.label;
    };

    let color = d3.scale
      .ordinal()
      .domain(Object.keys(finalParseValue))
      .range(STUDENT_PROGRESS_COLOR);

    let percentage = Object.values(finalParseValue).map(items =>
      (
        (items /
          (atcPerformance && atcPerformance.length
            ? atcPerformance.length
            : 1)) *
        100
      ).toFixed(1)
    );

    let data = this.randomData(color, percentage);

    var g = svg
      .selectAll('.arc')
      .data(pie(data), key)
      .enter()
      .append('g');

    g.append('path')
      .attr('d', arc)
      .style('fill', function(d) {
        return color(d.data.label);
      });

    g.append('text')
      .attr('transform', function(d) {
        var _d = arc.centroid(d);
        _d[0] *= 1.6;
        _d[1] *= 1.6;
        return `translate(${_d})`;
      })
      .attr('dy', '.50em')
      .style('text-anchor', 'middle')
      .text(function(d) {
        return d.data.text;
      });
  },

  randomData(color, percentage) {
    let component = this;
    let labels = color.domain();
    return labels.map(function(label, index) {
      return {
        label: label,
        value: percentage[index],
        text: component.get('i18n').t(`common.label-${index}`)
      };
    });
  },

  loadMilestoneChart(milestones) {
    let data = Ember.A([]);
    let maxValue = 0;
    if (milestones && milestones.length) {
      let milestoneChart = milestones.filter(milestone => {
        return milestone.students && milestone.students.length;
      });

      milestoneChart.forEach(milestone => {
        if (maxValue < milestone.students.length) {
          maxValue = milestone.students.length;
        }
        let dataValue;
        dataValue = {
          label: milestone.grade_name,
          value: milestone.students.length
        };
        data.pushObject(dataValue);
      });
    }
    let setTick = maxValue >= 5 ? 5 : maxValue;
    this.$('.bar_charts').remove();

    if (data && data.length) {
      let setWidth = 290;
      if (data.length > 5) {
        setWidth = data.length * 20 + setWidth;
      }

      // Chart Size Setup
      let margin = {
        top: 35,
        right: 0,
        bottom: 30,
        left: 40
      };

      let width = setWidth - margin.left - margin.right;
      let height = 200 - margin.top - margin.bottom;
      let barWidth = setWidth / (3 + data.length);
      barWidth = barWidth < 20 ? 20 : barWidth;
      let chart = d3
        .select('.chart')
        .attr('width', setWidth)
        .attr('height', 200)
        .append('g')
        .attr('class', 'bar_charts')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      let x = d3.scale
        .ordinal()
        .domain(
          data.map(function(d) {
            return (d.label =
              d.label.length > 7
                ? d.label.includes('Integrated')
                  ? d.label.substring(d.label.length - 7)
                  : `${d.label.substring(0, 7)}...`
                : d.label);
          })
        )
        .rangeRoundBands([0, width], 0.1);
      let y = d3.scale
        .linear()
        .domain([0, maxValue])
        .range([height, 0]);

      // Axis
      let xAxis = d3.svg
        .axis()
        .scale(x)
        .orient('bottom');

      let yAxis = d3.svg
        .axis()
        .scale(y)
        .ticks(setTick)
        .orient('left');

      let yAxisText = this.get('i18n').t('common.students');

      chart
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      chart
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis);

      chart
        .append('text')
        .attr('class', 'y-axis-student')
        .attr('transform', 'rotate(-90)')
        .attr('y', 2)
        .attr('x', '-35')
        .attr('dy', '-2.5em')
        .attr('text-anchor', 'end')
        .text(yAxisText);

      chart
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('text')
        .data(data)
        .attr('x', function(d) {
          return (
            x(d.label) +
            x.rangeBand() / 2 -
            barWidth / 2 +
            (data.length === 1 ? 15 : -2)
          );
        })
        .attr('y', function(d) {
          return y(d.value);
        })
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('width', barWidth)
        .attr('transform', 'translate(20, -20)')
        .text(function(d) {
          return d.value;
        });

      // Bars
      let bar = chart
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
          return x(d.label) + x.rangeBand() / 2 - barWidth / 2;
        })
        .attr('y', height)
        .attr('width', barWidth)
        .attr('height', 0);

      bar
        .transition()
        .duration(1500)
        .ease('elastic')
        .attr('y', function(d) {
          return y(d.value);
        })
        .attr('height', function(d) {
          return height - y(d.value);
        });
    } else {
      this.set('isShowMilestoneChart', true);
    }
  },

  findMaxValue(keys) {
    let maxValue = Object.keys(keys).reduce((a, b) => (+a > +b ? +a : +b));
    if (maxValue % 5 === 0) {
      return parseInt(Math.floor(maxValue / 5)) * 5;
    } else {
      return parseInt(Math.floor(maxValue / 5)) * 5 + 5;
    }
  },

  getParseData(keys, maxValue) {
    let one = 1;
    let first = 0;
    let percentage = 100;
    let parseObj = {};
    let fifth = maxValue;
    let second = Math.round((5 / percentage) * maxValue);
    let third = Math.round((20 / percentage) * maxValue);
    let fourth = Math.round((50 / percentage) * maxValue);
    let second2 =
      first + one === second ? second : `${first + one} - ${second}`;
    let third3 = second + one === third ? third : `${second + one} - ${third}`;
    let fourth4 =
      third + one === fourth ? fourth : `${third + one} - ${fourth}`;
    let fifth5 = fourth + one === fifth ? fifth : `${fourth + one} - ${fifth}`;
    Object.keys(keys).map(item => {
      let items = parseInt(item);
      if (first === items) {
        if (!parseObj[first]) {
          parseObj[first] = first;
        }
        parseObj[first] += keys[items];
      } else if (first + one <= items && second >= items) {
        if (!parseObj[second2]) {
          parseObj[second2] = first;
        }
        parseObj[second2] += keys[items];
      } else if (second + one <= items && third >= items) {
        if (!parseObj[third3]) {
          parseObj[third3] = first;
        }
        parseObj[third3] += keys[items];
      } else if (third + one <= items && fourth >= items) {
        if (!parseObj[fourth4]) {
          parseObj[fourth4] = first;
        }
        parseObj[fourth4] += keys[items];
      } else if (fourth + one <= items) {
        if (!parseObj[fifth5]) {
          parseObj[fifth5] = first;
        }
        parseObj[fifth5] += keys[items];
      }
    });

    let minValue = Object.keys(parseObj).flat(1);
    let objValue = minValue[0].split('-');
    let value = minValue[1].split('-');
    let parseValue = parseInt(value[0]);
    if (objValue && parseInt(objValue[0]) === 0 && parseValue - 1 !== 0) {
      let parseObject = {};
      Object.keys(parseObj).map(function(items, index) {
        if (index === 0) {
          parseObject[`${first} - ${parseValue - 1}`] = parseObj[first];
        } else {
          parseObject[items] = parseObj[items];
        }
      });
      return parseObject;
    }
    return parseObj;
  },

  loadData() {
    const component = this;
    component.set('isLoading', false);
    if (component.get('isShowAtcView')) {
      component.set('isLoading', true);
      component.fetchClassActivitiesCount();
      component.set('isLoading', false);
      component.getStudentsGradeRange();
    }
    if (!component.get('isDestroyed')) {
      component.sendAction('onSelectSecondaryClass', component.get('class'));
    }
  },

  /**
   * @function fetchClassActivitiesCount
   * Method to fetch activities count
   */
  fetchClassActivitiesCount() {
    const component = this;
    const classActivitiesService = component.get('classActivitiesService');
    const classId = component.get('classId');
    let month = component.get('activeMonth');
    let year = component.get('activeYear');
    return Ember.RSVP.hash({
      activitiesCount: Ember.RSVP.resolve(
        classActivitiesService.getMonthlyActivitiesCount(classId, month, year)
      )
    })
      .then(({ activitiesCount }) => {
        component.set('activitiesCount', activitiesCount);
        return activitiesCount;
      })
      .catch(function() {
        let activitiesCount = {
          scheduled: 0,
          unscheduled: 0
        };
        component.set('activitiesCount', activitiesCount);
      });
  },

  /**
   * @function fetchDomainsCompletionReport
   * Method to fetch domains completion report
   */
  fetchDomainsCompletionReport() {
    const component = this;
    const competencyService = component.get('competencyService');
    const classId = component.get('classId');
    let month = component.get('activeMonth');
    let year = component.get('activeYear');
    let agent = component.get('userAgent');
    let requestBody = {
      classId,
      month,
      year,
      agent
    };
    return Ember.RSVP.hash({
      domainsCompletionReport: Ember.RSVP.resolve(
        competencyService.getDomainsCompletionReport(requestBody)
      )
    }).then(({ domainsCompletionReport }) => {
      return domainsCompletionReport;
    });
  },

  /**
   * @function assignStudentsToContent
   * Method to assign list of students into an activity
   */
  assignStudentsToContent(studentIds, contentId) {
    const component = this;
    const classId = component.get('classId');
    component
      .get('classActivitiesService')
      .addUsersToActivity(classId, contentId, studentIds);
  },

  /**
   * @function fetchStrugglingCompetency
   * Method to fetach struggling competency
   */
  fetchStrugglingCompetency() {
    let component = this;
    let taxonomyService = component.get('taxonomyService');
    let subject = component.get('class.preference.subject');
    let fwk = component.get('class.preference.framework');
    let isDefaultShowFW = component.get('isDefaultShowFW');
    let classFramework = component.get('classFramework');
    let filters = {
      subject,
      fw_code: fwk || 'GUT'
    };
    taxonomyService.fetchGradesBySubject(filters).then(grades => {
      let gradeIds = Ember.A([]);
      if (grades && grades.length) {
        gradeIds = grades.mapBy('id');
      }
      const queryParams = {
        grade: gradeIds.toString(),
        classId: component.get('class.id'),
        month: component.get('activeMonth'),
        year: component.get('activeYear')
      };
      Ember.RSVP.hash({
        gradeLevelCompetencies: gradeIds.length
          ? component
            .get('strugglingCompetencyService')
            .fetchStrugglingCompetency(
              queryParams,
              isDefaultShowFW,
              classFramework
            )
          : Ember.A([])
      }).then(({ gradeLevelCompetencies }) => {
        if (!component.get('isDestroyed')) {
          component.set('otherGradeCompetency', []);
          component.set('otherGradeTopComp', []);
          component.set('gradeCompetencyDomainList', []);
          if (gradeLevelCompetencies && gradeLevelCompetencies.length) {
            const classGradeId = component.get('class.gradeCurrent');
            const classGradeCompetencies = gradeLevelCompetencies.findBy(
              'gradeId',
              classGradeId
            );
            let learningChalanges = [];
            let learningGaps = [];
            gradeLevelCompetencies.map(grade => {
              if (grade.gradeSeq >= classGradeCompetencies.get('gradeSeq')) {
                learningChalanges.pushObject(grade);
              } else {
                learningGaps.pushObject(grade);
              }
            });
            if (classGradeCompetencies) {
              component.set(
                'currentGradeName',
                classGradeCompetencies.get('grade')
              );
              component.serializeClassGradeContent(gradeLevelCompetencies);
            }

            if (learningGaps && learningGaps.length) {
              let otherGradeTopComp = [];
              let cloneOtherGrade = getObjectsDeepCopy(learningGaps);
              cloneOtherGrade
                .map(grade => grade.domains)
                .map((domains, gradeIndex) => {
                  let competencyList = [];
                  domains.forEach((domain, domainIndex) => {
                    domain.competencies[0].domainIndex = domainIndex;
                    domain.competencies[0].domainName = domain.domainName;
                    competencyList.pushObject(domain.competencies[0]);
                  });
                  if (competencyList && competencyList.length) {
                    let gradeLevelTopCompetency = competencyList.reduce(
                      (prevCompetency, currentCompetency) => {
                        return prevCompetency.studentsCount <
                          currentCompetency.studentsCount
                          ? currentCompetency
                          : prevCompetency;
                      }
                    );
                    if (gradeLevelTopCompetency) {
                      gradeLevelTopCompetency.gradeIndex = gradeIndex;
                      otherGradeTopComp.pushObject(gradeLevelTopCompetency);
                    }
                  }
                });
              let sortedOtherCompetency = otherGradeTopComp.length
                ? otherGradeTopComp.sortBy('studentsCount').reverse()
                : otherGradeTopComp;
              component.set('otherGradeTopComp', sortedOtherCompetency);
              component.set('otherGradeCompetency', learningGaps);
            }
          }
        }
      });
    });
  },

  /**
   * @function getStudentsGradeRange
   *Method to get student grade range
   */
  getStudentsGradeRange() {
    let component = this;
    let memberGradeBounds = component.get('memberGradeBounds');
    let students = component.get('students');
    let availableGrade = [];
    if (students) {
      students.map(student => {
        let memberId = student.get('id');
        let grade = memberGradeBounds.findBy(memberId);
        if (grade) {
          let gradeBounds = grade.get(memberId);
          availableGrade.push(gradeBounds);
        }
      });
      let gradeAsc = availableGrade
        .sortBy('grade_lower_bound')
        .find(lowestGrade => lowestGrade.grade_lower_bound);
      let gradeDesc = availableGrade
        .sortBy('grade_upper_bound')
        .reverse()
        .find(highestGrade => highestGrade.grade_lower_bound);
      let minGrade =
        gradeAsc && gradeAsc.grade_lower_bound
          ? gradeAsc.grade_lower_bound
          : null;
      let maxGrade =
        gradeDesc && gradeDesc.grade_upper_bound
          ? gradeDesc.grade_upper_bound
          : null;
      if (minGrade && maxGrade) {
        component.set('gradeRange', {
          minGrade,
          maxGrade
        });
        component.fetchStrugglingCompetency();
      }
    }
  },

  serializeClassGradeContent(learningChalanges) {
    let gradeDomainsList = [];
    learningChalanges.forEach(classGradeDomains => {
      if (classGradeDomains && classGradeDomains.domains) {
        classGradeDomains.domains.forEach(domain => {
          const competencies = domain.competencies;
          const competency =
            competencies && competencies.length
              ? competencies.objectAt(0)
              : null;
          if (competency) {
            gradeDomainsList.push(
              Ember.Object.create({
                domainCode: domain.domainCode,
                domainId: domain.domainId,
                domainName: domain.domainName,
                domainSeq: domain.domainSeq,
                competencies: domain.competencies,
                grade: classGradeDomains.grade,
                ...competency
              })
            );
          }
          const sortedGradeList = gradeDomainsList
            .sortBy('studentsCount')
            .reverse();
          this.set('gradeCompetencyDomainList', sortedGradeList);
        });
      }
    });
  },

  saveUsersToCA(newContentId, studentList) {
    let component = this;
    let classId = component.get('classId');
    let contentId = newContentId;
    let students = studentList;
    let users = students.map(student => {
      return student.get('id');
    });
    component
      .get('classActivityService')
      .addUsersToActivity(classId, contentId, users);
  }
});
