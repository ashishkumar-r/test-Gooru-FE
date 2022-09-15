import Ember from 'ember';
import d3 from 'd3';

export default Ember.Component.extend({
  // -------------------------------------------------------------
  // Attributes
  classNames: ['gru-dount-chart'],

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

  watchDataChange: Ember.observer('data', function() {
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

    svg
      .selectAll('.path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('class', d => `path ${d.data.className}`)
      .attr(
        'd',
        d3.svg
          .arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
      );

    if (component.get('totalScore') === null) {
      svg
        .append('text')
        .attr('class', 'text-content')
        .attr('dx', -9)
        .attr('dy', 10)
        .text(`${'--'}`);
    } else {
      svg
        .append('text')
        .attr('class', 'text-content')
        .attr('dx', () =>
          component.get('totalScore') <= 9
            ? -16
            : -21 && component.get('totalScore') <= 99
              ? -27
              : -36
        )
        .attr('dy', 10)
        .text(`${component.get('totalScore')}%`);
    }
  }
});
