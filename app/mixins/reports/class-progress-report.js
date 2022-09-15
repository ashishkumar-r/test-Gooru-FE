import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  i18n: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    //Action triggered when toggle report period
    onToggleReportPeriod() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_DATE
      );
      this.set('isCalendarEnable', !this.get('isCalendarEnable'));
      $('.title-container .date-range-picker-container').slideToggle();
    },

    //Action triggered when clicking on datepicker view
    onSelectRangeType(rangeType) {
      const component = this;
      let startDate =
        !component.get('isAllTime') && !component.get('isDateRange')
          ? component.get('rangeStartDate')
          : null;
      let endDate =
        !component.get('isAllTime') && !component.get('isDateRange')
          ? component.get('rangeEndDate')
          : moment().format('YYYY-MM-DD');
      let classStartDate = component.get('classStartDate');
      component.set('isDaily', false);
      component.set('isMonthly', false);
      component.set('isWeekly', false);
      if (rangeType === 'isDaily') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_DAILY);
        let selectedDate = startDate ? startDate : endDate;
        component.set(
          'selectedDate',
          moment(classStartDate).isAfter(selectedDate)
            ? classStartDate
            : selectedDate
        );
      } else if (rangeType === 'isWeekly') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_WEEKLY);
        let selectedWeekStartDate = startDate
          ? moment(startDate)
            .startOf('Week')
            .format('YYYY-MM-DD')
          : moment(endDate)
            .startOf('Week')
            .format('YYYY-MM-DD');
        let selectedWeekEndDate = startDate
          ? moment(startDate)
            .endOf('Week')
            .format('YYYY-MM-DD')
          : moment(endDate)
            .endOf('Week')
            .format('YYYY-MM-DD');
        let selectedWeekDate = startDate
          ? moment(startDate).format('MM') ===
            moment(selectedWeekStartDate).format('MM')
            ? selectedWeekStartDate
            : selectedWeekEndDate
          : moment(endDate).format('MM') ===
            moment(selectedWeekStartDate).format('MM')
            ? selectedWeekStartDate
            : selectedWeekEndDate;
        component.set('forMonth', moment(selectedWeekDate).format('MM'));
        component.set('forYear', moment(selectedWeekDate).format('YYYY'));
        component.set(
          'selectedWeekDate',
          moment(classStartDate).isAfter(selectedWeekDate)
            ? classStartDate
            : selectedWeekDate
        );
      } else {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_MONTHLY);
        let selectedMonth = startDate
          ? moment(startDate).format('YYYY-MM')
          : moment(endDate).format('YYYY-MM');
        component.set('selectedYear', moment(selectedMonth).format('YYYY'));
        component.set('selectedMonth', selectedMonth);
      }
      component.set(`${rangeType}`, true);
    },

    //Action triggered when toggle report period
    closeDatePicker() {
      $('.title-container .date-range-picker-container').slideUp();
      this.set('isCalendarEnable', false);
    },

    //Datepicker selection of a date
    onSelectDate(date, isDateChange) {
      let component = this;
      let forMonth = moment(date).format('MM');
      let forYear = moment(date).format('YYYY');
      if (isDateChange) {
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.set('selectedDate', date);
        component.set('rangeEndDate', date);
        component.set('rangeStartDate', null);
        component.set('isAllTime', false);
        component.set('isDateRange', false);
        component.loadStudentSummaryReportData();
        component.send('closeDatePicker');
      }
    },

    onSelectWeek(startDate, endDate, isDateChange) {
      let component = this;
      let forMonth = moment(endDate).format('MM');
      let forYear = moment(endDate).format('YYYY');
      if (isDateChange) {
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.set('selectedWeekDate', startDate);
        component.set('rangeStartDate', startDate);
        component.set('rangeEndDate', endDate);
        component.set('isAllTime', false);
        component.set('isDateRange', false);
        component.loadStudentSummaryReportData();
        component.send('closeDatePicker');
      }
    },

    onSelectMonth(date, isDateChange) {
      let component = this;
      let startDate = `${date}-01`;
      let endDate = moment(startDate)
        .endOf('month')
        .format('YYYY-MM-DD');
      let forMonth = moment(startDate).format('MM');
      let forYear = moment(startDate).format('YYYY');
      if (isDateChange) {
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.set('selectedMonth', date);
        component.set('rangeStartDate', startDate);
        component.set('rangeEndDate', endDate);
        component.set('isAllTime', false);
        component.set('isDateRange', false);
        component.loadStudentSummaryReportData();
        component.send('closeDatePicker');
      }
    },

    onSelectToday(date) {
      let component = this;
      component.send('onSelectDate', date, true);
    },

    getTillnowData() {
      let component = this;
      let startDate = moment(component.get('classStartDate')).format(
        'YYYY-MM-DD'
      );
      let endDate = moment().format('YYYY-MM-DD');
      component.set('isDaily', false);
      component.set('isMonthly', false);
      component.set('isWeekly', false);
      component.set('isDateRange', false);
      component.set('isAllTime', true);
      component.set('rangeStartDate', startDate);
      component.set('rangeEndDate', endDate);
      component.loadStudentSummaryReportData();
      component.send('closeDatePicker');
    },

    /**
     * Show range date picker while click dropdown custom option
     */
    onRangePickerReport() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_DATERANGE);
      let startDate = moment(component.get('classStartDate')).format(
        'YYYY-MM-DD'
      );
      let endDate = moment().format('YYYY-MM-DD');
      component.set('startDate', startDate);
      component.set('endDate', endDate);
      component.set('isDaily', false);
      component.set('isMonthly', false);
      component.set('isWeekly', false);
      component.set('isAllTime', false);
      component.set('isDateRange', true);
    },

    showPrevious() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_DATE_PRE_ARROW);
      let toData = component.get('rangeEndDate');
      if (component.get('isDaily')) {
        let date = moment(toData)
          .subtract(1, 'days')
          .format('YYYY-MM-DD');
        component.send('onSelectDate', date, true);
      } else if (component.get('isWeekly')) {
        let startDate = moment(toData)
          .subtract(1, 'weeks')
          .startOf('Week')
          .format('YYYY-MM-DD');
        let endDate = moment(toData)
          .subtract(1, 'weeks')
          .endOf('Week')
          .format('YYYY-MM-DD');
        component.send('onSelectWeek', startDate, endDate, true);
      } else {
        let startDate = moment(toData)
          .subtract(1, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        let monthAndyear = `${forYear}-${forMonth}`;
        component.send('onSelectMonth', monthAndyear, true);
      }
    },

    showNext() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_DATE_NEXT_ARROW);
      let toData = component.get('rangeEndDate');
      if (component.get('isDaily')) {
        let date = moment(toData)
          .add(1, 'days')
          .format('YYYY-MM-DD');
        component.send('onSelectDate', date, true);
      } else if (component.get('isWeekly')) {
        let startDate = moment(toData)
          .add(1, 'weeks')
          .startOf('Week')
          .format('YYYY-MM-DD');
        let endDate = moment(toData)
          .add(1, 'weeks')
          .endOf('Week')
          .format('YYYY-MM-DD');
        component.send('onSelectWeek', startDate, endDate, true);
      } else {
        let startDate = moment(toData)
          .add(1, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        let monthAndyear = `${forYear}-${forMonth}`;
        component.send('onSelectMonth', monthAndyear, true);
      }
    },

    onShowContentResources(date, competencyIndex, activityIndex) {
      $(`.content-${date}-${competencyIndex}-${activityIndex}`).slideToggle();
    },

    onToggleCollapse(index) {
      this.set('expandIndex', this.get('expandIndex') !== index ? index : null);
    },

    /**
     * Close range date picker
     */

    onCloseDatePicker() {
      this.$('.student-rangepicker-container').hide();
      this.set('isCalendarEnable', false);
    },

    /**
     * Select from date and to date while submit
     */

    onChangeDateForStudent(startDate, endDate) {
      let component = this;
      component.set('rangeStartDate', moment(startDate).format('YYYY-MM-DD'));
      component.set('rangeEndDate', moment(endDate).format('YYYY-MM-DD'));
      component.loadStudentSummaryReportData();
      component.send('closeDatePicker');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isDaily
   */
  isDaily: true,

  /**
   * @property {String} forMonth
   */
  forMonth: Ember.computed(function() {
    return moment().format('MM');
  }),

  /**
   * @property {String} forYear
   */
  forYear: Ember.computed(function() {
    return moment().format('YYYY');
  }),

  /**
   * Set custom range start date
   */
  rangeStartDate: null,

  /**
   * Set custom range end date
   */
  rangeEndDate: Ember.computed(function() {
    return moment()
      .endOf('day')
      .format('YYYY-MM-DD');
  }),

  /**
   * @property {String} classStartDate
   */
  classStartDate: Ember.computed('class.startDate', function() {
    if (this.get('class.startDate')) {
      return moment(this.get('class.startDate')).format('YYYY-MM-DD');
    }
    return moment()
      .subtract(1, 'M')
      .format('YYYY-MM-DD');
  }),

  /**
   * @property {Number} expandIndex
   * Default 0 => first index expand
   */
  expandIndex: 0,

  isNext: Ember.computed('rangeEndDate', 'isDateRange', function() {
    let rangeEndDate = this.get('rangeEndDate');
    let today = moment().format('YYYY-MM-DD');
    let isDateRange = this.get('isDateRange');
    return isDateRange || moment(today).isSameOrBefore(rangeEndDate);
  }),

  isPrevious: Ember.computed(
    'rangeStartDate',
    'rangeEndDate',
    'isDateRange',
    function() {
      let rangeStartDate = this.get('rangeStartDate');
      let rangeEndDate = this.get('rangeEndDate');
      let isDateRange = this.get('isDateRange');
      let classStartDate = moment(this.get('classStartDate')).format(
        'YYYY-MM-DD'
      );
      return (
        isDateRange ||
        moment(classStartDate).isSameOrAfter(
          rangeStartDate ? rangeStartDate : rangeEndDate
        )
      );
    }
  ),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentsTimespentSummaryreport
   * Method to fetch students class timespent summary report
   */
  fetchStudentsTimespentSummaryreport() {
    const component = this;
    const classId = component.get('classId');
    const startDate = component.get('rangeStartDate');
    const endDate = component.get('rangeEndDate');
    const dataParam = {
      classId: classId,
      to: endDate
    };
    if (startDate) {
      dataParam.from = startDate;
    }
    return component
      .get('reportService')
      .fetchStudentsTimespentSummaryreport(dataParam);
  },

  /**
   * @function parseStudentsTimespentSummaryReportData
   * Method to parse students timespent summary report
   */
  parseStudentsTimespentSummaryReportData(studentTimespentData) {
    const component = this;
    let studentCompetenciesReport = Ember.A([]);
    studentTimespentData.map(reportData => {
      let timespentData = reportData.get('data');
      let competenciesObj = Ember.Object.create({
        reportDate: reportData.get('reportDate'),
        competency: Ember.A([]),
        totalTimespent: null
      });
      timespentData.map(data => {
        let totalTimespentByDate =
          competenciesObj.get('totalTimespent') + data.get('totalTimespent');
        competenciesObj.set('totalTimespent', totalTimespentByDate);
        let competencies = data.get('competencies');
        let sessionsData = data.get('sessions');
        let resources = Ember.A([]);
        sessionsData.map(data => {
          if (data.contents) {
            data.contents.map(content => {
              let existResources = resources.findBy('id', content.id);
              if (existResources) {
                existResources.timespent =
                  existResources.timespent + content.timespent;
              } else {
                resources.pushObject(content);
              }
            });
          }
        });
        if (competencies) {
          let competencyData = competenciesObj.get('competency');
          let competenciesLeg = competencies.length;
          if (competenciesLeg > 1) {
            let groupCompetency = getObjectsDeepCopy(competencies);
            let competency = competencies.get('firstObject');
            let code = competency.code;
            let existCompetency = competencyData.findBy('code', code);
            if (existCompetency && existCompetency.groupCompetency) {
              let existGroupCompetency = existCompetency.groupCompetency;
              let groupCompetencyLeg = groupCompetency.length;
              let existGroupCompetencyLeg = existGroupCompetency.length;
              let lastIndexofGroupCompetencyLeg = groupCompetencyLeg - 1;
              if (existGroupCompetencyLeg === groupCompetencyLeg) {
                for (let index = 0; index < groupCompetencyLeg; index++) {
                  let isSameCompetency = existGroupCompetency.findBy(
                    'code',
                    groupCompetency[index].get('code')
                  );
                  if (isSameCompetency) {
                    if (lastIndexofGroupCompetencyLeg === index) {
                      let activities = existCompetency.activities;
                      activities.pushObject(
                        component.createActivityObj(data, resources)
                      );
                    }
                  } else {
                    let activities = Ember.A([]);
                    activities.pushObject(
                      component.createActivityObj(data, resources)
                    );
                    competency.groupCompetency = groupCompetency;
                    competency.activities = activities;
                    competencyData.push(competency);
                    break;
                  }
                }
              } else {
                let activities = Ember.A([]);
                activities.pushObject(
                  component.createActivityObj(data, resources)
                );
                competency.groupCompetency = groupCompetency;
                competency.activities = activities;
                competencyData.push(competency);
              }
            } else {
              let activities = Ember.A([]);
              activities.pushObject(
                component.createActivityObj(data, resources)
              );
              competency.groupCompetency = groupCompetency;
              competency.activities = activities;
              competencyData.push(competency);
            }
          } else {
            competencies.map(competency => {
              let code = competency.code;
              let existCompetency = competencyData.findBy('code', code);
              if (existCompetency && !existCompetency.groupCompetency) {
                let activities = existCompetency.activities;
                activities.pushObject(
                  component.createActivityObj(data, resources)
                );
              } else {
                let activities = Ember.A([]);
                activities.pushObject(
                  component.createActivityObj(data, resources)
                );
                competency.activities = activities;
                competencyData.push(competency);
              }
            });
          }
        } else {
          // Group all collection/assessment into a "Not tagged to competency (NTC)" card
          let competencyData = competenciesObj.get('competency');
          let code = 'NTC';
          let existCompetency = competencyData.findBy('code', code);
          if (existCompetency) {
            let activities = existCompetency.activities;
            activities.pushObject(component.createActivityObj(data, resources));
          } else {
            let competency = Ember.Object.create({
              code: code,
              title: component.get('i18n').t('not-tagged-competency')
            });
            let activities = Ember.A([]);
            activities.pushObject(component.createActivityObj(data, resources));
            competency.activities = activities;
            competencyData.push(competency);
          }
        }
      });
      studentCompetenciesReport.push(competenciesObj);
    });
    component.set(
      'studentCompetenciesReport',
      studentCompetenciesReport.sortBy('reportDate').reverse()
    );
  },

  /**
   * @function parseStudentCompetencyStats
   * Method help to generate competency report view
   */
  parseStudentCompetencyStats(timespentData, studentCompetencyData) {
    const competenciesBucket = Ember.A();
    timespentData.forEach(reportData => {
      reportData.data.forEach(data => {
        let sessionsData = data.get('sessions');
        let courseMapData = sessionsData.map(data => {
          return data.content_source;
        });
        if (
          data.competencies &&
          (data.format === 'assessment' || data.format === 'offline-activity')
        ) {
          data.competencies.forEach(competency => {
            let existingComp = competenciesBucket.findBy(
              'code',
              competency.code
            );
            if (!existingComp || data.isSuggestion) {
              competency.score = data.score;
              competency.attempts = data.sessions.length;
              competency.lastestActivity = data;
              competency.activityDate = reportData.reportDate;
              competency.courseMapData = courseMapData[0] || '';
              if (data.isSuggestion) {
                competency.title = data.title;
                competency.isSuggestion = true;
              }
              competency.sessions = data.sessions;
              competency.source = data.source;
              competency.status = data.status;
              competenciesBucket.pushObject(Ember.Object.create(competency));
            } else {
              existingComp.sessions = existingComp.sessions
                .concat(data.sessions)
                .uniqBy('id');
              let hasCurrentMax =
                parseInt(data.score, 0) > parseInt(existingComp.score, 0);
              existingComp.set(
                'score',
                Math.max(data.score, existingComp.score)
              );
              existingComp.set(
                'lastestActivity',
                hasCurrentMax ? data : existingComp.lastestActivity
              );
              existingComp.set('attempts', existingComp.sessions.length);
              // existingComp.incrementProperty('attempts');
              existingComp.set(
                'activityDate',
                hasCurrentMax
                  ? reportData.reportDate
                  : existingComp.activityDate
              );
            }
          });
        }
      });
    });
    studentCompetencyData.new.map(item => {
      item.format = CONTENT_TYPES.ASSESSMENT;
      item.id = item.assessment_id;
      item.type = CONTENT_TYPES.ASSESSMENT;
      item.activityDate = item.report_date;
    });
    studentCompetencyData.diagnostic.map(item => {
      item.format = CONTENT_TYPES.ASSESSMENT;
      item.id = item.assessment_id;
      item.type = CONTENT_TYPES.ASSESSMENT;
      item.activityDate = item.report_date;
    });
    studentCompetencyData.reinforced.map(item => {
      item.format = CONTENT_TYPES.ASSESSMENT;
      item.id = item.assessment_id;
      item.type = CONTENT_TYPES.ASSESSMENT;
      item.activityDate = item.report_date;
    });

    this.set('studentCompetencyData', studentCompetencyData);
    this.set('competenciesBucket', competenciesBucket);
  },

  /**
   * @function createActivityObj
   * Method to create activity object
   */
  createActivityObj(data, resources) {
    return Ember.Object.create({
      id: data.get('id'),
      title: data.get('title'),
      format: data.get('format'),
      totalTimespent: data.get('totalTimespent'),
      sessions: data.get('sessions'),
      score: data.get('score'),
      isCollection:
        data.get('format') ===
        (CONTENT_TYPES.COLLECTION || CONTENT_TYPES.EXTERNAL_COLLECTION),
      resources: resources,
      resourceCount: resources.filterBy('type', 'resource').length,
      questionCount: resources.filterBy('type', 'question').length
    });
  }
});
