import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import d3 from 'd3';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['backdrop-pull-ups', 'pull-up-question-report'],

  // -------------------------------------------------------------------------
  // Properties

  isEmptyContent: false,

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    let userArray = [];
    const data = this.get('questionData');
    data.questionScalePoints.map(dataObj => {
      if (dataObj.userInfo.length > 0) {
        userArray.pushObject(dataObj.userInfo);
      }
    });
    if (userArray.length > 0) {
      this.barChartReport(this.get('questionData'));
    } else {
      this.set('isEmptyContent', true);
    }
  },

  barChartReport(data) {
    const component = this;
    let members = component.get('context.classMembers').length;
    // set the dimensions and margins of the graph
    var margin = {
        top: 20,
        right: 30,
        bottom: 40,
        left: 150
      },
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    d3.select(`#${this.elementId} #likert-bar-chart svg`).remove();

    // append the svg object to the body of the page
    var svg = d3
      .select(`#${this.elementId} #likert-bar-chart`)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .on('click', function() {
        component.set('isUserReport', true);
        component.set('isUserQuestionData', data);
        component.set('userContext', component.get('context'));
      })
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    var x = d3.scale
      .linear()
      .domain([0, members])
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.svg
          .axis()
          .scale(x)
          .orient('bottom')
          .ticks(5)
          .tickSize(2)
          .tickFormat(d3.format('d'))
      )
      .selectAll('text')
      .attr('transform', 'translate(0,0)rotate(0)')
      .style('text-anchor', 'end');

    // Y axis
    var y = d3.scale
      .ordinal()
      .rangeBands([0, height], 0.1)
      .domain(
        data.questionScalePoints.map(function(d) {
          return d.levelName;
        })
      );
    svg.append('g').call(
      d3.svg
        .axis()
        .scale(y)
        .orient('left')
        .tickSize(2)
    );

    //Bars
    svg
      .selectAll('myRect')
      .data(data.questionScalePoints)
      .enter()
      .append('rect')
      .attr('x', x(0))
      .attr('y', function(d) {
        return y(d.levelName);
      })
      .attr('width', function(d) {
        return x(d.userInfo.length);
      })
      .attr('height', y.rangeBand())
      .attr('fill', '#5792ad');
  }
});
