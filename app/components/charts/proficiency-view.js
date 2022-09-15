import Ember from 'ember';
import d3 from 'd3';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['proficiency-view'],

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyProvider: Ember.inject.service('api-sdk/taxonomy'),

  competencyService: Ember.inject.service('api-sdk/competency'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    this.loadDomainTopicSummary();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} maxNumberOfCompetencies
   */
  maxNumberOfCompetencies: Ember.computed('domainTopicSummary', function() {
    return Math.max.apply(
      Math,
      this.get('domainTopicSummary').map(domain => domain.totalCompetencies)
    );
  }),

  /**
   * @property {Number} chartHeight
   */
  chartHeight: 150,

  /**
   * @property {Number} cellWidth
   */
  cellWidth: 15,

  /**
   * @property {Number} cellHeight
   */
  cellHeight: Ember.computed('maxNumberOfCompetencies', function() {
    let component = this;
    let maxNumberOfCompetencies = component.get('maxNumberOfCompetencies');
    let chartHeight = component.get('chartHeight');
    return chartHeight / maxNumberOfCompetencies;
  }),

  domainTopicSummary: Ember.A([]),

  skylinePoints: Ember.A([]),

  isLoading: false,

  gradeBoundaryPoints: Ember.A([]),

  showHighline: false,

  // -------------------------------------------------------------------------
  // Methods

  loadDomainTopicSummary() {
    const component = this;
    component.set('isLoading', true);
    if (!component.isDestroyed) {
      component.drawChart();
      component.set('isLoading', false);
    }
  },

  drawChart() {
    const component = this;
    const domainDataSet = component.get('domainDataSet');
    let cellWidth = component.get('cellWidth');
    let chartWidth = domainDataSet.length * cellWidth;
    let chartHeight = component.get('chartHeight');
    const svg = d3
      .select(`.chart.proficiency-view-${component.get('studentSeq')}`)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight);
    const domainGroup = svg.append('g').attr('id', 'chart-container');
    domainDataSet.map(domain => {
      component.drawDomainVerticalChart(domain, domainGroup);
    });
    component.drawSkyline();
    if (component.get('showHighline')) {
      component.drawGradeBoundaryLine();
    }
  },

  /**
   * @function drawDomainVerticalChart
   * Method to draw domain vertical chart
   */
  drawDomainVerticalChart(dataSet, domainGroup) {
    let component = this;
    let domainSeq = dataSet.domainSeq;
    let cellWidth = component.get('cellWidth');
    let cellHeight = component.get('cellHeight');
    let competencySeq = -1;
    let xSeq = (domainSeq - 1) * cellWidth;

    const competencies = new Array(dataSet.get('total')).fill({});

    const cells = domainGroup.selectAll('.competency').data(competencies);
    cells
      .enter()
      .append('rect')
      .attr('class', (competency, index) => {
        const curPos = index + 1;
        const statusNumber =
          curPos <= dataSet.get('mastered')
            ? '4'
            : curPos <= dataSet.get('mastered') + dataSet.get('in-progress')
              ? '1'
              : '0';
        return `competency-cell competency-${index + 1}
           fill-${statusNumber} `;
      })
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', xSeq)
      .attr('y', () => {
        competencySeq++;
        return competencySeq * cellHeight;
      });
    cells.exit().remove();
  },

  /**
   * @function drawSkyline
   * Method to draw skyline over the competency cell
   */
  drawSkyline() {
    let component = this;
    let cellWidth = component.get('cellWidth');
    let cellHeight = component.get('cellHeight');
    component.$('#skyline-group').remove();
    const skylineGroup = d3
      .select(`.chart.proficiency-view-${component.get('studentSeq')} svg`)
      .append('g')
      .attr('id', 'skyline-group');
    let curBarPos = 0;
    let points = '';
    this.get('domainDataSet').forEach(domain => {
      const x1 = curBarPos * cellWidth;
      const x2 = x1 + cellWidth;
      const y1 = domain.get('mastered') * cellHeight;
      const y2 = y1;
      points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
      curBarPos++;
    });

    skylineGroup
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline');
  },

  drawGradeBoundaryLine() {
    const component = this;
    const gradeBoundaryPoints = component.get('gradeBoundaryPoints');
    let curBarPos = 0;
    // let strokeDash = 0;

    d3.select('#gradeline-group').remove();
    const gradeContainer = d3
      .select(`.chart.proficiency-view-${component.get('studentSeq')} svg`)
      .append('g')
      .attr('id', 'gradeline-group');
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
          // strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        });
      } else {
        const x1 = curBarPos * this.cellWidth;
        const x2 = x1 + this.cellWidth;
        const y1 = domain.hiLineCompSeq * this.get('cellHeight');
        const y2 = y1;
        // strokeDash += Math.max(x1, y1, x2, y2);
        points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
        curBarPos++;
      }
    });
    gradeContainer
      .append('polyline')
      .attr('points', points)
      .attr('class', 'grade-line');
  }
});
