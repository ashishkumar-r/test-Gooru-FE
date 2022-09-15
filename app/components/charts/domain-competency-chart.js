import Ember from 'ember';
import d3 from 'd3';
import { colorsBasedOnStatus } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['domain-competency-chart'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    let competencyDataSet = component.get('competencies');
    component.drawChart(competencyDataSet);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Number}
   * Property to hold cell width
   */
  cellWidth: 20,

  /**
   * @type {Number}
   * Property to hold cell height
   */
  cellHeight: Ember.computed('competencies', function() {
    let component = this;
    let numberOfCompetencies = component.get('competencies.length');
    let maxChartHeight = component.get('maxChartHeight');
    return maxChartHeight / numberOfCompetencies;
  }),

  /**
   * @type {Number}
   * Property to hold max chart height
   */
  maxChartHeight: 250,

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
    const svgContainer = d3
      .select(`.render-domain-competency-chart-${domainSeq}-${studentSeq}`)
      .append('svg')
      .attr('width', 20)
      .attr('height', cellHeight * numberOfCompetencies);
    const cellContainer = svgContainer.append('g').attr('id', 'cell-container');
    const cells = cellContainer
      .selectAll('.competency')
      .data(competencyDataSet);
    cells
      .enter()
      .append('rect')
      .attr('class', d => {
        return `competency-${d.competencySeq}`;
      })
      .attr('id', 'competency-cell')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', 0)
      .attr('y', d => {
        let competencySeq = d.competencySeq;
        return (competencySeq - 1) * cellHeight;
      })
      .style('fill', d => {
        let competencyStatus = d.status;
        return colorsBasedOnStatus[`${competencyStatus}`];
      });
    cells.exit().remove();
  }
});
