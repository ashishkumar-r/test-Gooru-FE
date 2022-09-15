/**
 * Learner proficiency matrix domain chart
 *
 * @module
 * @augments ember/Component
 */
import Ember from 'ember';
import d3 from 'd3';
import { SCREEN_SIZES, COMPETENCY_STATUS } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  //------------------------------------------------------------------------
  //Dependencies

  i18n: Ember.inject.service(),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomy: Ember.inject.service('taxonomy'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  session: Ember.inject.service('session'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  isShowLoaderSet: false,

  loading: true,
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['learner-proficiency-domain-matrix'],

  // -------------------------------------------------------------------------
  // Events

  init() {
    let component = this;
    component._super(...arguments);
    component.set('isBaseLineDrawn', false);
    component.set('activeGradeList', Ember.A([]));
    component.set('domainBoundariesContainer', Ember.A([]));
  },

  didInsertElement() {
    let maxHeight = this.$('.scrollable-chart').height() - 50;
    this.set('maxHeight', maxHeight);
    if (this.get('isInitialSkyline') && this.get('classGrade')) {
      this.send('onSelectGrade', this.get('classGrade'));
    }
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    component
      .$('[data-toggle="tooltip"]')
      .tooltip()
      .removeClass('show-tooltip')
      .addClass('show-tooltip');
  },

  resetAttributes() {
    const component = this;
    component.set('cellHeight', 6);
    component.set('cellWidth', 32);
    component.set('selectedDomain', null);
    component.set('selectedCompetency', null);
    component.set('isExpandChartEnabled', false);
    component.set('showExpandedButton', true);
    component.set('isShowSkyLinePopup', false);
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onToggleToShowGUTC() {
      let component = this;
      component.toggleProperty('showGutCompetency');
    },

    // Action triggered when toggle entire domains at once
    onToggleAllDomains() {
      let component = this;
      component.toggleProperty('isExpandChartEnabled');
      let cellHeight = component.get('isExpandChartEnabled')
        ? component.get('expandedCellHeight')
        : component.get('compressedCellHeight');
      component.set('cellHeight', cellHeight);
      component
        .get('proficiencyChartData')
        .map(domainData =>
          domainData.set('isExpanded', component.get('isExpandChartEnabled'))
        );
      component
        .get('skylinePoints')
        .map(skylinePoint =>
          skylinePoint.set('isExpanded', component.get('isExpandChartEnabled'))
        );
      component.drawDomainTopicChart();

      if (component.get('isSelectBaseLine')) {
        component.onToggleBaseline();
      }

      if (component.get('selectedDomain')) {
        component.send('domainFocusIn', component.get('selectedDomain'));
      }

      if (component.get('selectedCompetency')) {
        component.competencyFocusIn();
      }
    },

    onToggleBaseline() {
      let component = this;
      component.toggleProperty('isSelectBaseLine');
    },

    onSelectGrade(gradeData) {
      let component = this;
      component.selectGrade(gradeData);
    },

    // Action triggered when domain is selected
    onDomainSelect(domain) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_DOMAIN
      );
      if (!this.get('chartLoading')) {
        this.sendAction('onDomainSelect', domain);
      }
    },

    onSelectTopic(topic) {
      this.sendAction('onSelectTopic', topic);
    },

    // Action triggered when domain is clicked or hover in
    domainFocusIn(domain) {
      let component = this;
      component.$('#render-proficiency-matrix').addClass('highlight');
      component.$('.competency').removeClass('active active-cell');
      component.$(`.competency-${domain.domainSeq}`).addClass('active');
    },

    // Action triggered when domain is un-clicked or hover out
    domainFocusOut() {
      let component = this;
      let domain = component.get('selectedDomain');
      let competency = component.get('selectedCompetency');
      component.$('#render-proficiency-matrix').removeClass('highlight');
      component.$('.competency').removeClass('active');
      //Focus In when selected domain is already exists
      if (domain) {
        component.send('domainFocusIn', domain);
      }

      if (!domain && competency) {
        component.competencyFocusIn();
      }
    }
  },

  blockChartContainer(competency) {
    let component = this;
    let selectedElement = component.$(
      `#domain-group-${competency.domainSeq} #topic-${competency.topicSeq} #competency-cell-${competency.competencySeq}`
    );
    d3.select('#active-competency-group').remove();
    d3.select(`#domain-group-${competency.domainSeq}`)
      .append('g')
      .attr('id', 'active-competency-group')
      .attr(
        'transform',
        `translate(${(competency.topicSeq ? competency.topicSeq - 1 : 0) *
          this.get('cellWidth')}, ${selectedElement.attr('y')})`
      )
      .append('foreignObject')
      .attr('class', `active-competency fillArea${competency.competencyStatus}`)
      .attr('width', this.get('cellWidth'))
      .attr(
        'height',
        this.get('isPlayerProficiency')
          ? this.get('cellHeight')
          : this.get('expandedCellHeight')
      );
  },

  // Action triggered when competency is clicked or hover in
  competencyFocusIn() {
    let component = this;
    let selectedCompetency = component.get('selectedCompetency');
    if (selectedCompetency) {
      component.blockChartContainer(selectedCompetency);
    }
  },

  // Action triggered when competency is un-clicked or hover out
  competencyFocusOut() {
    this.$('#active-competency-group').remove();
  },

  // -------------------------------------------------------------------------
  // Observers

  /**
   * subjectId  change will call the function
   */
  onChangeSubject: Ember.observer('subject', function() {
    let component = this;
    if (component.get('subject')) {
      component.set('chartData', {});
      component.set('activeGradeList', Ember.A([]));
      component.set('domainBoundariesContainer', Ember.A([]));
      component.competencyFocusOut();
    }
    return null;
  }),

  onDomainChange: Ember.observer('selectedDomain.isExpanded', function() {
    let component = this;
    let selectedDomain = component.get('selectedDomain');
    if (selectedDomain && !this.get('hasNextActiveDomain')) {
      component.toggleDomainLevel();
    }
  }),

  onCompetencyChange: Ember.observer('selectedCompetency', function() {
    let component = this;
    let selectedCompetency = component.get('selectedCompetency');
    if (selectedCompetency) {
      component.competencyFocusIn();
    } else {
      component.competencyFocusOut();
    }
  }),

  comptencyMatrixObserver: Ember.observer('proficiencyChartData', function() {
    let component = this;
    let maxHeight = this.$('.scrollable-chart').height();
    this.$('.scrollable-chart').animate({
      scrollTop: maxHeight
    });

    component.resetAttributes();
    component.loadChartData();
  }),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Boolean} showBaseLine
   */
  showBaseLine: true,
  /**
   * @property {Boolean} showGutCompetency
   */
  showGutCompetency: false,

  /**
   * @property {Array} domainBoundariesContainer
   */
  domainBoundariesContainer: Ember.A([]),

  /**
   * @property {Array} activeGradeList
   */
  activeGradeList: Ember.A([]),

  /**
   * @property {Number} width
   */
  width: 780,

  /**
   * @property {Number} height
   */
  height: 700,

  /**
   * User id of competency matrix to plot
   * @type {String}
   */
  userId: null,

  /**
   * @property {Number} compressedCellHeight
   */
  compressedCellHeight: 6,

  /**
   * @property {Number} expandedCellHeight
   */
  expandedCellHeight: 32,

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
   * @type {Object}
   * Property to store user selected subject
   */
  subject: null,

  /**
   * @type {Boolean}
   * Property to show/hide loading spinner
   */
  isLoading: false,

  /**
   * It  will have chart value width scroll width handling
   * @type {String}
   */
  isTaxonomyDomainsAvailable: Ember.computed('taxonomyDomains', function() {
    let component = this;
    let length = component.get('taxonomyDomains').length;
    return length > 0;
  }),

  /**
   * It maintains the number of cells in each column
   * @type {Number}
   */
  numberOfCellsInEachColumn: 0,

  /**
   * It decide  the max number of cells in each column
   * @type {Number}
   */
  maxNumberOfCellsInEachColumn: 20,

  /**
   * skyline container
   * @type {Object}
   */
  skylineContainer: null,

  /**
   * @type {Json}
   * Currently selected/active month and year
   */
  timeLine: {},

  /**
   * @type {Boolean}
   * Check is baseline already shown or not
   */
  isBaseLineDrawn: false,

  /**
   * @type {Array}
   * Baseline points
   */
  baselinePoints: Ember.A([]),

  /**
   * @property {Boolean} isExpandChartEnabled
   */
  isExpandChartEnabled: false,

  /**
   * @property {Array} taxonomyGrades
   */
  taxonomyGrades: Ember.A([]),

  /**
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed('subject', function() {
    let component = this;
    let subject = component.get('subject');
    return subject ? subject.id : '';
  }),
  /**
   * Observer {Boolean} toggle baseline select
   */
  baseLineToggle: Ember.observer('isSelectBaseLine', function() {
    let component = this;
    component.onToggleBaseline();
  }),

  blockAttribute: null,

  /**
   * @property {Array} studentMasteredCompetencies
   * It has competencies info which is mastered by the student
   */
  studentMasteredCompetencies: Ember.computed(function() {
    const component = this;
    const navigateMapService = component.get('navigateMapService');
    let studentMasteredCompetencies = navigateMapService
      .getLocalStorage()
      .getItem(navigateMapService.getMasteredCompetenciesKey());
    // return [{'domainCode':'G','competencyCode':'K12.MA-MA5-G-B.01','isHighLight':false},{'domainCode':'G','competencyCode':'K12.MA-MA5-G-B.02','isHighLight':true}];
    return studentMasteredCompetencies
      ? JSON.parse(studentMasteredCompetencies)
      : Ember.A([]);
  }),

  masteredCompetencyInPlayer: null,

  /**
   * This property will decide to show expanded/compress button or not.
   * @property {Boolean}
   */
  showExpandedButton: false,

  /**
   * Maintains the maximum Width of the chart.
   */
  maxWidth: Ember.computed(function() {
    const screenWidth = screen.width;
    const isInitialSkyline = this.get('isInitialSkyline');
    const divWidth = isInitialSkyline ? this.$('.chart-area').width() : 600;
    return screenWidth <= SCREEN_SIZES.SMALL ? screenWidth - 15 : divWidth;
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

  gradeBoundaryPoints: Ember.A([]),

  competencyTooltipData: null,

  isShowSkyLinePopup: false,

  /**
   * @property {String} competencyStatus
   */
  competencyStatus: Ember.computed('competencyTooltipData', function() {
    let component = this;
    let competency = component.get('competencyTooltipData');
    return competency && COMPETENCY_STATUS[competency.status];
  }),

  maxDomainSize: Ember.computed('proficiencyChartData', function() {
    return Math.max.apply(
      Math,
      this.get('proficiencyChartData').map(
        domain => domain.totalCompetencies || 0
      )
    );
  }),

  highestExpandedBarCells: Ember.computed(
    'proficiencyChartData.@each.isExpanded',
    function() {
      let highestExpandedBarCells = 0;
      if (this.get('proficiencyChartData.length')) {
        const expendedDomains = this.get('proficiencyChartData').filterBy(
          'isExpanded',
          true
        );
        if (expendedDomains.length) {
          expendedDomains.map(domain => {
            domain.topics.map(topic => {
              highestExpandedBarCells =
                highestExpandedBarCells < topic.competencies.length
                  ? topic.competencies.length
                  : highestExpandedBarCells;
            });
          });
        }
      }
      return highestExpandedBarCells;
    }
  ),

  highestCollapsedBarCells: Ember.computed(
    'proficiencyChartData.@each.isExpanded',
    function() {
      let highestCollapsedBarCells = 0;
      if (this.get('proficiencyChartData.length')) {
        const collapsedDomains = this.get('proficiencyChartData').filter(
          domain => !domain.isExpanded
        );
        if (collapsedDomains.length) {
          highestCollapsedBarCells = Math.max.apply(
            Math,
            collapsedDomains.map(domain => domain.totalCompetencies || 0)
          );
        }
      }
      return highestCollapsedBarCells;
    }
  ),

  hasAnyExpandedBar: Ember.computed(
    'proficiencyChartData.@each.isExpanded',
    function() {
      return (
        this.get('proficiencyChartData').filterBy('isExpanded', true).length > 0
      );
    }
  ),

  hasNextActiveDomain: false,

  disableSkyline: false,

  isInitialSkyline: false,

  chartLoading: false,

  // -------------------------------------------------------------------------
  // Methods
  /**
   * @function onToggleBaseline
   * Action triggered when toggle baseline visibility
   */
  onToggleBaseline() {
    let component = this;
    if (!component.get('isSelectBaseLine')) {
      component.$('#baseline-container').addClass('hidden-line');
    } else {
      component.$('#baseline-container').removeClass('hidden-line');
    }
  },

  /**
   * @function selectGrade
   * Action triggered when select a grade
   */
  selectGrade(gradeData) {
    let component = this;
    let activeGradeList = component.get('activeGradeList');
    let domainBoundariesContainer = component.get('domainBoundariesContainer');
    let selectedGradeLine = component.$('#gradeline-group polyline');
    activeGradeList.clear();
    if (gradeData) {
      let selectedGradeSeq = gradeData.sequence;
      activeGradeList[`${gradeData.sequence}`] = gradeData;
      if (!domainBoundariesContainer[`${selectedGradeSeq}`]) {
        component
          .fetchDomainGradeBoundary(gradeData)
          .then(function(domainBoundary) {
            domainBoundariesContainer[`${selectedGradeSeq}`] = domainBoundary;
            if (
              component.get('activeGradeList') &&
              component.get('activeGradeList.length') &&
              !component.get('isInitialSkyline')
            ) {
              component.populateGradeBoundaryLine();
            }
          });
      } else {
        if (
          component.get('activeGradeList') &&
          component.get('activeGradeList.length') &&
          !component.get('isInitialSkyline')
        ) {
          component.populateGradeBoundaryLine();
        }
      }
      selectedGradeLine.removeClass('hidden-line');
      component.set('domainBoundariesContainer', domainBoundariesContainer);
      component.set('activeGradeList', activeGradeList);
    } else {
      selectedGradeLine.addClass('hide');
    }
  },

  /**
   * @function loadChartData
   * Method to collect chart data
   */
  loadChartData() {
    let component = this;
    let proficiencyChartData = component.get('proficiencyChartData');
    if (proficiencyChartData) {
      component.drawDomainTopicChart();
      if (component.get('isPlayerProficiency')) {
        component.highlightStudentMasteredCompetency();
      }
    }
    component.onToggleBaseline();
  },
  /**
   * @function fetchDomainGradeBoundary
   * Method to fetch domain grade boundary
   */
  fetchDomainGradeBoundary(gradeData) {
    let component = this;
    let taxonomyService = component.get('taxonomyService');
    let gradeId = gradeData ? gradeData.id : null;
    return Ember.RSVP.hash({
      domainBoundary: gradeId
        ? Ember.RSVP.resolve(
          taxonomyService.fetchDomainGradeBoundaryBySubjectId(gradeId)
        )
        : Ember.RSVP.resolve(null)
    }).then(({ domainBoundary }) => {
      return domainBoundary;
    });
  },

  /**
   * @function parseCrossWalkFWC
   * Method to check cross walk competency with user competency matrix
   */
  parseCrossWalkFWC(competencies) {
    const component = this;
    const fwCompetencies = component.get('fwCompetencies') || [];
    if (fwCompetencies && fwCompetencies.length) {
      competencies.forEach(competency => {
        let fwCompetency = fwCompetencies.find(fwCompetency => {
          return fwCompetency[competency.competencyCode];
        });
        const isMappedWithFramework = !!fwCompetency;
        competency.set('isMappedWithFramework', isMappedWithFramework);
        if (fwCompetency) {
          competency.set('framework', fwCompetency[competency.competencyCode]);
        }
      });
    }
    return competencies;
  },

  /**
   * @function parseGradeLineBoundaries
   * Method will extract all the grade boundary competencies by domain wise
   */
  parseGradeLineBoundaries(domainCompetencyData, domainCode) {
    let component = this;
    let domainBoundariesContainer = component.get('domainBoundariesContainer');
    if (domainBoundariesContainer) {
      domainBoundariesContainer.forEach(function(domainsBoundary, gradeSeq) {
        let curDomainBoundaryData = domainsBoundary.findBy(
          'domainCode',
          domainCode
        );
        let firstCompetency = domainCompetencyData.objectAt(0);
        let curDomainHighLineCompetency = firstCompetency;
        let highlineCompetency = curDomainBoundaryData
          ? domainCompetencyData.findBy(
            'competencyCode',
            curDomainBoundaryData.highline
          )
          : null;
        if (highlineCompetency) {
          highlineCompetency.set('highlineCompetency', true);
          curDomainHighLineCompetency = highlineCompetency;
        }
        let className = curDomainHighLineCompetency.boundaryClass
          ? curDomainHighLineCompetency.boundaryClass
          : '';
        curDomainHighLineCompetency.boundaryClass = `${className} boundary-line-${gradeSeq}`;
      });
    }
    return domainCompetencyData;
  },

  /**
   * @function drawChart
   * Method to draw competency chart
   */
  drawChart(data) {
    let component = this;
    let cellSizeInRow = component.get('taxonomyDomains');
    let numberOfCellsInEachColumn = cellSizeInRow.length;
    let extendedChartHeight = 15;
    component.set('numberOfCellsInEachColumn', numberOfCellsInEachColumn);
    let cellWidth = component.get('cellWidth');
    let cellHeight = component.get('cellHeight');
    const maxWidth = component.get('maxWidth');
    const maxHeight = component.get('maxHeight');
    const maxCellsInDomain = component.get('maxNumberOfCellsInEachColumn');
    const thresholdDomainCount = component.get('thresholdDomainCount');
    let width = Math.round(numberOfCellsInEachColumn * cellWidth) + 5;
    if (numberOfCellsInEachColumn <= thresholdDomainCount || width < maxWidth) {
      cellWidth = Math.round(maxWidth / numberOfCellsInEachColumn);
      component.set('cellWidth', cellWidth);
      width = Math.round(numberOfCellsInEachColumn * cellWidth) + 5;
    }
    component.set('width', width);
    let height = component.get('height') + extendedChartHeight;
    if (height < maxHeight) {
      cellHeight = Math.round(maxHeight / maxCellsInDomain);
      component.set('cellHeight', cellHeight);
      height = Math.round(maxCellsInDomain * cellHeight) + 5;
    }

    component.$('#render-proficiency-matrix svg').remove();
    component.$('#render-proficiency-matrix').height(height);
    const svg = d3
      .select('#render-proficiency-matrix')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    let cellContainer = svg.append('g').attr('id', 'cell-container');
    let skylineContainer = svg.append('g').attr('id', 'skyline-container');
    let domainBoundaryLineContainer = svg
      .append('g')
      .attr('id', 'domain-boundary-line-container');
    let baseLineContainer = svg
      .append('g')
      .attr('id', 'baseline-container')
      .attr('class', 'hidden-line');
    component.set('skylineContainer', skylineContainer);
    component.set('baseLineContainer', baseLineContainer);
    component.set('domainBoundaryLineContainer', domainBoundaryLineContainer);
    const cards = cellContainer.selectAll('.competency').data(data);
    cards
      .enter()
      .append('rect')
      .attr('x', d => (d.xAxisSeq - 1) * cellWidth)
      .attr('y', d => (d.yAxisSeq - 1) * cellHeight)
      .attr('copy-yaxis', d => (d.yAxisSeq - 1) * cellHeight)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('yaxis-seq', d => d.yAxisSeq)
      .attr('class', d => {
        let skylineClassName = d.skyline ? 'skyline-competency' : '';
        let masteredCompetencyClassName = d.mastered
          ? 'mastered-competncy'
          : '';
        let domainBoundaryCompetency = d.isDomainBoundaryCompetency
          ? 'domain-boundary'
          : '';
        let highlineCompetencyClassName = d.highlineCompetency
          ? 'highline-competency'
          : '';
        let noFrameWorkClass = !d.isMappedWithFramework ? 'no-framework' : '';
        return `competency ${noFrameWorkClass} ${skylineClassName} competency-${
          d.xAxisSeq
        } competency-${d.xAxisSeq}-${
          d.yAxisSeq
        } fillArea${d.status.toString()} ${domainBoundaryCompetency} ${
          d.boundaryClass
        } ${masteredCompetencyClassName} ${highlineCompetencyClassName}`;
      })
      .on('click', function(d) {
        component.selectCompetency(d);
      });

    cards.exit().remove();
    component.$('.scrollable-chart').scrollTop(height);
    component.drawSkyline();
    component.showGutCompetencyColorGradient();
  },

  drawDomainTopicChart() {
    const component = this;

    const proficiencyChartData = component.get('proficiencyChartData');
    if (component.get('isPlayerProficiency')) {
      component.populateStudentMasteredCompetency(proficiencyChartData);
    }
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

      component.$('#render-proficiency-matrix svg').remove();
      const svg = d3
        .select('#render-proficiency-matrix')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      component.set('loading', false);

      svg.append('g').attr('id', 'domains-group');
      svg.append('g').attr('id', 'skyline-group');
      svg.append('g').attr('id', 'gradeline-group');

      let isPrevExpanded = false;
      proficiencyChartData.map(domainChartData => {
        component.drawDomainChart(domainChartData, isPrevExpanded);
        if (domainChartData.get('isExpanded')) {
          isPrevExpanded = true;
          if (!component.get('isExpandChartEnabled')) {
            component.toggleChartSize(
              domainChartData.get('topics.length'),
              true
            );
          }
          component.drawTopicChart(domainChartData);
          component.toggleDomainGroup(
            domainChartData.get('domainSeq'),
            domainChartData.get('isExpanded')
          );
        }
      });
      if (component.get('isInitialSkyline')) {
        if (component.get('proficiencyType')) {
          component.animateDomainCompetencies();
        } else {
          setTimeout(() => {
            component.animateDomainCompetencies();
          }, 1000);
        }
      }
    }
    component.sendAction('isShowLoaderSet', false);
    setTimeout(() => {
      component.set('isShowLoaderSet', false);
      if (
        component.get('isClassActivity') &&
        component.get('onSelectedDomain') &&
        component.get('onSelectedCompetency')
      ) {
        component.sendAction(
          'onDomainSelect',
          component.get('onSelectedDomain')
        );
        setTimeout(() => {
          component.selectCompetency(component.get('onSelectedCompetency'));
        }, 1000);
      }
    }, 2000);
    if (
      this.get('skylinePoints') &&
      this.get('skylinePoints.length') &&
      !this.get('disableSkyline') &&
      !this.get('isInitialSkyline')
    ) {
      this.drawProficiencySkyline();
    }

    if (
      this.get('activeGradeList') &&
      this.get('activeGradeList.length') &&
      !this.get('isInitialSkyline')
    ) {
      component.populateGradeBoundaryLine();
    }
  },

  drawDomainChart(domainChartData, isPrevExpanded = false) {
    const component = this;
    const svg = d3.select('#domains-group');
    const cellWidth = component.get('cellWidth');
    const cellHeight = component.get('cellHeight');
    let competencySeq = -1;
    const domainSeq = domainChartData.domainSeq;
    const compSeqList = domainChartData.compSeqList || [];
    const isInitialSkyline = component.get('isInitialSkyline');
    const domainGroup = svg
      .append('g')
      .attr('id', `domain-group-${domainSeq}`)
      .attr('class', 'domain-group-item');
    let transformX = cellWidth * (domainSeq - 1);
    if (this.get('isExpandChartEnabled') || isPrevExpanded) {
      const prevDomain = component.$(`#domain-group-${domainSeq - 1}`);
      if (prevDomain.length) {
        transformX =
          parseInt(component.getTranslation(prevDomain.attr('transform'))[0]) +
          parseInt(prevDomain.attr('width'));
      }
    }

    domainGroup.attr('transform', `translate(${transformX}, 0)`);
    domainGroup.attr(
      'width',
      domainChartData.get('isExpanded')
        ? domainChartData.topics.length * this.cellWidth
        : this.cellWidth
    );
    const domainCompetencyGroup = domainGroup
      .append('g')
      .attr('id', 'competencies-group')
      .on('click', () => {
        if (!this.get('chartLoading')) {
          this.sendAction('onDomainSelect', domainChartData);
        }
      });

    const groupedDomainCompetencies = new Array(
      domainChartData.totalCompetencies || 0
    ).fill({});
    const competencyCells = domainCompetencyGroup
      .selectAll('.competency')
      .data(groupedDomainCompetencies);
    competencyCells
      .enter()
      .append('rect')
      .attr('class', (competency, index) => {
        const curPos = index + 1;
        const statusNumber =
          curPos <= domainChartData.masteredCompetencies
            ? '4'
            : curPos <=
              domainChartData.masteredCompetencies +
                domainChartData.inprogressCompetencies
              ? '1'
              : '0';
        return `competency-cell ${
          isInitialSkyline && statusNumber ? 'ani-mastery-cell' : ''
        } competency-${index + 1}
        fillArea${statusNumber} ${
  competency.isSkyLineCompetency ? 'skyline-competency' : ''
}
  ${this.get('isClassActivity') ? 'class-grade-domain-competency' : ''}
  ${compSeqList.indexOf(index) !== -1 ? 'class-grade-domain-competency' : ''}`;
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

  applymask(domain, isExpand) {
    if (isExpand) {
      this.$('.domain-group-item').addClass('mask-applied');
      this.$(`#domain-group-${domain.domainSeq}`).removeClass('mask-applied');
      return;
    }
    this.$('.domain-group-item').removeClass('mask-applied');
  },

  handleDomainBarTransition(domain, isExpand = true) {
    const domainSeq = domain.domainSeq;
    let lastMovingDomain = isExpand
      ? this.get('proficiencyChartData.length')
      : domainSeq + 1;
    const numberOfColumns = domain.topics.length > 1 ? domain.topics.length : 0; // domain seq * no.of topics
    if (numberOfColumns > 1) {
      while (
        (lastMovingDomain > domainSeq && isExpand) ||
        (!isExpand &&
          lastMovingDomain <= this.get('proficiencyChartData.length'))
      ) {
        const domainGroup = d3.select(`#domain-group-${lastMovingDomain}`);
        const traslation = this.getTranslation(domainGroup.attr('transform'));
        const xValue = isExpand
          ? traslation[0] + (numberOfColumns - 1) * this.cellWidth
          : traslation[0] - (numberOfColumns - 1) * this.cellWidth;
        domainGroup
          .transition()
          .duration(this.get('hasNextActiveDomain') ? 0 : 800)
          .attr('transform', `translate(${xValue}, 0)`);
        isExpand ? lastMovingDomain-- : lastMovingDomain++;
      }
    }
    this.toggleChartSize(numberOfColumns, isExpand);
    this.toggleDomainGroup(domainSeq, isExpand);
    if (!this.get('disableSkyline')) {
      this.drawProficiencySkyline();
    }
    this.populateGradeBoundaryLine();
  },

  toggleChartSize(numberOfColumns = 0, isExpand, isAdjust = true) {
    if (numberOfColumns > 1) {
      const chartWidth = parseFloat(
        d3.select('#render-proficiency-matrix svg').attr('width')
      );
      const adjustableWidth = this.get('cellWidth') * (numberOfColumns - 1);
      let updatedWidth = adjustableWidth;
      if (isAdjust) {
        updatedWidth = isExpand
          ? chartWidth + adjustableWidth
          : chartWidth - adjustableWidth;
      }
      d3.select('#render-proficiency-matrix svg').attr('width', updatedWidth);
    }

    let chartHeight = parseFloat(
      d3.select('#render-proficiency-matrix svg').attr('height')
    );

    if (
      this.get('highestExpandedBarCells') * this.get('expandedCellHeight') >
      this.get('highestCollapsedBarCells') * this.get('cellHeight')
    ) {
      chartHeight =
        this.get('highestExpandedBarCells') * this.get('expandedCellHeight');
    } else {
      chartHeight =
        this.get('highestCollapsedBarCells') * this.get('cellHeight');
    }

    d3.select('#render-proficiency-matrix svg').attr('height', chartHeight);
  },

  toggleDomainGroup(domainSeq, isExpand) {
    const domainGroup = d3.select(`#domain-group-${domainSeq}`);
    if (isExpand) {
      domainGroup.select('#competencies-group').attr('class', 'hidden');
      domainGroup.select('#topic-group').attr('class', 'show');
    } else {
      domainGroup.select('#competencies-group').attr('class', 'show');
      domainGroup.select('#topic-group').attr('class', 'hidden');
    }

    if (isExpand) {
      // Scroll to active domain
      this.$('.domain-chart-container').scrollLeft(
        this.$(`.domain-seq-${domainSeq}`)[0].offsetLeft -
          (this.cellWidth - this.cellWidth / 2)
      );
    }
  },

  getTranslation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function
    // returns.
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, 'transform', transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix.
    const matrix = g.transform.baseVal.consolidate().matrix;

    // As per definition values e and f are the ones for the translation.
    return [matrix.e, matrix.f];
  },

  drawTopicChart(domain) {
    const component = this;
    const domainSeq = domain.domainSeq;
    const domainGroup = d3.select(`#domain-group-${domainSeq}`);
    if (domain.isExpanded) {
      domainGroup
        .append('g')
        .attr('class', 'domain-highlight')
        .append('rect')
        .attr('width', domain.get('topics').length * component.get('cellWidth'))
        .attr('height', component.$('#render-proficiency-matrix').height());
      d3.select('svg').attr(
        'height',
        component.$('#render-proficiency-matrix').height()
      );
    } else {
      domainGroup.select('.domain-highlight').remove();
    }

    domainGroup.select('#topic-group').remove();
    const topicGroup = domainGroup.append('g').attr('id', 'topic-group');
    domain.topics.map((topic, seq) => {
      const topicContainer = topicGroup
        .append('g')
        .attr('id', `topic-${seq + 1}`)
        .attr('transform', `translate(${seq * component.get('cellWidth')}, 0)`);
      if (topic.competencies) {
        const competencyCells = topicContainer
          .selectAll('.competency')
          .data(topic.competencies);
        competencyCells
          .enter()
          .append('rect')
          .on('click', competency => {
            component.selectCompetency(competency);
          })
          .on('mousemove', competency => {
            component.set('competencyTooltipData', competency);
            component
              .$('.competency-tooltip-content')
              .css({
                top: `${d3.event.pageY}px`,
                left: `${d3.event.pageX + 10}px`
              })
              .show();
          })
          .on('mouseleave', () => {
            component.$('.competency-tooltip-content').hide();
          })
          .transition()
          .duration(1000)
          .delay(800)
          .attr('id', competency => {
            return `competency-cell-${competency.competencySeq}`;
          })
          .attr('width', component.get('cellWidth'))
          .attr('height', component.get('expandedCellHeight'))
          .attr('x', 0)
          .attr('y', (d, i) => {
            return i * component.get('expandedCellHeight');
          })
          .attr('class', competency => {
            return `competency-cell fillArea${
              competency.isMappedWithFramework ? competency.status : '-1'
            }
            ${competency.isSkylineCompetency ? 'skyline-competency' : ''}
            ${
  this.get('isClassActivity') && competency.isMappedWithFramework
    ? 'class-grade-competency'
    : ''
}
            ${competency.isClassGrade ? 'class-grade-competency' : ''} `;
          });
        competencyCells.exit().remove();
      }
    });
  },

  drawProficiencySkyline() {
    const component = this;
    let points = '';

    d3.select('#skyline-group polyline').remove(); // Remove skyline, if exist

    let curBarPos = 0;
    let strokeDash = 0;
    this.get('skylinePoints').forEach(domain => {
      if (domain.isExpanded) {
        // Get topic bar competency pos
        domain.topicSkylinePoints.map(topic => {
          const x1 = curBarPos * this.cellWidth;
          const x2 = x1 + this.cellWidth;
          const y1 =
            topic.skylineCompetencySeq * component.get('expandedCellHeight');
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
    component.addSkylineBackshadow();
  },

  drawGradeBoundaryLine() {
    const component = this;
    const gradeBoundaryPoints = component.get('gradeBoundaryPoints');
    let curBarPos = 0;
    let strokeDash = 0;

    d3.select('#gradeline-group polyline').remove();
    let points = '';
    gradeBoundaryPoints.forEach(domain => {
      if (domain.get('isExpanded')) {
        // Get topic bar competency pos
        domain.topics.map(topic => {
          const x1 = curBarPos * this.cellWidth;
          const x2 = x1 + this.cellWidth;
          const y1 = topic.hiLineCompSeq * this.expandedCellHeight;
          const y2 = y1;

          points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
          curBarPos++;
          strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        });
      } else {
        const x1 = curBarPos * this.cellWidth;
        const x2 = x1 + this.cellWidth;
        const y1 = domain.hiLineCompSeq * this.cellHeight;
        const y2 = y1;
        strokeDash += Math.max(x1, y1, x2, y2);
        points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
        curBarPos++;
      }
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
      .attr('id', 'back-shadow')
      .attr('filterUnits', 'userSpaceOnUse');
    gradeFilter
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '4');
  },

  /**
   * @function showDropShadow
   * Method to show a drop shadow in skyline
   */
  addSkylineBackshadow() {
    const skylineContainer = d3.select('#skyline-group');
    const filterContainer = skylineContainer
      .append('defs')
      .append('filter')
      .attr('id', 'back-shadow')
      .attr('filterUnits', 'userSpaceOnUse');
    filterContainer
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '4');
  },

  selectCompetency(competency) {
    let component = this;
    component.set('selectedCompetency', competency);
    let proficiencyChartData = component.get('proficiencyChartData');
    let domainCode = competency.get('domainCode');
    let domainCompetencyList = proficiencyChartData.filterBy(
      'domainCode',
      domainCode
    );
    component.sendAction(
      'onSelectCompetency',
      competency,
      domainCompetencyList
    );
    let classPreference = this.get('class.preference');
    const context = {
      classId: this.get('class').id,
      fwCode: competency.framework
        ? competency.framework.frameworkCompetencyCode
        : classPreference
          .get('framework')
          .concat('.', competency.competencyCode),
      subjectCode: this.get('subjectCode'),
      gradeName: this.get('class').grade,
      domainCode: domainCode,
      topicCode: competency.topicCode,
      competencyCode: competency.competencyCode,
      additionalText: competency.framework
    };
    this.get('parseEventService').postParseEvent(
      PARSE_EVENTS.INSPECT_COMPENTENCY,
      context
    );
  },

  /**
   * @function drawSkyline
   * Method to draw skyline over the competency cell
   */
  drawSkyline() {
    let component = this;
    let skylineElements = component.$('.skyline-competency');
    let cellWidth = component.get('cellWidth');
    let cellHeight = component.get('cellHeight');
    component.$('line').remove();
    let svg = component.get('skylineContainer');
    let cellIndex = 0;
    skylineElements.each(function(index) {
      let x1 = parseInt(component.$(skylineElements[index]).attr('x'));
      let y1 = parseInt(component.$(skylineElements[index]).attr('y'));
      let isMasteredCompetency = component
        .$(skylineElements[index])
        .hasClass('mastered-competncy');
      y1 = y1 === 0 && !isMasteredCompetency ? y1 + 3 : y1 + cellHeight + 3;
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
        .attr('class', `sky-line-${cellIndex}`);
      component.joinSkyLinePoints(cellIndex, linePoint);
      cellIndex++;
    });
    component.showDropShadow();
  },

  showGutCompetencyColorGradient() {
    const chartContainer = d3.select('#render-proficiency-matrix svg');
    var svgDefs = chartContainer.append('defs');
    var linearGradient = svgDefs
      .append('linearGradient')
      .attr('id', 'linearGradient')
      .attr('x2', '0%')
      .attr('y2', '100%');
    linearGradient
      .append('stop')
      .attr('class', 'stop-top')
      .attr('offset', '0');
    linearGradient
      .append('stop')
      .attr('class', 'stop-bottom')
      .attr('offset', '1');
  },

  /**
   * @function showDropShadow
   * Method to show a drop shadow in skyline
   */
  showDropShadow() {
    let component = this;
    const chartContainer = d3.select('#render-proficiency-matrix svg');
    let skylineContainer = component.get('skylineContainer');
    let filterContainer = chartContainer
      .append('defs')
      .append('filter')
      .attr('id', 'shadow');
    filterContainer
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '4');
    skylineContainer
      .append('line')
      .attr('x1', 0)
      .attr('y1', 30)
      .attr('x2', 0)
      .attr('y2', 30)
      .attr('class', `sky-line-${-1} dummy-line`);
  },

  /**
   * @function populateGradeBoundaryLine
   * Method to draw domain boundary line
   */
  populateGradeBoundaryLine() {
    let component = this;
    let activeGradeList = component.get('activeGradeList');
    const proficiencyChartData = component.get('proficiencyChartData');
    const domainBoundariesContainer = component.get(
      'domainBoundariesContainer'
    );
    activeGradeList.map((gradeData, gradeSeq) => {
      const gradeBoundaryPoints = [];
      const gradeBoundaries = domainBoundariesContainer[gradeSeq];
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
                if (topic.competencies) {
                  hiLineCompSeq =
                    topic.competencies.findIndex(
                      competency =>
                        competency.competencyCode ===
                        (domainGradeBoundaries.topicHighlineComp
                          ? domainGradeBoundaries.topicHighlineComp
                          : domainGradeBoundaries.highlineComp)
                    ) + 1;
                }
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
    });

    component.set('isLoading', false);
  },

  /**
   * @function joinDomainBoundaryLinePoints
   * Method to draw vertical line to connects domain boundary line points, if necessary
   */
  joinDomainBoundaryLinePoints(
    curLinePoint,
    lastBoundaryLineSeq,
    gradeSeq,
    isClassGrade
  ) {
    let component = this;
    let lastBoundaryLineContainer = component.$(
      `.boundary-line-${gradeSeq}-${lastBoundaryLineSeq}`
    );
    let domainBoundaryLineContainer = component.get(
      'domainBoundaryLineContainer'
    );
    let lastBoundaryLinePoint = {
      x2: parseInt(lastBoundaryLineContainer.attr('x2')),
      y2: parseInt(lastBoundaryLineContainer.attr('y2'))
    };
    //Connect sky line points if last and current points are not same
    if (
      lastBoundaryLineContainer.length &&
      lastBoundaryLinePoint.y2 !== curLinePoint.y1
    ) {
      domainBoundaryLineContainer
        .append('line')
        .attr('x1', lastBoundaryLinePoint.x2)
        .attr('y1', lastBoundaryLinePoint.y2)
        .attr('x2', curLinePoint.x1)
        .attr('y2', curLinePoint.y1)
        .attr('class', () => {
          let className = isClassGrade
            ? 'class-boundary-line'
            : 'boundary-line';
          return `${className} vertical-line grade-${gradeSeq}-line`;
        });
    }
  },

  willDestroyElement() {
    let component = this;
    component.clearChart();
    component.set('isShowMatrixChart', false);
  },

  clearChart() {
    let component = this;
    component.$('svg').remove();
  },

  /**
   * @function populateStudentMasteredCompetency
   * Method to populate mastered competency through studyplayer
   */
  populateStudentMasteredCompetency(proficiencyChartData) {
    const component = this;
    let studentMasteredCompetencies = component.get(
      'studentMasteredCompetencies'
    );
    const activeCompetency = studentMasteredCompetencies.findBy(
      'isHighLight',
      true
    );

    let domain = proficiencyChartData.findBy(
      'domainCode',
      activeCompetency.domainCode
    );
    let topics = domain.get('topics');
    let competencyData = {};
    topics.some(topic => {
      return topic.competencies.some(competency => {
        if (
          competency.get('competencyCode') === activeCompetency.competencyCode
        ) {
          competencyData = competency;
          return (
            competency.get('competencyCode') === activeCompetency.competencyCode
          );
        }
      });
    });

    component.set('masteredCompetencyInPlayer', competencyData);
  },

  /**
   * @function highlightStudentMasteredCompetency
   * Method to highlight recently mastered competency
   */
  highlightStudentMasteredCompetency() {
    const component = this;

    const masteredCompetency = component.get('masteredCompetencyInPlayer');
    if (masteredCompetency) {
      component.blockChartContainer(masteredCompetency);
      component.selectCompetency(masteredCompetency);
    }
  },

  toggleDomainLevel() {
    let selectedDomain = this.get('selectedDomain');
    this.set('chartLoading', true);
    let proficiencyChartData = this.get('proficiencyChartData');
    let activeDomains = proficiencyChartData.filter(
      item => item.isExpanded && item.domainSeq !== selectedDomain.domainSeq
    );
    this.set('hasNextActiveDomain', true);
    let promiseList = activeDomains.map(item => {
      item.set('isExpanded', false);
      let domainGroup = d3.select(`#domain-group-${item.domainSeq}`);
      domainGroup.select('.domain-highlight').remove();
      return this.clearDomains(item, false);
    });
    Promise.all(promiseList).then(() => {
      this.set('hasNextActiveDomain', false);
      let domainGroup = d3.select(`#domain-group-${selectedDomain.domainSeq}`);
      domainGroup.select('.domain-highlight').remove();
      this.applymask(selectedDomain, selectedDomain.isExpanded);
      if (!this.get('disableSkyline')) {
        this.get('skylinePoints')
          .findBy('domainSeq', selectedDomain.domainSeq)
          .set('isExpanded', selectedDomain.get('isExpanded'));
      }
      this.handleDomainBarTransition(
        selectedDomain,
        selectedDomain.get('isExpanded')
      );
      if (selectedDomain.get('isExpanded')) {
        this.drawTopicChart(selectedDomain);
      }
      setTimeout(() => this.set('chartLoading', false), 2000);
    });
  },

  clearDomains(domain, isExpand) {
    return new Ember.RSVP.Promise(resolve => {
      if (!this.get('disableSkyline')) {
        this.get('skylinePoints')
          .findBy('domainSeq', domain.domainSeq)
          .set('isExpanded', isExpand);
      }
      resolve(this.handleDomainBarTransition(domain, isExpand));
    });
  },

  showDomainPopOver() {
    let component = this;
    const gradePolyline = component.$('#gradeline-group polyline');
    if (gradePolyline.attr('points')) {
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
    }
    component.set('isShowSkyLinePopup', !component.get('isPublic'));
  },

  animateDomainCompetencies() {
    const component = this;
    const activeDomains = component.$('svg .domain-group-item');
    let defaultDelay = component.get('proficiencyType') ? 0 : 100;
    Array.from(activeDomains).forEach((domain, domainIndex) => {
      const masteryCells = Array.from(
        $(domain).find('#competencies-group .ani-mastery-cell')
      );
      Ember.run.later(
        component,
        () => {
          masteryCells.forEach((competency, index) => {
            Ember.run.later(
              component,
              () => {
                $(competency).removeClass('ani-mastery-cell');
              },
              (defaultDelay / masteryCells.length) * index
            );
          });

          if (domainIndex === activeDomains.length - 1) {
            this.drawProficiencySkyline();
            if (
              component.get('proficiencyType') &&
              this.get('activeGradeList') &&
              this.get('activeGradeList.length')
            ) {
              component.populateGradeBoundaryLine();
            } else {
              Ember.run.later(
                component,
                function() {
                  if (
                    this.get('activeGradeList') &&
                    this.get('activeGradeList.length')
                  ) {
                    component.populateGradeBoundaryLine();
                  }
                },
                1000
              );
            }
          }
        },
        defaultDelay * domainIndex
      );
    });
  }
});
