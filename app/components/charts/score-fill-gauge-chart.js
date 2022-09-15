import Ember from 'ember';
import d3 from 'd3';
import { getGradeRange, formatTime } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['charts', 'score-fill-gauge-chart'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadScoreFillGauge();
  },

  observeScoreChanges: Ember.observer(
    'scoreInPercentage',
    'timeSpent',
    function() {
      const component = this;
      component.loadScoreFillGauge();
    }
  ),
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} scoreInPercentage
   */
  scoreInPercentage: null,

  /**
   * @property {Number} timeSpent
   */
  timeSpent: null,

  /**
   * @property {Number} chartHeight
   */
  chartHeight: 240,

  /**
   * @property {Number} chartWidth
   */
  chartWidth: '100%',

  /**
   * @property {Object} chartProperties
   */
  chartProperties: Ember.computed(function() {
    return Ember.Object.create({
      minValue: 0, // The gauge minimum value.
      maxValue: 100, // The gauge maximum value.
      waveHeight: 0.01, // The wave height as a percentage of the radius of the wave circle.
      waveCount: 15, // The number of full waves per width of the wave circle.
      waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
      waveAnimateTime: 1000, // The amount of time in milliseconds for a full wave to enter the wave circle.
      waveOffset: 0.25 // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
    });
  }),

  /**
   * @property {Number} timeSpentPos
   */
  timeSpentPos: 200,

  /**
   * @property {Number} scorePos
   */
  scorePos: 120,

  /**
   * @property {Number} placeholderPos
   */
  placeholderPos: -1,

  /**
   * @property {String} placeholderText
   */
  placeholderText: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadScoreFillGauge
   * Method to load score fill gauge chart
   */
  loadScoreFillGauge() {
    const component = this;
    component.clearChart();
    let scoreInPercentage = component.get('scoreInPercentage');
    let timeSpent = component.get('timeSpent');
    let chartProperties = component.get('chartProperties');
    let elementId = `#${component.elementId}`;
    let fillGaugeElement = d3.select(`${elementId} svg`);
    let fillGaugeElementWidth = parseInt(fillGaugeElement.style('width'));
    let fillPercent =
      Math.max(
        chartProperties.minValue,
        Math.min(chartProperties.maxValue, scoreInPercentage)
      ) / chartProperties.maxValue;
    let waveHeightScale = d3.scale
      .linear()
      .range([0, chartProperties.waveHeight, 0])
      .domain([0, 50, 100]);
    let waveHeight = fillGaugeElementWidth * waveHeightScale(fillPercent * 100);
    let waveLength = (fillGaugeElementWidth * 2) / chartProperties.waveCount;
    let waveClipCount = 1 + chartProperties.waveCount;
    let waveClipWidth = waveLength * waveClipCount;
    let chartHeight = component.get('chartHeight');
    let chartWidth = component.get('chartWidth');

    // Data for building the clip wave area.
    let data = [];
    for (let i = 0; i <= 40 * waveClipCount; i++) {
      data.push({
        x: i / (40 * waveClipCount),
        y: i / 40
      });
    }

    // Scales for controlling the size of the clipping path.
    let waveScaleX = d3.scale
      .linear()
      .range([0, waveClipWidth])
      .domain([0, 1]);
    let waveScaleY = d3.scale
      .linear()
      .range([0, waveHeight])
      .domain([0, 1]);

    // Scales for controlling the position of the clipping path.
    let waveRiseScale = d3.scale
      .linear()
      // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
      // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
      // circle at 100%.

      .range([chartHeight, 0])
      .domain([0, 1]);
    let waveAnimateScale = d3.scale
      .linear()
      .range([0, waveClipWidth - fillGaugeElementWidth * 2]) // Push the clip area one full wave then snap back.
      .domain([0, 1]);

    // Center the gauge within the parent SVG.
    let gaugeGroup = fillGaugeElement
      .append('g')
      .attr('transform', 'translate(0, 0)');

    // The clipping wave area.
    let clipArea = d3.svg
      .area()
      .x(function(d) {
        return waveScaleX(d.x);
      })
      .y0(function(d) {
        return waveScaleY(
          Math.sin(
            Math.PI * 2 * chartProperties.waveOffset * -1 +
              Math.PI * 2 * (1 - chartProperties.waveCount) +
              d.y * 2 * Math.PI
          )
        );
      })
      .y1(function() {
        return chartHeight;
      });
    let waveGroup = gaugeGroup
      .append('defs')
      .append('clipPath')
      .attr('id', `clipWave${elementId}`);
    let wave = waveGroup
      .append('path')
      .datum(data)
      .attr('d', clipArea);

    // The inner circle with the clipping wave attached.
    let fillCircleGroup = gaugeGroup
      .append('g')
      .attr('clip-path', `url(#clipWave${elementId})`);
    fillCircleGroup
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('x', 0)
      .attr('y', 0)
      .attr('class', `fill-range-${getGradeRange(scoreInPercentage)}`);

    if (scoreInPercentage !== null && scoreInPercentage !== undefined) {
      fillGaugeElement
        .append('text')
        .attr('transform', `translate(${fillGaugeElementWidth / 2})`)
        .attr('y', component.get('scorePos'))
        .attr('class', 'score-percentage')
        .append('tspan')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .text(`${scoreInPercentage}%`);
    }

    if (!scoreInPercentage && timeSpent) {
      fillGaugeElement
        .append('text')
        .attr('transform', `translate(${fillGaugeElementWidth / 2})`)
        .attr('y', component.get('scorePos'))
        .attr('class', 'score-percentage')
        .append('tspan')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .text(`${timeSpent ? formatTime(timeSpent) : '--'}`);
    }

    if (timeSpent !== null && timeSpent !== undefined) {
      fillGaugeElement
        .append('text')
        .attr('y', component.get('timeSpentPos'))
        .attr('transform', `translate(${fillGaugeElementWidth / 2})`)
        .attr('class', 'total-timespent')
        .append('tspan')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .text(`${timeSpent ? formatTime(timeSpent) : '--'}`);
    }

    if (component.get('placeholderText')) {
      fillGaugeElement
        .append('text')
        .attr('y', component.get('placeholderPos'))
        .attr('transform', `translate(${fillGaugeElementWidth / 2})`)
        .attr('class', 'placeholder-text')
        .append('tspan')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .text(component.get('placeholderText'));
    }

    let waveGroupXPosition = fillGaugeElementWidth * 2 - waveClipWidth;
    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    waveGroup
      .attr('transform', `translate(${waveGroupXPosition},${waveRiseScale(0)})`)
      .transition()
      .duration(chartProperties.waveRiseTime)
      .attr(
        'transform',
        `translate(${waveGroupXPosition},${waveRiseScale(fillPercent)})`
      )
      .each('start', function() {
        wave.attr('transform', 'translate(1,0)');
      }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.

    /**
     * @function animateWave
     * Method to animate wave
     */
    function animateWave() {
      wave
        .transition()
        .duration(chartProperties.waveAnimateTime)
        .ease('linear')
        .attr('transform', `translate(${waveAnimateScale(1)},0)`)
        .each('end', function() {
          wave.attr('transform', `translate(${waveAnimateScale(0)},0)`);
          animateWave(chartProperties.waveAnimateTime);
        });
    }

    //Animate wave by default
    animateWave();
  },

  clearChart() {
    const component = this;
    component.$('svg').empty();
  }
});
