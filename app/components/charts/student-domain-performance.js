import Ember from 'ember';
import d3 from 'd3';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-domain-performance'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    let competencyDataSet = component.get('competencies');
    component.drawChart(competencyDataSet.sortBy('competencyStatus').reverse());
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Number}
   * Property to hold cell width
   */
  cellHeight: 25,

  /**
   * @type {Number}
   * Property to hold cell height
   */
  cellWidth: Ember.computed('competencies', function() {
    let component = this;
    let numberOfCompetencies = component.get('competencies.length');
    let maxChartWidth = component.get('maxChartWidth');
    return maxChartWidth / numberOfCompetencies;
  }),

  /**
   * @type {Number}
   * Property to hold max chart height
   */
  maxChartWidth: 126,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function drawChart
   * Method to draw individual domain competency chart
   */
  drawChart(competencyDataSet) {
    let component = this;
    let cellWidth = component.get('cellWidth');
    let cellHeight = component.get('cellHeight');
    let numberOfCompetencies = competencyDataSet.length;
    let domainSeq = component.get('domainSeq');
    let studentSeq = component.get('studentSeq');
    let competencySeq = 0;
    const svgContainer = d3
      .select(
        `.chart.render-student-domain-performance-${studentSeq}-${domainSeq}`
      )
      .append('svg')
      .attr('width', cellWidth * numberOfCompetencies)
      .attr('height', cellHeight);
    const cellContainer = svgContainer.append('g').attr('id', 'cell-container');
    const cells = cellContainer
      .selectAll('.competency')
      .data(competencyDataSet);
    cells
      .enter()
      .append('rect')
      .attr('class', d => {
        return `competency-${d.competencySeq} fill-${d.competencyStatus}`;
      })
      .attr('id', 'competency-cell')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', () => {
        competencySeq++;
        return (competencySeq - 1) * cellWidth;
      })
      .attr('y', 0);
    cells.exit().remove();
  }
});
