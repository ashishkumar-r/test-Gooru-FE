import Ember from 'ember';
import d3 from 'd3';
import {
  CLASS_SKYLINE_INITIAL_DESTINATION,
  SCREEN_SIZES
} from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['student-inspect-competency-chart'],

  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    component.set('isLoading', true);
    let maxHeight = this.$('.scrollable-chart').height() - 30;
    this.set('maxHeight', maxHeight);
    component.loadDataAndDrawChart();
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    let maxHeight = this.$('.scrollable-chart').height();
    this.$('.scrollable-chart').animate({ scrollTop: maxHeight });
  },

  // -------------------------------------------------------------------------
  // Observers

  doReDraw: Ember.observer('reDrawChart', function() {
    let component = this;
    let reDrawChart = component.get('reDrawChart');
    if (reDrawChart) {
      component.loadDataAndDrawChart();
    }
  }),

  drawGradeLineChart: Ember.observer('activeGrade', function() {
    let component = this;
    component.loadDataAndDrawChart();
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {},

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * Width of the cell
   * @type {Number}
   */
  cellWidth: 32,

  /**
   * height of the cell
   * @type {Number}
   */
  cellHeight: 6,

  /**
   * It will have selected taxonomy subject courses
   * @type {Object}
   */
  taxonomyDomains: Ember.A(),

  /**
   * @property {Array} route0Contents
   */
  route0Contents: null,

  /**
   * @property {Array} domainLevelSummary
   */
  domainLevelSummary: null,

  /**
   * @property {Boolean} isRoute0Chart
   */
  isRoute0Chart: false,

  /**
   * @property {JSON} activeGrade
   */
  activeGrade: null,

  /**
   * @property {String} subjectCode
   */
  subjectCode: '',

  /**
   * @property {Boolean} isProficiency
   */
  isProficiency: false,

  /**
   * @property {JSON} competencyStatus
   */
  competencyStatus: null,

  /**
   * Property used to identify whether to show directions or not.
   * @type {Boolean}
   */
  showDirections: Ember.computed.equal(
    'skylineInitialState.destination',
    CLASS_SKYLINE_INITIAL_DESTINATION.showDirections
  ),

  /**
   * Maintains the maximum Width of the chart.
   */
  maxWidth: Ember.computed(function() {
    const screenWidth = screen.width;
    return screenWidth <= SCREEN_SIZES.SMALL ? screenWidth - 15 : 550;
  }),

  /**
   * Maintains the maximum Height of the chart.
   */
  maxHeight: 300,

  /**
   * @property {Number} thresholdDomainCount
   * Property to maintain threshold domain count
   * Currently it refers to math subject domain size
   */
  thresholdDomainCount: 14,

  maxDomainSize: Ember.computed('proficiencyChartData', function() {
    return Math.max.apply(
      Math,
      this.get('proficiencyChartData').map(
        domain => domain.totalCompetencies || 0
      )
    );
  }),

  /**
   * @property {Array} proficiencyChartData
   * Property for list of domain chart data
   */
  proficiencyChartData: Ember.A([]),

  /**
   * @property {Array} skylinePoints
   * Property for list of skyline points for each domain
   */
  skylinePoints: Ember.A([]),

  /**
   * @property {Array} gradelinePoints
   * Property for list of gradeline points for each domain
   */
  gradelinePoints: Ember.A([]),

  /**
   * @property {Boolean} isDefaultSkyline
   * Property for draw char based on math level
   */
  isDefaultSkyline: false,

  /**
   * @property {Array} defaultSkylinePoints
   * Property for list of default skyline points for each domain
   */
  defaultSkylinePoints: Ember.A([]),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadDataBySubject
   * Method to fetch domain and co-ordinate data using subject id
   */
  loadChartData() {
    let component = this;
    let route0Contents = component.get('route0Contents');
    let domainBoundaries = component.get('domainBoundaries');
    let domainTopicSummary = component.get('domainTopicSummary');
    let domainTopicMetadata = component.get('domainTopicMetadata');
    // let route0Suggestions =
    //   route0Contents && route0Contents.status === 'pending'
    //     ? route0Contents.userCompetencyRoute.domains
    //     : null;
    if (component.get('isRoute0Chart') && component.get('isRoute0Applicable')) {
      if (domainTopicSummary && route0Contents && domainBoundaries) {
        component.parseDomainTopicCompetencyData(
          domainTopicSummary,
          domainTopicMetadata
        );
        component.parseGradeBoundaries(domainBoundaries);
      }
    } else {
      if (
        (domainTopicSummary && domainBoundaries) ||
        component.get('isProficiency')
      ) {
        component.parseDomainTopicCompetencyData(
          domainTopicSummary,
          domainTopicMetadata
        );
        component.parseGradeBoundaries(domainBoundaries);
      }
    }
  },

  drawDomainTopicChart() {
    const component = this;
    const proficiencyChartData = component.get('proficiencyChartData');
    if (proficiencyChartData && proficiencyChartData.length) {
      let cellWidth = component.get('cellWidth');
      let cellHeight = component.get('cellHeight');
      const maxWidth = component.get('maxWidth');
      const maxHeight = component.get('maxHeight');
      let extendedChartHeight = 15;
      const totalDomains = proficiencyChartData.length;
      const thresholdDomainCount = component.get('thresholdDomainCount');
      const maxCellsInDomain = Math.max.apply(
        Math,
        proficiencyChartData.map(function(o) {
          return o.totalCompetencies;
        })
      );
      const totalVerticalBars = component.get('isExpandChartEnabled')
        ? component.get('totalTopics')
        : totalDomains;
      let width = Math.round(totalVerticalBars * cellWidth) + 5;
      if (totalVerticalBars <= thresholdDomainCount || width < maxWidth) {
        cellWidth = Math.round(maxWidth / totalVerticalBars);
        component.set('cellWidth', cellWidth);
        width = Math.round(totalVerticalBars * cellWidth) + 5;
      }
      component.set('width', width);

      let height =
        component.get('maxDomainSize') * this.get('cellHeight') +
        extendedChartHeight;

      if (height < maxHeight) {
        cellHeight = Math.round(maxHeight / maxCellsInDomain);
        component.set('cellHeight', cellHeight);
        height = Math.round(maxCellsInDomain * cellHeight) + 5;
      }

      component.$('#student-inspect-competency-chart svg').remove();
      const svg = d3
        .select('#student-inspect-competency-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
      svg.append('g').attr('id', 'domains-group');
      svg.append('g').attr('id', 'skyline-group');
      svg.append('g').attr('id', 'gradeline-group');

      let filterContainer = svg
        .append('defs')
        .append('filter')
        .attr('id', 'shadow');
      filterContainer
        .append('feDropShadow')
        .attr('dx', '0')
        .attr('dy', '0')
        .attr('stdDeviation', '4');
      proficiencyChartData.map(domainChartData => {
        component.drawDomainChart(domainChartData);
      });
    }

    if (this.get('skylinePoints') && this.get('skylinePoints.length')) {
      if (component.get('isDefaultSkyline')) {
        this.drawDefaultSkyline();
      } else {
        this.drawProficiencySkyline();
      }
    }

    if (this.get('gradelinePoints') && this.get('gradelinePoints.length')) {
      this.drawGradeBoundaryLine();
    }
    component.$('.scrollable-chart').scrollTop(component.get('chartHeight'));
  },

  drawDomainChart(domainChartData) {
    const component = this;
    const domainSeq = domainChartData.domainSeq;
    let gradeBoundaries = component.get('domainBoundaries');
    const isNoSkylineData = gradeBoundaries && this.get('isDefaultSkyline');
    let domainHiLineCompSeq = 0;
    let isHiLineTopicCovered = false;
    if (isNoSkylineData) {
      const domainGradeBoundariesList = gradeBoundaries.filter(domain => {
        return domain.domainCode === domainChartData.domainCode;
      });
      domainChartData.topics.map(topic => {
        let domainGradeBoundaries = gradeBoundaries.find(grade => {
          return grade.domainCode === domainChartData.domainCode;
        });
        const topicBoundaries = domainGradeBoundariesList.find(
          item => item.topicCode && item.topicCode === topic.topicCode
        );
        if (topicBoundaries) {
          domainGradeBoundaries = topicBoundaries;
        }
        let skylineCompetencySeq =
          !isHiLineTopicCovered &&
          domainGradeBoundaries &&
          !domainGradeBoundaries.topicAverageComp &&
          topic.competencies
            ? topic.competencies.length
            : 0;
        if (
          (domainGradeBoundaries &&
            topic.topicCode === domainGradeBoundaries.topicCode) ||
          (domainGradeBoundaries &&
            topic.topicCode === domainGradeBoundaries.highlineTopic)
        ) {
          isHiLineTopicCovered = true;
          skylineCompetencySeq =
            topic.competencies.findIndex(
              competency =>
                competency.competencyCode ===
                (domainGradeBoundaries.topicAverageComp
                  ? domainGradeBoundaries.topicAverageComp
                  : domainGradeBoundaries.averageComp)
            ) + 1;
        }
        domainHiLineCompSeq = domainHiLineCompSeq + skylineCompetencySeq;
      });
    }

    const svg = d3.select('#domains-group');
    const cellWidth = component.get('cellWidth');
    const cellHeight = component.get('cellHeight');
    let competencySeq = -1;

    const domainGroup = svg.append('g').attr('id', `domain-group-${domainSeq}`);
    let transformX = cellWidth * (domainSeq - 1);

    domainGroup.attr('transform', `translate(${transformX}, 0)`);
    const domainCompetencyGroup = domainGroup
      .append('g')
      .attr('id', 'competencies-group');

    const groupedDomainCompetencies = new Array(
      domainChartData.totalCompetencies
    ).fill({});
    const competencyCells = domainCompetencyGroup
      .selectAll('.competency')
      .data(groupedDomainCompetencies);
    competencyCells
      .enter()
      .append('rect')
      .attr('class', (competency, index) => {
        const curPos = index + 1;
        let statusNumber =
          curPos <= domainChartData.masteredCompetencies
            ? '4'
            : curPos <=
              domainChartData.masteredCompetencies +
                domainChartData.inprogressCompetencies
              ? '1'
              : '0';
        if (isNoSkylineData) {
          statusNumber = curPos <= domainHiLineCompSeq ? '4' : '0';
        }
        return `competency-cell status-${statusNumber} competency
           fillArea${statusNumber}
            ${competency.isSkyLineCompetency ? 'skyline-competency' : ''}`;
      })
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', 0)
      .attr('y', () => {
        competencySeq++;
        return competencySeq * cellHeight;
      });
    competencyCells.exit().remove();
  },

  /**
   * @function loadDataAndDrawChart
   * Method is to fetch necessary data to draw chart
   */
  loadDataAndDrawChart() {
    let component = this;
    let competencyService = component.get('competencyService');
    let gradeId = component.get('activeGrade.id');
    let isPublic = component.get('isPublic');
    let studentId = component.get('userId');
    return Ember.RSVP.hash({
      domainTopicSummary: competencyService.fetchStudentDomainTopicCompetency(
        studentId,
        this.get('subjectCode')
      ),
      domainTopicMetadata: competencyService.fetchDomainTopicMetadata(
        this.get('subjectCode')
      )
    }).then(({ domainTopicSummary, domainTopicMetadata }) => {
      if (isPublic) {
        let domainTopicCompetencyMatrix = Ember.A([]);
        let domainTopicData = Ember.A([]);
        domainTopicSummary.map(domainopicMatrix => {
          domainopicMatrix.topics.map(topicMatrix => {
            let topicMatrixObj = {
              ...topicMatrix,
              ...this.groupCompetenciesByStatus(topicMatrix.competencies)
            };
            domainTopicData.push(Ember.Object.create(topicMatrixObj));
          });
          let domainMatrixObj = {
            ...domainopicMatrix,
            ...this.groupCompetenciesByTopic(domainTopicData)
          };
          domainTopicCompetencyMatrix.push(
            Ember.Object.create(domainMatrixObj)
          );
        });
        let masteredCompetencies = domainTopicCompetencyMatrix.find(domain => {
          return domain.masteredCompetencies > 0;
        });
        if (!masteredCompetencies && isPublic) {
          component.set('isDefaultSkyline', true);
          let tenantSetting = component.get('tenantSetting');
          let taxonomyGrades = component
            .get('taxonomyGrades')
            .sortBy('sequence');
          let independentCourses = component.get('independentCourses');
          let currentCourse = independentCourses.findBy(
            'id',
            component.get('courseId')
          );
          let frameworkId = currentCourse.get('settings.framework');
          let subjectCode = currentCourse.get('subject');
          const defaultGradeDiff = tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
            ? tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
            : null;
          const gradeDiff =
            tenantSetting.default_skyline_grade_diff &&
            tenantSetting.default_skyline_grade_diff[
              `${frameworkId}.${subjectCode}`
            ]
              ? tenantSetting.default_skyline_grade_diff[
                `${frameworkId}.${subjectCode}`
              ]
              : defaultGradeDiff;
          let gradeCurrent = currentCourse.get('settings.gradeCurrent');
          let courseLowerBound = taxonomyGrades.findBy('id', gradeCurrent);
          let gradeLowerBoundSeq = courseLowerBound.sequence - gradeDiff;
          if (gradeLowerBoundSeq >= 1) {
            let activeGrade = taxonomyGrades.findBy(
              'sequence',
              gradeLowerBoundSeq
            );
            gradeId = activeGrade.get('id');
          }
        }
      }
      component
        .get('taxonomyService')
        .fetchDomainGradeBoundaryBySubjectId(gradeId)
        .then(function(domainBoundaries) {
          component.set('domainBoundaries', domainBoundaries);
          component.set('domainTopicSummary', domainTopicSummary);
          component.set('domainTopicMetadata', domainTopicMetadata);
          component.loadChartData();
          let showDirections = component.get('showDirections');
          let isPremiumClass = component.get('isPremiumClass');
          if ((isPublic && isPremiumClass) || showDirections) {
            component.sendAction('onChartDrawComplete');
          }
          component.set('isLoading', false);
        });
    });
  },

  /**
   * @function populateGradeBoundaryLine
   * Method to draw domain boundary line
   */
  parseGradeBoundaries(gradeBoundaries) {
    let component = this;
    const proficiencyChartData = component.get('proficiencyChartData');
    const gradeBoundaryPoints = Ember.A([]);
    if (gradeBoundaries) {
      proficiencyChartData &&
        proficiencyChartData.map(domainData => {
          const domainGradeBoundariesList = gradeBoundaries.filterBy(
            'domainCode',
            domainData.get('domainCode')
          );
          let domainHiLineCompSeq = 0;
          const domainTopicPoints = {
            domainSeq: domainData.domainSeq,
            topics: [],
            isExpanded: !!domainData.get('isExpanded'),
            isHiLineAvailable: !!domainGradeBoundariesList.length,
            hiLineCompSeq: domainHiLineCompSeq
          };

          let isHiLineTopicCovered = false;
          let domainGradeBoundaries = gradeBoundaries.findBy(
            'domainCode',
            domainData.get('domainCode')
          );
          domainData.topics.map(topic => {
            let topicBoundaries = domainGradeBoundariesList.find(
              item => item.topicCode && item.topicCode === topic.topicCode
            );
            if (topicBoundaries) {
              domainGradeBoundaries = topicBoundaries;
            }
            let hiLineCompSeq =
              !isHiLineTopicCovered &&
              domainGradeBoundaries &&
              !domainGradeBoundaries.topicHighlineComp &&
              topic.competencies
                ? topic.competencies.length
                : 0;
            const topicBoundary = {
              topicSeq: topic.topicSeq,
              hiLineCompSeq
            };
            if (
              domainGradeBoundaries &&
              (topic.topicCode === domainGradeBoundaries.topicCode ||
                topic.topicCode === domainGradeBoundaries.highlineTopic)
            ) {
              isHiLineTopicCovered = true;
              hiLineCompSeq =
                topic.competencies.findIndex(
                  competency =>
                    competency.competencyCode ===
                    (domainGradeBoundaries.topicHighlineComp
                      ? domainGradeBoundaries.topicHighlineComp
                      : domainGradeBoundaries.highlineComp)
                ) + 1;
            }
            topicBoundary.hiLineCompSeq = hiLineCompSeq;
            domainTopicPoints.topics.push(Ember.Object.create(topicBoundary));
            domainHiLineCompSeq += hiLineCompSeq;
          });

          domainTopicPoints.hiLineCompSeq = domainHiLineCompSeq;
          gradeBoundaryPoints.push(Ember.Object.create(domainTopicPoints));
        });
    }
    component.set('gradeBoundaryPoints', gradeBoundaryPoints);
    component.drawGradeBoundaryLine();
  },

  drawGradeBoundaryLine() {
    const component = this;
    const gradeBoundaryPoints = component.get('gradeBoundaryPoints');
    let curBarPos = 0;
    let strokeDash = 0;

    d3.select('#gradeline-group polyline').remove();
    let points = '';
    gradeBoundaryPoints.forEach(domain => {
      const x1 = curBarPos * this.cellWidth;
      const x2 = x1 + this.cellWidth;
      const y1 = domain.hiLineCompSeq * this.cellHeight;
      const y2 = y1;
      strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
      points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
      curBarPos++;
    });
    d3.select('#gradeline-group')
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline')
      .attr('stroke-dasharray', strokeDash)
      .attr('stroke-dashoffset', strokeDash);
    const gradeFilter = d3
      .select('#gradeline-group')
      .append('defs')
      .append('filter')
      .attr('id', 'back-shadow');
    gradeFilter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '4');

    this.showDomainPopOver();
  },

  drawProficiencySkyline() {
    let points = '';
    d3.select('#skyline-group polyline').remove(); // Remove skyline, if exist

    let curBarPos = 0;
    let strokeDash = 0;
    this.get('skylinePoints').forEach(domain => {
      const x1 = curBarPos * this.cellWidth;
      const x2 = x1 + this.cellWidth;
      const y1 = domain.skylineCompetencySeq * this.cellHeight;
      const y2 = y1;
      strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
      points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
      curBarPos++;
    });

    d3.select('#skyline-group')
      .attr('class', 'apply-filter')
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline')
      .attr('stroke-dasharray', strokeDash)
      .attr('stroke-dashoffset', strokeDash);
  },

  /**
   * @function drawDomainBoundaryLine
   * Method to draw domain boundary line
   */
  drawDomainBoundaryLine() {
    let component = this;
    let skylineElements = component.$('.domain-boundary');
    let cellWidth = component.get('cellWidth');
    let cellHeight = component.get('cellHeight');
    let svg = component.get('domainBoundaryLineContainer');
    let cellIndex = 0;
    skylineElements.each(function(index) {
      let x1 = parseInt(component.$(skylineElements[index]).attr('x'));
      let y1 = parseInt(component.$(skylineElements[index]).attr('y'));
      y1 = y1 === 0 ? y1 + 3 : y1 + cellHeight + 3;
      let x2 = x1 + cellWidth;
      let y2 = y1;
      let linePoint = {
        x1,
        y1,
        x2,
        y2
      };
      svg
        .append('line')
        .attr('x1', linePoint.x1)
        .attr('y1', linePoint.y1)
        .attr('x2', linePoint.x2)
        .attr('y2', linePoint.y2)
        .attr(
          'class',
          `domain-boundary-line horizontal-line domain-boundary-line-${cellIndex}`
        );
      component.joinDomainBoundaryLinePoints(cellIndex, linePoint);
      cellIndex++;
    });
    component.showDomainPopOver();

    component.$('.scrollable-chart').scrollTop(component.get('chartHeight'));
  },

  showDomainPopOver() {
    let component = this;
    const gradePolyline = component.$('#gradeline-group polyline');
    const points = gradePolyline.attr('points').split(' ');
    const centerPoint = points[Math.round(points.length / 2)].split(',');
    const x1 = centerPoint[0];
    const y1 = centerPoint[1];
    const topPosition = Number(y1) + 15;
    const leftPosition = Number(x1) + 15;
    component.$('#popover').css({
      top: `${topPosition}px`,
      left: `${leftPosition}px`
    });
  },

  willDestroyElement() {
    let component = this;
    component.clearChart();
  },

  clearChart() {
    let component = this;
    component.$('svg').remove();
  },

  parseDomainTopicCompetencyData(domainTopicMatrix, domainTopicMetadata) {
    const chartData = [];
    let highestTopicSize = 0;
    const skylinePoints = [];

    domainTopicMetadata.domainTopics.map(domainMetadata => {
      const topicSkylinePoints = [];
      const domainMatrix = domainTopicMatrix.find(
        matrix => matrix.domainCode === domainMetadata.domainCode
      );
      let parsedDomainData = { ...domainMetadata, ...domainMatrix };
      highestTopicSize =
        highestTopicSize < domainMetadata.topics.length
          ? domainMetadata.topics.length
          : highestTopicSize;
      let domainCompetenciesCount = 0;
      if (domainMatrix && domainMatrix.topics) {
        const parsedDomainTopicData = [];
        domainMatrix.topics.map(topicMatrix => {
          const topicMetadata = domainMetadata.topics.find(
            topic => topic.topicCode === topicMatrix.topicCode
          );
          if (topicMatrix.competencies) {
            const competencies = topicMatrix.competencies.map(competency => {
              (competency.domainCode = domainMetadata.domainCode),
              (competency.domainSeq = domainMetadata.domainSeq),
              (competency.topicCode = topicMatrix.topicCode),
              (competency.topicSeq = topicMatrix.topicSeq),
              (competency.competencyStatus = competency.status);
              competency.isMastered = competency.status > 1;
              competency.isInferred =
                competency.status === 2 || competency.status === 3;
              competency.isSkyLineCompetency = false;
              competency.isGradeBoundary = false;
              return Ember.Object.create(competency);
            });
            topicMatrix.competencies = competencies.sortBy('competencySeq');
            topicMatrix.competencies[0].isSkyLineCompetency = true;
          }
          domainCompetenciesCount += topicMatrix.competencies.length;
          topicMatrix = {
            ...topicMatrix,
            ...topicMetadata,
            ...this.groupCompetenciesByStatus(topicMatrix.competencies),
            ...{
              domainCode: domainMetadata.domainCode,
              domainSeq: domainMetadata.domainSeq
            }
          };
          topicSkylinePoints.push(
            Ember.Object.create({
              topicSeq: topicMatrix.topicSeq,
              skylineCompetencySeq: topicMatrix.masteredCompetencies
            })
          );
          parsedDomainTopicData.push(Ember.Object.create(topicMatrix));
        });
        parsedDomainData.topics = parsedDomainTopicData;
      }
      parsedDomainData.totalCompetencies = domainCompetenciesCount;
      parsedDomainData = {
        ...parsedDomainData,
        ...this.groupCompetenciesByTopic(parsedDomainData.topics)
      };

      skylinePoints.push(
        Ember.Object.create({
          domainSeq: parsedDomainData.domainSeq,
          skylineCompetencySeq: parsedDomainData.masteredCompetencies,
          topicSkylinePoints
        })
      );
      chartData.push(Ember.Object.create(parsedDomainData));
    });

    this.set('skylinePoints', skylinePoints.sortBy('domainSeq'));

    this.set('proficiencyChartData', chartData.sortBy('domainSeq'));
    this.drawDomainTopicChart();
  },

  // TODO: it should be done in serializers
  groupCompetenciesByTopic(topics) {
    let masteredCompetencies = 0;
    let inprogressCompetencies = 0;
    let notstartedCompetencies = 0;
    let inferredCompetencies = 0;
    let completedCompetencies = 0;
    topics.map(topic => {
      completedCompetencies += topic.completedCompetencies;
      masteredCompetencies += topic.masteredCompetencies;
      inprogressCompetencies += topic.inprogressCompetencies;
      inferredCompetencies += topic.inferredCompetencies;
      notstartedCompetencies += topic.notstartedCompetencies;
    });
    return {
      completedCompetencies,
      masteredCompetencies,
      inprogressCompetencies,
      notstartedCompetencies,
      inferredCompetencies,
      totalCompetencies:
        completedCompetencies +
        inprogressCompetencies +
        notstartedCompetencies +
        inferredCompetencies
    };
  },

  groupCompetenciesByStatus(competencies) {
    const competenciesCount = {
      completedCompetencies: 0,
      inprogressCompetencies: 0,
      inferredCompetencies: 0,
      notstartedCompetencies: 0,
      masteredCompetencies: 0
    };
    competencies.map(competency => {
      if (competency.status === 0) {
        competenciesCount.notstartedCompetencies++;
      } else if (competency.status === 1) {
        competenciesCount.inprogressCompetencies++;
      } else if (competency.status === 2 || competency.status === 3) {
        competenciesCount.inferredCompetencies++;
        competenciesCount.masteredCompetencies++;
      } else {
        competenciesCount.completedCompetencies++;
        competenciesCount.masteredCompetencies++;
      }
    });
    return competenciesCount;
  },

  /**
   * @function drawDefaultSkyline
   * Method to draw the default SkyLine
   */
  drawDefaultSkyline() {
    const component = this;
    const proficiencyChartData = component.get('proficiencyChartData');
    const gradeBoundaries = component.get('domainBoundaries');
    const gradeBoundaryPoints = [];
    if (gradeBoundaries) {
      proficiencyChartData.map(domainData => {
        const domainGradeBoundariesList = gradeBoundaries.filter(
          gradeBoundary => {
            return gradeBoundary.domainCode === domainData.domainCode;
          }
        );
        let domainSkyLineCompSeq = 0;
        const domainTopicPoints = {
          domainSeq: domainData.domainSeq,
          topics: [],
          isExpanded: !!domainData.isExpanded,
          skylineCompetencySeq: domainSkyLineCompSeq
        };
        let isSkyLineTopicCovered = false;
        domainData.topics.map(topic => {
          let domainGradeBoundaries = gradeBoundaries.find(grade => {
            return grade.domainCode === domainData.domainCode;
          });
          const topicBoundaries = domainGradeBoundariesList.find(
            item => item.topicCode && item.topicCode === topic.topicCode
          );
          if (topicBoundaries) {
            domainGradeBoundaries = topicBoundaries;
          }
          let skylineCompetencySeq =
            !isSkyLineTopicCovered &&
            domainGradeBoundaries &&
            !domainGradeBoundaries.topicAverageComp &&
            topic.competencies
              ? topic.competencies.length
              : 0;
          const topicBoundary = {
            topicSeq: topic.topicSeq,
            skylineCompetencySeq
          };
          if (
            (domainGradeBoundaries &&
              topic.topicCode === domainGradeBoundaries.topicCode) ||
            (domainGradeBoundaries &&
              topic.topicCode === domainGradeBoundaries.highlineTopic)
          ) {
            isSkyLineTopicCovered = true;
            skylineCompetencySeq =
              topic.competencies.findIndex(
                competency =>
                  competency.competencyCode ===
                  (domainGradeBoundaries.topicAverageComp
                    ? domainGradeBoundaries.topicAverageComp
                    : domainGradeBoundaries.averageComp)
              ) + 1;
          }
          topicBoundary.skylineCompetencySeq = skylineCompetencySeq;
          domainTopicPoints.topics.push(topicBoundary);
          domainSkyLineCompSeq = domainSkyLineCompSeq + skylineCompetencySeq;
        });
        domainTopicPoints.skylineCompetencySeq = domainSkyLineCompSeq;
        gradeBoundaryPoints.push(domainTopicPoints);
      });
    }
    component.set('defaultSkylinePoints', gradeBoundaryPoints);
    component.drawAverageSkylineLine();
  },

  /**
   * @function drawAverageSkylineLine
   * Method to draw the average SkyLine
   */
  drawAverageSkylineLine() {
    const component = this;
    const gradeBoundaryPoints = component.get('defaultSkylinePoints');
    let curBarPos = 0;
    let strokeDash = 0;
    d3.select('#skyline-group polyline').remove();
    let points = '';
    gradeBoundaryPoints.forEach(domain => {
      if (domain.isExpanded) {
        // Get topic bar competency pos
        domain.topics.map(topic => {
          const x1 = curBarPos * this.cellWidth;
          const x2 = x1 + this.cellWidth;
          const y1 = topic.skylineCompetencySeq * this.expandedGraphCellHeight;
          const y2 = y1;
          points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
          curBarPos++;
          strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        });
      } else {
        const x1 = curBarPos * this.cellWidth;
        const x2 = x1 + this.cellWidth;
        const y1 = domain.skylineCompetencySeq * this.cellHeight;
        const y2 = y1;
        strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
        curBarPos++;
      }
    });
    d3.select('#skyline-group')
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline')
      .attr('stroke-dasharray', strokeDash)
      .attr('stroke-dashoffset', strokeDash);
  }
});
