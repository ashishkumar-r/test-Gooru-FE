/**
 * Route suggestion proficiency matrix
 *
 * @module
 * @augments ember/Component
 */
import Ember from 'ember';
import d3 from 'd3';
import {getSubjectIdFromSubjectBucket} from 'gooru-web/utils/utils';

export default Ember.Component.extend({

  //------------------------------------------------------------------------
  //Attributes

  classNames: ['route-suggestion-proficiency-matrix'],

  //------------------------------------------------------------------------
  //Dependencies

  i18n: Ember.inject.service(),

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
  taxonomyService: Ember.inject.service('taxonomy'),


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
   * @type {String}
   * route0 suggested competency color
   */
  route0SuggetionColor: '#ef8f2f',

  /**
   * @type {Number}
   * Width of individual cell
   */
  cellWidth: 30,

  /**
   * @type {Number}
   * Height of matrix chart
   */

  maxHeightOfChart: 340,

  //------------------------------------------------------------------------
  //Events

  didInsertElement() {
    let component = this;
    let route0Suggetions = component.get('route0.userCompetencyRoute.domains');
    if (component.get('course.subject')) {
      component.getUserBaselineCompetencies().then(function(userBaseLineCompetencies) {
        component.getCompetencyMatrixCoordinates().then(function(competencyMatrixCoordinates) {
          component.parseCompetencyData(userBaseLineCompetencies, competencyMatrixCoordinates, route0Suggetions);
        });
      });
    }
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    component.$('.scrollable-chart').scrollTop(component.get('height'));
  },

  //------------------------------------------------------------------------
  //Methods

  /**
   * @function getUserBaselineCompetencies
   * Method to fetch user baseline competencies
   */
  getUserBaselineCompetencies() {
    let component = this;
    let competencyService = component.get('competencyService');
    let userId = component.get('session.userId');
    let classId = component.get('class.id');
    let courseId = component.get('course.id');
    let userBaseLineCompetenciesPromise = Ember.RSVP.resolve(competencyService.getUserProficiencyBaseLine(classId, courseId, userId));
    return Ember.RSVP.hash({
      userBaseLineCompetencies: userBaseLineCompetenciesPromise
    }).then(function(hash) {
      return hash.userBaseLineCompetencies.domains;
    });
  },

  /**
   * @function getCompetencyMatrixCoordinates
   * Method to fetch competency matrix coordinates
   */
  getCompetencyMatrixCoordinates() {
    let component = this;
    let competencyService = component.get('competencyService');
    let subjectBucket = component.get('course.subject');
    let subjectId = getSubjectIdFromSubjectBucket(subjectBucket);
    let domainMatrixCoordinatesPromise = Ember.RSVP.resolve(competencyService.getCompetencyMatrixCoordinates(subjectId));
    return Ember.RSVP.hash({
      domainMatrixCoordinates: domainMatrixCoordinatesPromise
    }).then(function(hash) {
      return hash.domainMatrixCoordinates.domains;
    });
  },

  /**
   * @function parseCompetencyData
   * Method to parse baseline competencies, coordinates and route0 suggestions
   */
  parseCompetencyData(userBaseLineCompetencies, competencyDomains, route0Suggetions) {
    let component = this;
    let maxHeightOfChart = component.get('maxHeightOfChart');
    let taxonomyDomains = Ember.A();
    let currentXaxis = 1;
    let resultSet = Ember.A();
    let numberOfCellsInEachColumn = Ember.A();
    competencyDomains.forEach(domainData => {
      let domainCode = domainData.get('domainCode');
      let domainName = domainData.get('domainName');
      let domainSeq = domainData.get('domainSeq');
      let competencyMatrix = userBaseLineCompetencies.findBy('domainCode', domainCode);
      let competencyMatrixByCompetency = competencyMatrix
        ? competencyMatrix.get('competencies')
        : [];
      if (competencyMatrix && competencyMatrixByCompetency.length > 0) {
        taxonomyDomains.pushObject(domainData);
        let mergeDomainData = Ember.A();
        let route0SuggetionByDomain = route0Suggetions.findBy('domainCode', domainCode);

        competencyMatrixByCompetency.forEach(competency => {
          let competencyCode = competency.get('competencyCode');
          let competencyName = competency.get('competencyName');
          let competencySeq = competency.get('competencySeq');
          let status = competency.get('status');
          let isroute0SuggestedCompetency = false;
          if (route0SuggetionByDomain) {
            let route0SuggestedCompetencies = route0SuggetionByDomain.path;
            let route0SuggestedCompetecy = route0SuggestedCompetencies.findBy('competencyCode', competencyCode);
            isroute0SuggestedCompetency = !!route0SuggestedCompetecy;
          }

          let data = Ember.Object.create({
            domainName: domainName,
            domainCode: domainCode,
            domainSeq: domainSeq,
            competencyCode: competencyCode,
            competencyName: competencyName,
            competencySeq: competencySeq,
            status: status,
            isroute0SuggestedCompetency
          });
          if (status === 4 || status === 5) {
            mergeDomainData.forEach(data => {
              data.set('status', status);
              data.set('isMastery', true);
            });
            data.set('isMastery', true);
          }
          mergeDomainData.pushObject(data);
        });
        let masteredCompetencies = mergeDomainData.filterBy('isMastery', true);
        if (masteredCompetencies && masteredCompetencies.length === 0) {
          mergeDomainData.objectAt(0).set('skyline', true);
        } else {
          let numberOfMasteredCompetency = masteredCompetencies.length - 1;
          mergeDomainData
            .objectAt(numberOfMasteredCompetency)
            .set('skyline', true);
          mergeDomainData
            .objectAt(numberOfMasteredCompetency)
            .set('mastered', true);
        }

        let cellIndex = 1;
        numberOfCellsInEachColumn.push(mergeDomainData.length);
        mergeDomainData.forEach(data => {
          data.set('xAxisSeq', currentXaxis);
          data.set('yAxisSeq', cellIndex);
          resultSet.pushObject(data);
          cellIndex++;
        });
        currentXaxis = currentXaxis + 1;
      }
    });
    component.set('height', maxHeightOfChart);
    component.set('cellHeight', maxHeightOfChart / Math.max(...numberOfCellsInEachColumn));
    component.set('taxonomyDomains', taxonomyDomains);
    component.drawChart(resultSet);
  },

  /**
   * @function drawChart
   * Method to plot competency chart
   */
  drawChart(data) {
    let component = this;
    let cellSizeInRow = component.get('taxonomyDomains');
    let numberOfCellsInEachColumn = cellSizeInRow.length;
    component.set('numberOfCellsInEachColumn', numberOfCellsInEachColumn);
    const colorsBasedOnStatus = component.get('colorsBasedOnStatus');
    const cellWidth = component.get('cellWidth');
    const cellHeight = component.get('cellHeight');
    const suggestionCompetencyColor = component.get('route0SuggetionColor');
    const width = Math.round(numberOfCellsInEachColumn * cellWidth);
    component.set('width', width);
    const height = component.get('height');
    component.$('#route-suggestion-chart').empty();
    const svg = d3
      .select('#route-suggestion-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    let cellContainer = svg.append('g').attr('id', 'cell-container');
    let skylineContainer = svg.append('g').attr('id', 'skyline-container');
    let baseLineContainer = svg.append('g').attr('id', 'baseline-container');
    component.set('skylineContainer', skylineContainer);
    component.set('baseLineContainer', baseLineContainer);
    const cards = cellContainer.selectAll('.competency').data(data);
    cards
      .enter()
      .append('rect')
      .attr('x', d => (d.xAxisSeq - 1) * cellWidth)
      .attr('y', d => (d.yAxisSeq - 1) * cellHeight)
      .attr('copy-yaxis', d => (d.yAxisSeq - 1) * cellHeight)
      .attr('class', d => {
        let skylineClassName = d.skyline ? 'skyline-competency' : '';
        return `competency ${skylineClassName} competency-${
          d.xAxisSeq
        } competency-${d.xAxisSeq}-${d.yAxisSeq}`;
      })
      .attr('copy-class-name', d => {
        let skylineClassName = d.skyline ? 'skyline-competency' : '';
        return `competency ${skylineClassName} competency-${
          d.xAxisSeq
        } competency-${d.xAxisSeq}-${d.yAxisSeq}`;
      })
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('yaxis-seq', d => d.yAxisSeq)
      .style('fill', '#EAEAEA')
      .transition()
      .duration(1000)
      .style('fill', d => {
        return d.isroute0SuggestedCompetency ? suggestionCompetencyColor : colorsBasedOnStatus.get(d.status.toString());
      });
    cards.exit().remove();
  }


});
