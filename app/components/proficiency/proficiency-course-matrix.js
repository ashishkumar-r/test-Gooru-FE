/**
 * Competency matrix chart
 *
 * @module
 * @augments ember/Component
 */
import Ember from 'ember';
import d3 from 'd3';

export default Ember.Component.extend({
  //------------------------------------------------------------------------
  //Dependencies

  i18n: Ember.inject.service(),

  /**
   * competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['proficiency', 'proficiency-course-matrix'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} width
   */
  width: 700,

  /**
   * @property {Number} height
   */
  height: 900,

  /**
   * User id of competency matrix to plot
   * @type {String}
   */
  userId: null,

  /**
   * Different color range based on status
   * @type {Object}
   */
  colorsBasedOnStatus: Ember.Object.create({
    '0': '#e7e8e9',
    '1': '#1aa9eb',
    '2': '#006eb5',
    '3': '#006eb5',
    '4': '#006eb5',
    '5': '#006eb5'
  }),

  /**
   * Width of the cell
   * @type {Number}
   */
  cellWidth: 15,

  /**
   * It will have selected taxonomy subject courses
   * @type {Object}
   */
  taxonomyCourses: Ember.A(),

  /**
   * @type {Boolean}
   * Property to show/hide loading spinner
   */
  isLoading: false,

  /**
   * subject  change will call the function
   */
  onChange: Ember.observer('subject', function() {
    let component = this;
    component.loadDataBySubject(component.get('subject.id'));
    return null;
  }),

  /**
   * Maintains the pull out state.
   * @type {Boolean}
   */
  showPullOut: false,

  /**
   * Trigger whenever pull out state got changed.
   */
  onShowPullOut: Ember.observer('showPullOut', function() {
    let component = this;
    let showPullOut = component.get('showPullOut');
    if (!showPullOut) {
      component.$('.block-container').remove();
    }
  }),

  /**
   * It  will have chart value width scroll width handling
   * @type {String}
   */
  istaxonomyCourses: Ember.computed('taxonomyCourses', function() {
    let component = this;
    let length = component.get('taxonomyCourses').length;
    return length > 0;
  }),

  /**
   * @type {Boolean}
   * Property used to determine whether user has competency or not
   */
  isCompetenciesNull: false,

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    let component = this;
    component.loadDataBySubject(component.get('subject.id'));
  },

  // -------------------------------------------------------------------------
  // actions

  // -------------------------------------------------------------------------
  // Methods

  drawChart: function(data) {
    let component = this;
    const colorsBasedOnStatus = component.get('colorsBasedOnStatus');
    const cellWidth = component.get('cellWidth');
    const width = component.get('width');
    const numberOfCourses = component.get('taxonomyCourses').length;
    const height = cellWidth * (numberOfCourses * 2);
    component.$('#render-proficiency-course-matrix').empty();
    const svg = d3
      .select('#render-proficiency-course-matrix')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g');
    const cards = svg.selectAll('.competency').data(data);
    cards
      .enter()
      .append('rect')
      .attr('x', d => (d.xAxisSeq - 1) * cellWidth)
      .attr('y', d => (d.yAxisSeq - 1) * cellWidth)
      .attr('class', d => {
        return d.isEmpty ? 'no-competency' : 'competency';
      })
      .attr('width', cellWidth)
      .attr('height', cellWidth)
      .on('click', function(d) {
        component.blockChartContainer(d);
        component.sendAction('onCompetencyPullOut', d);
      })
      .style('fill', '#FFF')
      .transition()
      .duration(1000)
      .style('fill', d => {
        return d.isEmpty
          ? '#FFF'
          : colorsBasedOnStatus.get(d.status.toString());
      });
    cards.exit().remove();
  },

  loadDataBySubject: function(subjectId) {
    let component = this;
    let userId = component.get('userId');
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      competencyMatrixs: component
        .get('competencyService')
        .getCompetencyMatrixCourse(userId, subjectId),
      competencyMatrixCoordinates: component
        .get('competencyService')
        .getCompetencyMatrixCoordinates(subjectId)
    }).then(({ competencyMatrixs, competencyMatrixCoordinates }) => {
      if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
        component.set('isLoading', false);
        component.set(
          'isCompetenciesNull',
          !(competencyMatrixs.courses.length > 0)
        );
        let resultSet = component.parseCompetencyData(
          competencyMatrixs.courses,
          competencyMatrixCoordinates
        );
        component.drawChart(resultSet);
        component.sendAction('onGetLastUpdated', competencyMatrixs.lastUpdated);
      } else {
        Ember.Logger.warn('comp is destroyed...');
      }
    });
  },

  parseCompetencyData: function(
    competencyMatrixs,
    competencyMatrixCoordinates
  ) {
    let component = this;
    let courses = competencyMatrixCoordinates.get('courses').toArray();
    let taxonomyCourses = Ember.A();
    let currentYaxis = 1;
    let resultSet = Ember.A();
    courses.forEach(courseData => {
      let courseCode = courseData.get('courseCode');
      let competencyMatrix = competencyMatrixs.findBy('courseCode', courseCode);
      let competencies = competencyMatrix
        ? competencyMatrix.get('competencies')
        : [];
      if (competencyMatrix && competencies.length > 0) {
        let competencyData = Ember.A();
        competencies.forEach(competency => {
          let competencyCode = competency.get('competencyCode');
          let competencyName = competency.get('competencyName');
          let competencySeq = competency.get('competencySeq');
          let status = competency.get('status');
          let data = Ember.Object.create({
            courseCode: courseCode,
            competencyCode: competencyCode,
            competencyName: competencyName,
            competencySeq: competencySeq,
            status: status
          });
          if (status === 2 || status === 3 || status === 4 || status === 5) {
            competencyData.forEach(data => {
              data.set('status', status);
            });
          }
          competencyData.pushObject(data);
        });

        let cellIndex = 1;
        competencyData.forEach(data => {
          data.set('xAxisSeq', cellIndex);
          data.set('yAxisSeq', currentYaxis);
          data.set('isEmpty', false);
          resultSet.pushObject(data);
          cellIndex++;
        });
        currentYaxis = currentYaxis + 2;
      } else {
        let firstElementPos = 1;
        let competencyData = Ember.Object.create({
          xAxisSeq: firstElementPos,
          yAxisSeq: currentYaxis,
          isEmpty: true,
          courseCode: courseCode
        });
        currentYaxis += 2;
        resultSet.pushObject(competencyData);
      }
      taxonomyCourses.pushObject(courseData);
    });
    component.set('taxonomyCourses', taxonomyCourses);
    return resultSet;
  },

  blockChartContainer: function(selectedCompetency) {
    let component = this;
    const cellWidth = component.get('cellWidth');
    const width = component.get('width');
    let xAxisSeq = (selectedCompetency.xAxisSeq - 1) * cellWidth;
    let yAxisSeq = (selectedCompetency.yAxisSeq - 1) * cellWidth;
    const colorsBasedOnStatus = component.get('colorsBasedOnStatus');
    let color = colorsBasedOnStatus.get(selectedCompetency.status.toString());
    component.$('.block-container').remove();
    let container = `<div class="block-container" style="width:${width}px">`;
    container += `<div class="selected-competency"  style="width:${cellWidth}px; height:${cellWidth}px; background-color:${color};top:${yAxisSeq}px; left:${xAxisSeq}px"></div>`;
    container += '</div>';
    component.$('#render-proficiency-course-matrix').prepend(container);
  }
});
