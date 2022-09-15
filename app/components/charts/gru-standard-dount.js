import Ember from 'ember';
import d3 from 'd3';

export default Ember.Component.extend({
  // -------------------------------------------------------------
  // Attributes
  classNames: ['gru-standard-dount-chart'],

  // ---------------------------------------------------------
  // Dependencies

  // ------------------------------------------------------------
  // Properties

  /**
   * @property {number} width help to set dount width
   */
  width: 300,

  /**
   * @property {number} height help to set dount height
   */
  height: 300,

  /**
   * @property {number} innerRadius help to set dount radius
   */
  innerRadius: 70,

  /**
   * @property {number} innerRadius help to set dount radius
   */
  outerRadius: 100,

  /**
   * @property {number} margin help to set dount margin
   */
  margin: 100,

  /**
   * @property {Arrray} chartData has data for the chart
   */
  data: [],

  totalScore: 60,

  onWatchData: Ember.observer('data', function() {
    this.drawChart();
  }),

  // -------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.drawChart();
  },

  // -------------------------------------------------------------
  // Methods

  drawChart() {
    let component = this;
    let width = component.get('width');
    let height = component.get('height');
    let innerRadius = component.get('innerRadius');
    let outerRadius = component.get('outerRadius');
    let data = component.get('data');
    d3.select(`#${component.elementId}`)
      .select('svg')
      .remove();
    let svg = d3
      .select(`#${component.elementId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    let pie = d3.layout.pie().value(d => d.score);

    let g = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    let arc = d3.svg
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    g.append('path')
      .attr('class', d => `path ${d.data.className}`)
      .attr('d', arc)
      .attr('fill', d => d.data.color);

    g.append('text')
      .attr('transform', function(d) {
        var _d = arc.centroid(d);
        _d[0] *= 1.5;
        _d[1] *= 1.5;
        return `translate(${_d})`;
      })
      .attr('dy', '.50em')
      .attr('class', d => d.data.className)
      .style('text-anchor', 'middle')
      .text(function(d) {
        if (d.data.score < 8) {
          return '';
        }
        return `${d.data.score}%`;
      });
  }
});
