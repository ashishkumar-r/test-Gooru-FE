import Ember from 'ember';
import d3 from 'd3';
import { getGradeColor, isCompatibleVW } from 'gooru-web/utils/utils';
import { SCREEN_SIZES, ATC_CHART_FILTER } from 'gooru-web/config/config';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['navigator-atc-view'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * Analytics Service
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.applyChartFilter();
  },

  didDestroyElement() {
    const component = this;
    component.set('atcPerformanceSummary', Ember.A([]));
    component.set('initialSkylineSummary', Ember.A([]));
  },

  // -------------------------------------------------------------------------
  // Observers
  observeMonthChange: Ember.observer('month', 'year', function() {
    const component = this;
    component.applyChartFilter();
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on competencie count
    onShowStudentLocater() {
      const component = this;
      const classId = component.get('classId');
      component
        .get('router')
        .transitionTo('teacher.class.students-proficiency', classId);
    },

    //Action triggered when click on student perf in tooltip
    onShowStudentPerformance(student, type) {
      const component = this;
      const classId = component.get('classId');
      component.$('.navigator-atc-tooltip').removeClass('active');
      let queryParams = {
        studentId: student.get('id')
      };
      let redirectTo = 'student-learner-proficiency';
      if (type === 'report') {
        queryParams.tab = 'student-report';
        redirectTo = 'course-map';
      }
      component
        .get('router')
        .transitionTo(`teacher.class.${redirectTo}`, classId, {
          queryParams
        });
    },

    onResetZoom() {
      this.drawAtcChart();
      this.set('isZoomed', false);
    },

    onSelectStudent(studentData) {
      const component = this;
      component.set(
        'tooltipInterval',
        component.studentProficiencyInfoTooltip(
          studentData,
          this.$('.navigator-atc-student-list').position()
        )
      );
      if (component.get('isMobileView')) {
        const nodeElement = component.$(`.node-${studentData.get('seq')}`);
        component.set('isShowTooltip', true);
        component.$(nodeElement).addClass('active-node');
        let selectedNodePos = component.$(nodeElement).position();
        component.highlightStudentProfile(selectedNodePos);
      }
    },

    onCloseTooltip() {
      const component = this;
      component.removeTooltip();
      component.$('.navigator-atc-student-list').addClass('active');
    },

    onCloseListCard() {
      const component = this;
      component.removeStudentListCard();
      component.set('isShowListCard', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} course
   */
  course: Ember.computed.alias('classData.course'),

  /**
   * @property {UUID} classId
   */
  classId: Ember.computed.alias('classData.id'),

  /**
   * @property {UUID} courseId
   */
  courseId: Ember.computed.alias('course.id'),

  /**
   * @property {Array} students
   */
  students: Ember.computed.alias('classData.members'),

  /**
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed.alias('classData.preference.subject'),

  /**
   * @property {String} subjectCode
   */
  fwCode: Ember.computed.alias('classData.preference.framework'),

  /**
   * @property {Date} firstDayOfMonth
   */
  firstDayOfMonth: Ember.computed('month', 'year', function() {
    const component = this;
    let month = component.get('month');
    let year = component.get('year');
    let date = `${year}-${month}-01`;
    return moment(date).format('YYYY-MM-DD');
  }),

  /**
   * @property {Boolean} isMobileView
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * @property {Boolean} isShowTooltip
   */
  isShowTooltip: false,

  /**
   * @property {Array} atcPerformanceSummary
   * Property to for atc performance summary data set
   */
  atcPerformanceSummary: Ember.A([]),

  /**
   * @property {Array} initialSkylineSummary
   * Property to for initial skyline summary data set
   */
  initialSkylineSummary: Ember.A([]),

  /**
   * @property {Boolean} isZoomed
   * Property to show/hide reset chart button
   */
  isZoomed: false,

  groupedStudentList: Ember.A([]),

  tooltipInterval: null,

  studentListTooltipInterval: null,

  /**
   * @property {Boolean} isShowListCard
   * Property to check whether the list card is visible or not (only for mobile devices)
   */
  isShowListCard: false,

  /**
   * @property {Array} chartFilterList
   * Property holding the atc chart filter list
   */
  chartFilterList: Ember.computed(function() {
    return Ember.A(
      ATC_CHART_FILTER.map(item => {
        return Ember.Object.create(item);
      })
    );
  }),

  selectedChartFilterList: Ember.computed('chartFilterList', function() {
    let chartFilterList = this.get('chartFilterList');
    let isAtcViewDefaultProgressSelection = this.get(
      'isAtcViewDefaultProgressSelection'
    );

    if (isAtcViewDefaultProgressSelection) {
      let actDefaultSelection = chartFilterList.find(item => {
        if (item.tenantKey === isAtcViewDefaultProgressSelection) {
          return item;
        }
      });
      return actDefaultSelection;
    } else {
      return this.get('chartFilterList.firstObject');
    }
  }),

  /**
   * @property {Boolean} isExcludeInferred
   * Property help to check the class grade filter
   */
  isExcludeInferred: false,

  isInitialSkyline: false,
  /**
   * @property {Array} gradeCompetencies
   * Properties helpt to hold grade with competency count
   */
  gradeCompetencies: Ember.A(),

  /**
   * @property {Boolean} isShowGradeCompetency
   * Property help to identify the is grade competency are showing on chart or not
   */
  isShowGradeCompetency: false,

  isCheckedExclude: false,

  isOverAllCompetency: true,

  // -------------------------------------------------------------------------
  // Functions

  /**
   * @function loadClassAtcData
   * Method to load atc chart data
   */
  loadClassAtcData(selectedFilter = {}) {
    const component = this;
    Ember.RSVP.hash({
      atcPerformance: component.fetchClassAtcPerforamnceSummary(selectedFilter),
      grades: component.getGradeCompetencyCount()
    }).then(function({ atcPerformance, grades }) {
      component.pageGradeCompetencies(grades);
      let students = component.get('students');
      component.set(
        'atcPerformanceSummary',
        component.parseClassAtcPerformanceSummary(students, atcPerformance)
      );
      component.drawAtcChart();
    });
  },

  /**
   * @function loadInitialSkyline
   * Method to load atc chart data
   */
  loadInitialSkyline() {
    const component = this;
    let hasData =
      component.get('initialSkylineSummary') &&
      component.get('initialSkylineSummary').length;
    if (component.get('isInitialSkyline') && !hasData) {
      let selectedFilter = {
        fetchClassStats: true
      };
      Ember.RSVP.hash({
        initialSkyline: component.fetchInitialSkyline(),
        atcPerformance: component.fetchClassAtcPerforamnceSummary(
          selectedFilter
        )
      }).then(function({ initialSkyline, atcPerformance }) {
        let students = component.get('students');
        component.set(
          'initialSkylineSummary',
          component.parseInitialSkylineSummary(
            students,
            initialSkyline,
            atcPerformance
          )
        );
        component.drawAtcChart();
      });
    } else {
      let atcPerformanceSummary =
        component.get('atcPerformanceSummary') &&
        component.get('atcPerformanceSummary').length;
      if (!atcPerformanceSummary) {
        component.applyChartFilter();
      } else {
        component.drawAtcChart();
      }
    }
  },

  pageGradeCompetencies(grades) {
    let component = this;
    let selectedChartFilterList = component.get(
      'selectedChartFilterList.filterKey'
    );
    let isClassView = !!(selectedChartFilterList === 'class');
    component.set('isOverAllCompetency', isClassView);
    const upperBound = component.get('classData.gradeUpperBound');
    const gradeCurrent = component.get('classData.gradeCurrent');
    const ubGrade = grades.findBy('id', upperBound);
    let currentGrade = grades.find(item => item.id === gradeCurrent);
    component.set('currentGrade', currentGrade);
    const startGrade = grades.findBy('sequence', 1);
    component.set('startGrade', startGrade);
    let gradesUnderDestination = grades.filter(
      grade => grade.sequence <= ubGrade.sequence
    );
    let totalCompetencies = 0;
    gradesUnderDestination.map(grade => {
      totalCompetencies += grade.totalCompetencies;
      grade.set('totalCompetencies', totalCompetencies);
      return grade;
    });
    component.set('gradeCompetencies', gradesUnderDestination);
  },

  /**
   * @function parseClassAtcPerformanceSummary
   * Method to parse atch performance summary data
   */
  parseClassAtcPerformanceSummary(students, performanceSummary) {
    const component = this;
    let parsedPerformanceSummary = Ember.A([]);
    let totalMasteredCompetencies = 0;
    if (students && students.length) {
      students.forEach((student, index) => {
        let studentPerformanceData = Ember.Object.create({
          id: student.id,
          thumbnail: student.avatarUrl,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.lastName}, ${student.firstName}`,
          percentScore: 0,
          completedCompetencies: 0,
          isActive: student.isActive
        });
        let studentPerformanceSummary = performanceSummary.findBy(
          'userId',
          student.id
        );
        if (studentPerformanceSummary) {
          let inferredCompetencies = !component.get('isExcludeInferred')
            ? studentPerformanceSummary.inferredCompetencies
            : 0;
          let assertedCompetencies = studentPerformanceSummary.assertedCompetencies
            ? studentPerformanceSummary.assertedCompetencies
            : 0;
          totalMasteredCompetencies +=
            studentPerformanceSummary.completedCompetencies +
            inferredCompetencies +
            studentPerformanceSummary.masteredCompetencies +
            assertedCompetencies;
          let notStartedCompetencies =
            studentPerformanceSummary.totalCompetencies -
            (studentPerformanceSummary.completedCompetencies +
              studentPerformanceSummary.inprogressCompetencies +
              inferredCompetencies +
              assertedCompetencies);
          let completedCompetency =
            studentPerformanceSummary.completedCompetencies +
            inferredCompetencies +
            assertedCompetencies;
          studentPerformanceData.set(
            'totalCompetencies',
            studentPerformanceSummary.totalCompetencies
          );
          studentPerformanceData.set(
            'completedCompetencies',
            completedCompetency
          );
          studentPerformanceData.set(
            'masteredCompetencies',
            studentPerformanceSummary.masteredCompetencies
          );
          studentPerformanceData.set(
            'inferredCompetencies',
            studentPerformanceSummary.inferredCompetencies
          );
          studentPerformanceData.set(
            'assertedCompetencies',
            studentPerformanceSummary.assertedCompetencies
          );
          studentPerformanceData.set(
            'inprogressCompetencies',
            studentPerformanceSummary.inprogressCompetencies
          );
          studentPerformanceData.set(
            'notStartedCompetencies',
            notStartedCompetencies
          );
          studentPerformanceData.set(
            'percentCompletion',
            studentPerformanceSummary.percentCompletion
          );
          studentPerformanceData.set(
            'percentScore',
            studentPerformanceSummary.percentScore
          );
          studentPerformanceData.set(
            'gradeId',
            studentPerformanceSummary.gradeId || '--'
          );

          studentPerformanceData.set(
            'grade',
            studentPerformanceSummary.grade || '--'
          );
          studentPerformanceData.set('seq', index + 1);
          if (studentPerformanceData.isActive) {
            parsedPerformanceSummary.push(studentPerformanceData);
          }
        }
      });
    }
    component.set('totalMasteredCompetencies', totalMasteredCompetencies);
    return parsedPerformanceSummary;
  },

  parseInitialSkylineSummary(students, initialSkyline, atcPerformance) {
    let component = this;
    let gradeCompetencies = component.get('gradeCompetencies');
    let parsedPerformanceSummary = Ember.A([]);
    let totalMasteredCompetencies = 0;
    if (students && students.length) {
      students.forEach(student => {
        let memberGradeBounds = component.get('classData.memberGradeBounds');
        let studentBound = memberGradeBounds.findBy(student.id);
        let upperBound = gradeCompetencies.find(
          item => item.id === studentBound[student.id].grade_upper_bound
        );
        let lowerBound = gradeCompetencies.find(
          item => item.id === studentBound[student.id].grade_lower_bound
        );
        let startLevel = lowerBound ? lowerBound.totalCompetencies : 0;
        if (lowerBound && upperBound) {
          let gradeComp = gradeCompetencies.find(
            item => item.sequence === lowerBound.sequence - 1
          );
          startLevel =
            lowerBound.totalCompetencies === upperBound.totalCompetencies
              ? gradeComp
                ? gradeComp.totalCompetencies
                : 0
              : startLevel;
        }

        let studentPerformanceData = Ember.Object.create({
          id: student.id,
          thumbnail: student.avatarUrl,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.lastName}, ${student.firstName}`,
          percentScore: 0,
          completedCompetencies: 0,
          isActive: student.isActive,
          startPosition: startLevel,
          endPosition: upperBound ? upperBound.totalCompetencies : 0
        });

        let studentInitialSkyline = initialSkyline.findBy('userId', student.id);
        let studentAtcPerformance = atcPerformance.findBy('userId', student.id);

        if (studentAtcPerformance) {
          studentPerformanceData.completedCompetencies =
            studentAtcPerformance.completedCompetencies +
            studentAtcPerformance.inferredCompetencies +
            studentAtcPerformance.masteredCompetencies +
            studentAtcPerformance.assertedCompetencies;
        }
        if (studentInitialSkyline) {
          totalMasteredCompetencies +=
            studentInitialSkyline.completedCompetencies +
            studentInitialSkyline.inferredCompetencies +
            studentInitialSkyline.masteredCompetencies +
            studentInitialSkyline.assertedCompetencies;

          let count =
            studentPerformanceData.completedCompetencies -
            studentPerformanceData.startPosition;
          studentPerformanceData.completedCompetencies = count > 0 ? count : 0;
          parsedPerformanceSummary.push(studentPerformanceData);
        }
      });
    }
    component.set('totalInitialSkyline', totalMasteredCompetencies);
    return parsedPerformanceSummary;
  },

  /**
   * @function fetchClassAtcPerforamnceSummary
   * Method to fetch class atc performance summary
   */
  fetchClassAtcPerforamnceSummary(selectedFilter = {}) {
    const component = this;
    const analyticsService = component.get('analyticsService');
    let classId = component.get('classId');
    let subjectCode = component.get('subjectCode');
    let filters = {
      month: component.get('month'),
      year: component.get('year')
    };
    filters = Object.assign(selectedFilter, filters);
    return Ember.RSVP.resolve(
      analyticsService.getAtcPerformanceSummaryPremiumClass(
        classId,
        subjectCode,
        filters
      )
    );
  },

  /**
   * @function fetchClassAtcPerforamnceSummary
   * Method to fetch class atc performance summary
   */
  fetchInitialSkyline(selectedFilter = {}) {
    const component = this;
    const analyticsService = component.get('analyticsService');
    let classId = component.get('classId');
    let subjectCode = component.get('subjectCode');
    let filters = {
      month: component.get('month'),
      year: component.get('year')
    };
    let fwCode = component.get('fwCode');
    filters = Object.assign(selectedFilter, filters);
    return Ember.RSVP.resolve(
      analyticsService.getInitialSkyline(classId, subjectCode, filters, fwCode)
    );
  },

  /**
   * @function drawAtcChart
   * Method to draw atc chart
   */
  drawAtcChart() {
    const component = this;
    let isInitialSkyline = component.get('isInitialSkyline');
    let initialSkylineSummary = component.get('initialSkylineSummary');
    let atcPerformanceSummary = component.get('atcPerformanceSummary');
    let dataset = isInitialSkyline
      ? initialSkylineSummary
      : atcPerformanceSummary;
    let gradeCounts = component.get('gradeCompetencies');
    let isShowGradeCompetency = component.get('isShowGradeCompetency');
    let selectedChartFilterList = component.get(
      'selectedChartFilterList.filterKey'
    );
    let isClassView = !!(selectedChartFilterList === 'class');
    component.$('svg').remove();
    var margin = {
        top: 50,
        right: 20,
        bottom: 30,
        left: 50
      },
      width = 900 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;

    let xScaleLabel = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    let competecyCounts =
      isClassView && !isInitialSkyline
        ? xScaleLabel
        : gradeCounts.mapBy('totalCompetencies');
    const maxTickValue =
      isClassView && !isInitialSkyline
        ? 100
        : d3.max(gradeCounts, function(d) {
          return d.totalCompetencies;
        });
    var xScale = d3.scale
      .linear()
      .domain([0, maxTickValue])
      .range([0, width])
      .nice();

    var yScale = d3.scale
      .linear()
      .domain([0, 100])
      .range([height, 0]);
    let xAxis;
    if (isClassView && !isInitialSkyline) {
      xAxis = d3.svg
        .axis()
        .scale(xScale)
        .orient('bottom')
        .innerTickSize(-height)
        .outerTickSize(0)
        .tickPadding(10);
    } else {
      xAxis = d3.svg
        .axis()
        .scale(xScale)
        .orient('bottom')
        .innerTickSize(-height)
        .outerTickSize(0)
        .tickPadding(10)
        .tickValues(competecyCounts);
    }

    var xAxisTop = d3.svg
      .axis()
      .scale(xScale)
      .orient('top')
      .tickValues(competecyCounts)
      .tickFormat((d, i) =>
        i % 2 === 0 || (isClassView && !isInitialSkyline)
          ? ''
          : gradeCounts[i].name
      )
      .outerTickSize(0)
      .tickPadding(10);

    dataset.forEach(studentData => {
      let allCompetency =
        studentData.completedCompetencies + studentData.masteredCompetencies;
      let xScaleValue =
        isClassView && !isInitialSkyline
          ? (allCompetency / studentData.totalCompetencies) * 100
          : studentData.completedCompetencies;
      let xValue = xScale(xScaleValue).toFixed(2);
      studentData.set('xAxis', xValue && xValue !== 'NaN' ? xValue : 0);
      studentData.set('yAxis', yScale(studentData.percentScore).toFixed(2));
    });

    dataset = component.groupItemsByPos(dataset);
    var yAxis = d3.svg
      .axis()
      .scale(yScale)
      .orient('left')
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);

    var chartZoomConfig = d3.behavior
      .zoom()
      .scaleExtent([1, Infinity])
      .x(xScale)
      .y(yScale);

    let svgWidth = width + margin.left + margin.right;
    let svgHeight = height + margin.top + margin.bottom + 20;
    let studentNodeHeight =
      initialSkylineSummary.length > 7
        ? initialSkylineSummary.length * 55
        : 360;
    var svg = d3
      .select(component.element)
      .append('svg')
      .attr('class', 'navigator-atc-chart')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .call(chartZoomConfig)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const studentNodes = svg.append('g').attr('class', 'student-nodes');

    svg
      .append('g')
      .attr('class', `x axis ${!isShowGradeCompetency ? 'no-grid' : ''}`)
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('class', `x1 axis ${!isShowGradeCompetency ? 'hidden' : ''}`)
      .attr('transform', 'translate(0,0)')
      .call(xAxisTop);

    svg
      .append('g')
      .attr('class', `y axis ${isInitialSkyline ? 'hide' : ''}`)
      .call(yAxis);

    svg
      .append('g')
      .attr('transform', 'translate(-460, 490) rotate(-90)')
      .append('text')
      .attr('class', `placeholder ${isInitialSkyline ? 'hide' : ''}`)
      .attr('x', '130')
      .attr('y', '445')
      .text(
        component.get('poChartyAxisLabel')
          ? component.get('poChartyAxisLabel')
          : component
            .get('i18n')
            .t('teacher-landing.class.class-management-tab.performance')
            .string
      );

    svg
      .append('g')
      .attr('transform', 'translate(-50, -51)')
      .append('text')
      .attr('class', `placeholder ${isInitialSkyline ? 'skyline' : ''}`)
      .attr('x', '50')
      .attr('y', '415')
      .text(
        isInitialSkyline
          ? component.get('i18n').t('progress-from-class-start').string
          : component.get('i18n').t('common.progress').string
      );

    let xAxisDropdown = d3
      .select('svg')
      .append('foreignObject')
      .attr('transform', 'translate(0, -30)')
      .attr('x', '118')
      .attr('y', '428')
      .attr('width', 120)
      .attr('height', 50)
      .append('xhtml:div')
      .attr('class', `filter-dropdown ${isInitialSkyline ? 'hide' : ''}`);

    xAxisDropdown
      .append('select')
      .attr({
        id: 'grade-list',
        'aria-label': 'progress'
      })
      .selectAll('option')
      .data(component.get('chartFilterList'))
      .enter()
      .append('option')
      .text(d => component.get('i18n').t(d.name).string)
      .attr('value', d => d.filterKey);

    let checkbox = d3
      .select('svg')
      .append('foreignObject')
      .attr('transform', 'translate(0, -30)')
      .attr('x', '50')
      .attr('y', '450')
      .attr('width', width)
      .attr('height', 40)
      .append('xhtml:div')
      .attr('class', 'exclude-inferred');

    checkbox
      .append('div')
      .attr('class', `inferred-checkbox hide ${isInitialSkyline ? 'hide' : ''}`)
      .append('input')
      .attr('type', 'checkbox')
      .attr('aria-label', 'Inferred checkbox')
      .on('click', () => {
        component.toggleProperty('isExcludeInferred');
        component.applyChartFilter();
        component.toggleProperty('isCheckedExclude');
      })
      .property('checked', component.get('isExcludeInferred'));
    checkbox
      .select('.inferred-checkbox')
      .append('span')
      .text(component.get('i18n').t('atc-filter.exclude-inferred'));

    checkbox
      .append('div')
      .attr('class', `initial-skyline ${isClassView ? 'disable-event' : ''}`)
      .append('input')
      .attr('type', 'checkbox')
      .attr('aria-label', component.get('i18n').t('initial-skyline-location'))
      .on('click', () => {
        component.toggleProperty('isInitialSkyline');
        component.set(
          'isShowGradeCompetency',
          component.get('isInitialSkyline')
        );
        component.loadInitialSkyline();
      })
      .property('checked', isInitialSkyline);
    checkbox
      .select('.initial-skyline')
      .append('span')
      .text(component.get('i18n').t('initial-skyline-location'));

    checkbox
      .append('div')
      .attr(
        'class',
        `grade-grid ${
          this.get('isCheckedExclude') || isClassView ? 'disable-event' : ''
        }`
      )
      .call(() => {
        checkbox
          .select('.grade-grid')
          .append('span')
          .text(component.get('i18n').t('atc-chart.show-grades-competency'));
      })
      .append('input')
      .attr('type', 'checkbox')
      .attr('aria-label', 'Grade Checkbox')
      .attr('x', svgWidth)
      .on('click', () => {
        component.toggleProperty('isShowGradeCompetency');
        component.drawAtcChart();
      })
      .property('checked', component.get('isShowGradeCompetency'));

    xAxisDropdown
      .select('#grade-list')
      .on('change', () => {
        let filterKey = d3.event.target.value;
        component.set(
          'selectedChartFilterList',
          component.get('chartFilterList').findBy('filterKey', filterKey)
        );
        component.applyChartFilter();
      })
      .property('value', component.get('selectedChartFilterList.filterKey'));

    let tooltipInterval = null;
    let studentListTooltipInterval = null;
    let tooltip = d3
      .select(component.element)
      .append('div')
      .attr('class', 'navigator-atc-tooltip');
    let tooltipContainer = component.$('.navigator-atc-tooltip');
    let activeStudentContainer = component.$('.active-student-container');
    // Student list card tooltip config
    const studentListTooltip = d3
      .select(component.element)
      .append('div')
      .attr('class', 'navigator-atc-student-list');
    const studentListCardContainer = component.$('.navigator-atc-student-list');

    let studentNode = studentNodes
      .selectAll('.student-nodes')
      .data(dataset)
      .enter()
      .append('g')
      .attr('transform', function(d) {
        return `translate(${parseFloat(d.xAxis)}, ${parseFloat(d.yAxis) - 20})`;
      })
      .attr('class', function(d) {
        return `node-point node-${d.get('seq')}`;
      });

    tooltip.on('mouseout', function() {
      component.removeTooltip(tooltipInterval);
    });

    studentListTooltip.on('mouseout', () => {
      component.removeStudentListCard(studentListTooltipInterval);
    });

    tooltip.on('click', function() {
      component.removeTooltip(tooltipInterval);
    });

    if (!component.get('isMobileView')) {
      studentNode.on('mouseover', function(studentData) {
        let clientY = d3.event.clientY;
        let clientX = d3.event.clientX;
        let top = clientY > 420 ? clientY - 185 : clientY;
        let left = clientX > 600 ? clientX - 225 : clientX;
        top = d3.event.pageY;
        left = d3.event.pageX;
        let tooltipPos = {
          top: `${top}px`,
          left: `${left}px`
        };
        const groupedStudentList = dataset.filterBy(
          'group',
          studentData.get('group')
        );
        if (groupedStudentList.length > 1) {
          studentListTooltipInterval = component.setupStudentListTooltip(
            groupedStudentList,
            tooltipPos
          );
          component.set(
            'studentListTooltipInterval',
            studentListTooltipInterval
          );
        } else {
          tooltipInterval = component.studentProficiencyInfoTooltip(
            studentData,
            tooltipPos
          );
          component.set('tooltipInterval', tooltipInterval);
        }
      });

      tooltip.on('mouseover', function() {
        component.set('isShowTooltip', true);
        tooltipContainer.addClass('active');
      });

      studentListTooltip.on('mouseover', function() {
        studentListCardContainer.addClass('active');
      });

      studentNode.on('mouseout', function() {
        activeStudentContainer.addClass('hidden');
        studentListCardContainer.removeClass('active');
        component.removeTooltip(tooltipInterval);
      });
    } else {
      studentNode.on('click', function(studentData) {
        const groupedStudentList = dataset.filterBy(
          'group',
          studentData.get('group')
        );
        if (groupedStudentList.length > 1) {
          studentListTooltipInterval = component.setupStudentListTooltip(
            groupedStudentList
          );
          component.set(
            'studentListTooltipInterval',
            studentListTooltipInterval
          );
        } else {
          tooltipInterval = component.studentProficiencyInfoTooltip(
            studentData
          );
          component.set('isShowTooltip', true);
          component.set('isShowListCard', false);
          component.$(this).addClass('active-node');
          let selectedNodePos = component.$(this).position();
          component.highlightStudentProfile(selectedNodePos);
          component.set('tooltipInterval', tooltipInterval);
        }
      });
    }
    let profileOuterRadius = 16;
    if (!isInitialSkyline) {
      studentNode
        .append('circle')
        .attr('cx', 12)
        .attr('cy', 12)
        .attr('r', profileOuterRadius)
        .style('fill', function(d) {
          return getGradeColor(d.percentScore);
        });
    }
    let profileSize = isInitialSkyline ? 30 : 24;

    studentNode
      .append('svg:image')
      .attr('class', `student-profile ${isInitialSkyline ? 'hide' : 'show'}`)
      .attr('x', 0)
      .attr('y', 0)
      .attr({
        'xlink:href': function(d) {
          return d.thumbnail;
        },
        width: profileSize,
        height: profileSize
      });

    if (isInitialSkyline) {
      var studentSvg = d3
        .select(component.element)
        .append('div')
        .attr('class', 'student-section')
        .attr('width', svgWidth)
        .attr('height', 360)
        .style(
          'max-height',
          initialSkylineSummary.length > 5 ? '360px' : '370px'
        )
        .append('svg')
        .attr('class', 'navigator-atc-chart-skyline')
        .attr('width', svgWidth)
        .attr('height', studentNodeHeight)
        .call(chartZoomConfig);

      const studentProfile = studentSvg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('class', 'student-profile-details');

      let studentProfiles = studentProfile
        .selectAll('.bar-line')
        .data(dataset)
        .enter()
        .append('g')
        .attr('class', 'bar-line')
        .attr('transform', function(d, i) {
          return `translate(${xScale(d.startPosition)}, ${i * 50})`;
        });

      studentProfiles
        .append('line')
        .attr('stroke', 'white')
        .attr('stroke-width', '2px')
        .attr({
          x1: 0,
          y1: 0,
          x2: function(d) {
            return xScale(d.endPosition - d.startPosition);
          },
          y2: 0
        });

      studentProfiles
        .append('rect')
        .attr('stroke', 'white')
        .attr('stroke-width', '5px')
        .attr('class', 'completed-line')
        .attr('width', 0)
        .attr('height', 0.01)
        .attr('x', 0)
        .attr('y', 0);

      studentProfiles
        .select('.completed-line')
        .transition()
        .duration(5000)
        .attr('width', function(d) {
          let allCompetency = Math.abs(xScale(d.completedCompetencies));
          return allCompetency;
        });

      studentProfiles
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 7)
        .style('fill', 'white');

      studentProfiles
        .append('svg:image')
        .attr('class', 'student-profile')
        .attr('x', -15)
        .attr('y', -15)
        .attr('width', profileSize)
        .attr('height', profileSize)
        .attr({
          'xlink:href': function(d) {
            return d.thumbnail;
          }
        });

      studentProfiles
        .select('.student-profile')
        .transition()
        .duration(5000)
        .attr('x', function(d) {
          let allCompetency = xScale(d.completedCompetencies);
          return allCompetency - 15;
        });

      let downArrow = studentProfiles
        .append('foreignObject')
        .attr('class', 'position-arrow')
        .attr('x', -15)
        .attr('y', -20)
        .attr('width', 20)
        .attr('height', 20)
        .append('xhtml:div')
        .attr('class', 'count');

      downArrow
        .append('i')
        .attr('class', 'arrow_drop_down material-icons')
        .attr('x', 0)
        .attr('y', 0)
        .text('arrow_drop_down');

      studentProfiles
        .select('.position-arrow')
        .transition()
        .duration(5000)
        .attr('x', function(d) {
          let allCompetency = xScale(d.completedCompetencies);
          return allCompetency - 15;
        });

      let tag = studentProfiles
        .append('foreignObject')
        .attr('class', 'position-count')
        .attr('x', -15)
        .attr('y', -40)
        .attr('width', 30)
        .attr('height', 30)
        .append('xhtml:div')
        .attr('class', 'count');
      tag
        .append('span')
        .attr('class', 'total-count')
        .attr('x', 0)
        .attr('y', 0)
        .text(function(d) {
          let allCompetency = d.startPosition + d.completedCompetencies;
          return allCompetency;
        });

      studentProfiles
        .select('.position-count')
        .transition()
        .duration(5000)
        .attr('x', function(d) {
          let allCompetency = xScale(d.completedCompetencies);
          return allCompetency - 15;
        });
    }
    component.cleanUpChart();
    /**
     * @function zoomHandler
     * Method to handle zoom event and rerender chart points
     */
    function zoomHandler() {
      svg.select('.x.axis').call(xAxis);
      svg.select('.y.axis').call(yAxis);
      svg.select('.x1.axis').call(xAxisTop);

      let selectedChartFilterList = component.get(
        'selectedChartFilterList.filterKey'
      );
      let isClassView = !!(selectedChartFilterList === 'class');
      let isInitialSkyline = component.get('isInitialSkyline');
      studentNode
        // Reposition node point based on current axis level
        .attr('transform', function(d) {
          let allCompetency = d.completedCompetencies + d.masteredCompetencies;
          let xScaleValue =
            isClassView && !isInitialSkyline
              ? (allCompetency / d.totalCompetencies) * 100
              : d.completedCompetencies;

          let xPoint = xScale(xScaleValue).toFixed(2);
          let x1Point = xScale(xScaleValue).toFixed(2);
          let yPoint = yScale(d.percentScore).toFixed(2);
          d.set('xAxis', xPoint);
          d.set('x1Axis', x1Point);
          d.set('yAxis', yPoint);
          return `translate(${xPoint}, ${yPoint})`;
        })
        // Hide student node points after reach chart edge
        .attr('class', function(d) {
          let allCompetency = d.completedCompetencies + d.masteredCompetencies;
          let xScaleValue =
            isClassView && !isInitialSkyline
              ? (allCompetency / d.totalCompetencies) * 100
              : d.completedCompetencies;
          let xPoint = xScale(xScaleValue);
          let x1Point = xScale(xScaleValue);
          let yPoint = yScale(d.percentScore);
          let className = 'node-point';
          if (
            xPoint < 15 ||
            x1Point < 15 ||
            yPoint <= 0 ||
            xPoint >= svgWidth - 100 ||
            x1Point >= svgWidth - 100 ||
            yPoint >= svgHeight - 100
          ) {
            className += ' hidden';
          }
          return className;
        });
      component.cleanUpChart();
      component.set('isZoomed', true);
    }
    // Bind zoom handler with zoom event
    if (!isInitialSkyline) {
      chartZoomConfig.on('zoom', zoomHandler);
    }
  },

  /**
   * @function cleanUpChart
   * Method to clean up chart views as per requirement
   */
  cleanUpChart() {
    const component = this;
    const axes = ['x', 'y', 'x1'];
    let selectedChartFilterList = this.get('selectedChartFilterList.filterKey');
    let isClassView = !!(selectedChartFilterList === 'class');
    let isInitialSkyline = this.get('isInitialSkyline');
    axes.map(axis => {
      var axisContainer = d3.selectAll(this.$(`.${axis}.axis .tick`));
      axisContainer.attr('style', function() {
        var curAxisElement = d3.select(this);
        var curAxisText = curAxisElement.select('text');
        var curAxisTransform = d3.transform(curAxisElement.attr('transform'));
        var curAxisXpoint = curAxisTransform
          ? curAxisTransform.translate[0]
          : 0;
        var curAxisYpoint = curAxisTransform
          ? curAxisTransform.translate[1]
          : 0;
        var tickClass = 'tick';
        if (
          (axis === 'y' && curAxisYpoint > 260) ||
          (axis === 'x' && curAxisXpoint < 240)
        ) {
          tickClass += ' no-label';
        }
        curAxisElement.attr('class', tickClass);
        if (axis === 'y') {
          curAxisText.text(`${curAxisText.text()}%`);

          let curY = curAxisText.text();
          let axisYText = component.axisXYText(curY);
          curAxisText.text(axisYText);
        } else if (axis === 'x' && isClassView && !isInitialSkyline) {
          curAxisText.text(`${curAxisText.text()}%`);

          let curX = curAxisText.text();
          let axisXText = component.axisXYText(curX);
          curAxisText.text(axisXText);
        }
      });
    });
  },

  axisXYText(curXY) {
    let tempAxis = [];
    for (let curAxisChar of curXY) {
      if (!tempAxis.includes('%')) {
        tempAxis.push(curAxisChar);
      }
    }
    let curXYAxis = tempAxis.join('');
    return curXYAxis;
  },

  /**
   * @function studentProficiencyInfoTooltip
   * Method to show student info tooltip
   */
  studentProficiencyInfoTooltip(studentData, tooltipPos) {
    let component = this;
    component.set('studentData', studentData);
    let tooltip = component.$('.navigator-atc-tooltip');
    return Ember.run.later(function() {
      let tooltipHtml = component.$('.tooltip-html-container').html();
      tooltip.html(tooltipHtml);
      if (tooltipPos) {
        tooltip.css(tooltipPos);
      }
      component.$('.navigator-atc-tooltip').addClass('active');
    }, 500);
  },

  setupStudentListTooltip(studentList, tooltipPos) {
    const component = this;
    let tooltip = component.$('.navigator-atc-student-list');
    component.set('groupedStudentList', studentList);
    return Ember.run.later(function() {
      let cardContainer = component
        .$('.student-list-card-html-container')
        .html();
      tooltip.html(cardContainer);
      if (tooltipPos) {
        tooltip.css(tooltipPos);
      }
      component.$('.navigator-atc-student-list').addClass('active');
      component.set('isShowListCard', true);
    }, 500);
  },

  /**
   * @function highlightStudentProfile
   * Method to highlight selected student
   */
  highlightStudentProfile(position) {
    const component = this;
    return Ember.run.later(function() {
      let activeStudentContainer = component.$('.active-student-container');
      activeStudentContainer.css(position).removeClass('hidden');
    }, 500);
  },

  /**
   * @function removeTooltip
   * Method to remove tooltip from the atc chart
   */
  removeTooltip(tooltipInterval) {
    const component = this;
    component.set('isShowTooltip', false);
    component.$('.navigator-atc-tooltip').removeClass('active');
    component.$('.node-point').removeClass('active-node');
    Ember.run.cancel(tooltipInterval);
  },

  removeStudentListCard(tooltipInterval) {
    const component = this;
    component.$('.navigator-atc-student-list').removeClass('active');
    Ember.run.cancel(tooltipInterval);
    component.set('studentListTooltipInterval', null);
  },

  groupItemsByPos(dataset = Ember.A([])) {
    if (dataset.length) {
      const sortedByScoreDataset = dataset.sortBy('percentScore');
      for (let i = 0; i < sortedByScoreDataset.length; i++) {
        let sourceItem = sortedByScoreDataset[i];
        let sourceXaxis = parseFloat(sourceItem.get('xAxis'));
        let sourceYaxis = parseFloat(sourceItem.get('yAxis'));
        if (!sourceItem.get('group')) {
          for (let j = 0; j < sortedByScoreDataset.length; j++) {
            let compareItem = sortedByScoreDataset[j];
            let compareXAxis = parseFloat(compareItem.get('xAxis'));
            let compareYAxis = parseFloat(compareItem.get('yAxis'));
            let xDiff = Math.abs(sourceXaxis - compareXAxis);
            let yDiff = Math.abs(sourceYaxis - compareYAxis);
            let xDiffGroup = this.get('isMobileView') ? 30 : 20;
            let yDiffGroup = this.get('isMobileView') ? 16 : 8;
            if (xDiff <= xDiffGroup && yDiff <= yDiffGroup) {
              compareItem.set('group', i + 1);
            }
          }
        }
      }
      return sortedByScoreDataset;
    }
    return dataset;
  },

  /**
   * @function applyChartFilter
   * Method help to apply filter for pvc API
   */
  applyChartFilter() {
    const chartFilterList = this.get('selectedChartFilterList');
    const selectedFilter = Object.assign(
      {},
      chartFilterList.get('filterItems')
    );
    if (this.get('isExcludeInferred')) {
      selectedFilter.excludeInferred = true;
    }

    this.loadClassAtcData(selectedFilter);
  },

  /**
   * @function getGradeCompetencyCount help to fetch list for grades with competency count
   */
  getGradeCompetencyCount() {
    let component = this;
    let params = {
      subject: component.get('subjectCode'),
      fw_code: component.get('fwCode')
    };
    return component.get('analyticsService').getGradeCompetencyCount(params);
  }
});
