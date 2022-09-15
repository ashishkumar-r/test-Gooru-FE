/**
 * Proficiency matrix domain chart
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

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['proficiency', 'proficiency-matrix'],

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} width
   */
  width: 780,

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
   * Width of the cell
   * @type {Number}
   */
  cellWidth: 35,

  /**
   * height of the cell
   * @type {Number}
   */
  cellHeight: 15,

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
  isTaxonomyDomains: Ember.computed('taxonomyDomains', function() {
    let component = this;
    let length = component.get('taxonomyDomains').length;
    return length > 0;
  }),

  /**
   * subjectId  change will call the function
   */
  onChange: Ember.observer('subject', function() {
    let component = this;
    if (component.get('subject')) {
      component.loadDataBySubject(component.get('subject.id'));
      component.fetchSignatureCompetencyList();
    }
    return null;
  }),

  /**
   * Timeline change will call this function
   */
  onChangeTimeLine: Ember.observer('timeLine', function() {
    let component = this;
    component.loadDataBySubject(component.get('subject.id'));
  }),

  /**
   * Trigger whenever reset chart view mode toggle state got changed.
   */
  onChangeResetToggle: Ember.observer('isExpandChartEnabled', function() {
    let component = this;
    component.toggleChartSize();
  }),

  /**
   * Maintains the pull out state.
   * @type {Boolean}
   */
  showPullOut: false,

  /**
   * Trigger whenever pull out state got changed.
   */
  onChangeShowPullOut: Ember.observer('showPullOut', function() {
    let component = this;
    let showPullOut = component.get('showPullOut');
    if (!showPullOut) {
      component.$('.block-container').remove();
    }
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
   * This should be the height of cells when maximum number of cell size
   * got exceeds for each column.
   * @type {Number}
   */
  reducedHeightOfCells: 5,

  /**
   * Default height of the chart
   * @type {Number}
   */
  defaultHeightOfChart: 450,

  /**
   * Maximum number of reduce cell below
   * @type {Number}
   */
  maxNumberOfReduceCellBelow: 5,

  /**
   * skyline container
   * @type {Object}
   */
  skylineContainer: null,

  /**
   * @type {Boolean}
   * Property to show/hide skyline
   * TODO enabled by default will to handle in future implementation
   */
  isSkylineEnabled: true,

  /**
   * @property {JSON}
   * Property to store currently selected month and year
   */
  timeLine: Ember.computed(function() {
    let component = this;
    return component.getCurMonthYear();
  }),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    if (component.get('subject')) {
      component.set('timeLine', component.getCurMonthYear());
      component.fetchSignatureCompetencyList();
    }
  },

  /**
   * @function fetchSignatureCompetencyList
   * Method to fetch fetchSignatureCompetencyList
   */
  fetchSignatureCompetencyList() {
    let component = this;
    let subject = component.get('subject.id');
    let userId = component.get('userId');
    return Ember.RSVP.hash({
      competencyList: component
        .get('competencyService')
        .getUserSignatureCompetencies(userId, subject)
    }).then(({ competencyList }) => {
      component.set('signatureCompetencyList', competencyList);
    });
  },

  // -------------------------------------------------------------------------
  // Methods

  drawChart(data) {
    let component = this;
    let cellSizeInRow = component.get('taxonomyDomains');
    let numberOfCellsInEachColumn = cellSizeInRow.length;
    component.set('numberOfCellsInEachColumn', numberOfCellsInEachColumn);
    const cellWidth = component.get('cellWidth');
    const cellHeight = component.get('cellHeight');
    const width = Math.round(numberOfCellsInEachColumn * cellWidth);
    component.set('width', width);
    const height = component.get('defaultHeightOfChart');
    component.$('#render-proficiency-matrix').empty();
    const svg = d3
      .select('#render-proficiency-matrix')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    let cellContainer = svg.append('g').attr('id', 'cell-container');
    let skylineContainer = svg.append('g').attr('id', 'skyline-container');
    component.set('skylineContainer', skylineContainer);

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
        return `competency ${skylineClassName} competency-${
          d.xAxisSeq
        } competency-${d.xAxisSeq}-${
          d.yAxisSeq
        } fillArea${d.status.toString()}`;
      })
      .on('click', function(d) {
        let competencyNode = component.$(
          `.competency-${d.xAxisSeq}-${d.yAxisSeq}`
        );
        let className = competencyNode.attr('class');
        if (className.indexOf('competency-more-cells') < 0) {
          component.blockChartContainer(d);
          component.checkSignatureAssessment(d, data);
        }
      });

    cards.exit().remove();
    component.reduceChartHeight();
    component.toggleChartSize();
  },

  loadDataBySubject(subjectId) {
    let component = this;
    let userId = component.get('userId');
    let timeLine = component.get('timeLine');
    component.set('isLoading', true);
    return Ember.RSVP.hash({
      competencyMatrixs: component
        .get('competencyService')
        .getCompetencyMatrixDomain(userId, subjectId, timeLine),
      competencyMatrixCoordinates: component
        .get('competencyService')
        .getCompetencyMatrixCoordinates(subjectId)
    }).then(({ competencyMatrixs, competencyMatrixCoordinates }) => {
      if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
        component.set('isLoading', false);
        component.set('competencyMatrixs', competencyMatrixs.domains);
        let resultSet = component.parseCompetencyData(
          competencyMatrixs.domains,
          competencyMatrixCoordinates
        );
        component.drawChart(resultSet);
        component.sendAction('onGetLastUpdated', competencyMatrixs.lastUpdated);
      } else {
        Ember.Logger.warn('comp is destroyed...');
      }
    }, this);
  },

  parseCompetencyData(competencyMatrixs, competencyMatrixCoordinates) {
    let component = this;
    const cellHeight = component.get('cellHeight');
    let taxonomyDomain = Ember.A();
    let domains = competencyMatrixCoordinates.get('domains');
    let currentXaxis = 1;
    let resultSet = Ember.A();
    let numberOfCellsInEachColumn = Ember.A();
    domains.forEach(domainData => {
      let domainCode = domainData.get('domainCode');
      let domainName = domainData.get('domainName');
      let domainSeq = domainData.get('domainSeq');
      let competencyMatrix = competencyMatrixs.findBy('domainCode', domainCode);
      let competencyMatrixByCompetency = competencyMatrix
        ? competencyMatrix.get('competencies')
        : [];
      if (competencyMatrix && competencyMatrixByCompetency.length > 0) {
        taxonomyDomain.pushObject(domainData);
        let mergeDomainData = Ember.A();
        competencyMatrixByCompetency.forEach(competency => {
          let competencyCode = competency.get('competencyCode');
          let competencyName = competency.get('competencyName');
          let competencySeq = competency.get('competencySeq');
          let status = competency.get('status');
          let data = Ember.Object.create({
            domainName: domainName,
            domainCode: domainCode,
            domainSeq: domainSeq,
            competencyCode: competencyCode,
            competencyName: competencyName,
            competencySeq: competencySeq,
            status: status
          });
          if (status === 2 || status === 3 || status === 4 || status === 5) {
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
    let height = cellHeight * Math.max(...numberOfCellsInEachColumn);
    component.set('height', height);
    component.set('taxonomyDomains', taxonomyDomain);
    return resultSet;
  },

  /**
   * @function checkSignatureAssessment
   * Method to check SignatureAssessment
   */
  checkSignatureAssessment(selectedCompetency) {
    let component = this;
    let competencyMatrixs = component.get('competencyMatrixs');
    let domainCode = selectedCompetency.get('domainCode');
    let signatureCompetencyList = component.get('signatureCompetencyList');
    let showSignatureAssessment = signatureCompetencyList[domainCode].includes(
      selectedCompetency.get('competencyCode')
    );
    selectedCompetency.set('showSignatureAssessment', showSignatureAssessment);
    component.sendAction(
      'onCompetencyPullOut',
      selectedCompetency,
      competencyMatrixs
    );
  },

  blockChartContainer(selectedCompetency) {
    let component = this;
    const cellWidth = component.get('cellWidth');
    const cellHeight = component.get('cellHeight');
    const width = component.get('width');
    let selectedElement = component.$(
      `.competency-${selectedCompetency.xAxisSeq}-${
        selectedCompetency.yAxisSeq
      }`
    );
    let xAxisSeq = selectedElement.attr('x');
    let yAxisSeq = selectedElement.attr('y');
    component.$('.block-container').remove();
    let container = `<div class="block-container" style="width:${width}px">`;
    container += `<div class="selected-competency background${selectedCompetency.status.toString()}"
                       style="width:${cellWidth}px; height:${cellHeight}px; top:${yAxisSeq}px; left:${xAxisSeq}px">
                  </div>`;
    container += '</div>';
    component.$('#render-proficiency-matrix').prepend(container);
  },

  reduceChartBelowCells() {
    let component = this;
    let skylines = component.$('.skyline-competency');
    let maxNumberOfCellsInEachColumn = component.get(
      'maxNumberOfCellsInEachColumn'
    );
    let reducedHeightOfCells = component.get('reducedHeightOfCells');
    let cellHeight = component.get('cellHeight');
    let maxNumberOfReduceCellBelow = component.get(
      'maxNumberOfReduceCellBelow'
    );
    for (let index = 0; index < skylines.length; index++) {
      let skyline = component.$(skylines[index]);
      let skylineYAxisSeq = +skyline.attr('yaxis-seq');
      if (skylineYAxisSeq > maxNumberOfCellsInEachColumn) {
        let aboveMaxCells = skylineYAxisSeq - maxNumberOfCellsInEachColumn;
        let domainColumnIndex = index + 1;
        let competencyCells = component.$(`.competency-${domainColumnIndex}`);
        let belowReduceCount = 1;
        let yAxis = 0;
        for (
          let cellIndex = 0;
          cellIndex < competencyCells.length;
          cellIndex++
        ) {
          let element = component.$(competencyCells[cellIndex]);
          let height = cellHeight;
          if (belowReduceCount < aboveMaxCells) {
            height = reducedHeightOfCells;
          }
          if (cellIndex > 0) {
            if (belowReduceCount <= aboveMaxCells) {
              if (belowReduceCount > maxNumberOfReduceCellBelow) {
                yAxis = yAxis + 0;
              } else {
                yAxis = yAxis + reducedHeightOfCells;
              }
              let className = element.attr('class');
              element.attr(
                'class',
                `${className} competency-more-cells-${domainColumnIndex} competency-more-cells`
              );
              belowReduceCount++;
            } else {
              yAxis = yAxis + cellHeight;
            }
          }
          element.attr('y', yAxis);
          element.attr('height', height);
        }
      }
    }
  },

  reduceChartAboveCells() {
    let component = this;
    let numberOfDomainColumn = component.get('taxonomyDomains').length;
    let maxNumberOfCellsInEachColumn = component.get(
      'maxNumberOfCellsInEachColumn'
    );
    let reducedHeightOfCells = component.get('reducedHeightOfCells');
    for (let index = 1; index <= numberOfDomainColumn; index++) {
      let elements = component.$(`.competency-${index}`);
      let totalCompetencyInDomain = elements.length;
      let belowReducedCellElements = component.$(
        `.competency-more-cells-${index}`
      );
      let numberOfBelowReducedCells = belowReducedCellElements.length;
      let totalCellsWithoutReduce =
        totalCompetencyInDomain - numberOfBelowReducedCells;
      if (totalCellsWithoutReduce > maxNumberOfCellsInEachColumn) {
        let aboveReduceCellIndex =
          numberOfBelowReducedCells > 0
            ? numberOfBelowReducedCells + maxNumberOfCellsInEachColumn
            : maxNumberOfCellsInEachColumn;
        let startIndex = aboveReduceCellIndex + 1;
        let startElement = component.$(`.competency-${index}-${startIndex}`);
        let newYAxis = +startElement.attr('y');
        for (
          let cellIndex = aboveReduceCellIndex;
          cellIndex < elements.length;
          cellIndex++
        ) {
          let element = component.$(elements[cellIndex]);
          element.attr('height', reducedHeightOfCells);
          if (cellIndex > aboveReduceCellIndex) {
            newYAxis = newYAxis + reducedHeightOfCells;
            element.attr('y', newYAxis);
          }
          let className = element.attr('class');
          element.attr(
            'class',
            `${className} competency-more-cells-${index} competency-more-cells`
          );
        }
      }
    }
  },

  reduceChartHeight() {
    let component = this;
    component.reduceChartBelowCells();
    component.reduceChartAboveCells();
    component.drawSkyline();
    let height = component.get('isTaxonomyDomains')
      ? component.get('defaultHeightOfChart')
      : 50;
    component.$('#render-proficiency-matrix').height(height);
    component.$('#render-proficiency-matrix svg').attr('height', height);
  },

  expandChartColumnHeight() {
    let component = this;
    let elements = component.$('.competency');
    for (let index = 0; index < elements.length; index++) {
      let element = component.$(elements[index]);
      let cellHeight = component.get('cellHeight');
      let yAxis = element.attr('copy-yaxis');
      let className = element.attr('class');
      element.attr('height', cellHeight);
      element.attr('class', className);
      element.attr('y', yAxis);
    }

    let height = component.get('height');
    component.$('#render-proficiency-matrix').height(height);
    component.$('#render-proficiency-matrix svg').attr('height', height);

    component.drawSkyline();
  },

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
      y1 = y1 === 0 ? y1 : y1 + cellHeight;
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
  },

  /**
   * @function joinSkyLinePoints
   * Method to draw vertical line to connects sky line points, if necessary
   */
  joinSkyLinePoints(cellIndex, curLinePoint) {
    let component = this;
    let lastSkyLineContainer = component.$(`.sky-line-${cellIndex - 1}`);
    let skyLineContainer = component.get('skylineContainer');
    let lastskyLinePoint = {
      x2: parseInt(lastSkyLineContainer.attr('x2')),
      y2: parseInt(lastSkyLineContainer.attr('y2'))
    };
    //Connect sky line points if last and current points are not same
    if (
      lastSkyLineContainer.length &&
      lastskyLinePoint.y2 !== curLinePoint.y1
    ) {
      //Increase extra height to connect intersection points
      if (lastskyLinePoint.y2 > curLinePoint.y1) {
        lastskyLinePoint.y2 = lastskyLinePoint.y2 + 3;
        curLinePoint.y1 = curLinePoint.y1 - 3;
      } else {
        lastskyLinePoint.y2 = lastskyLinePoint.y2 - 3;
        curLinePoint.y1 = curLinePoint.y1 + 3;
      }

      skyLineContainer
        .append('line')
        .attr('x1', lastskyLinePoint.x2)
        .attr('y1', lastskyLinePoint.y2)
        .attr('x2', curLinePoint.x1)
        .attr('y2', curLinePoint.y1)
        .attr('class', 'sky-line');
    }
  },

  /**
   * @function toggleChartSize
   * Method to toggle chart size between expanded and collapsed
   */
  toggleChartSize() {
    let component = this;
    let isExpandChartEnabled = component.get('isExpandChartEnabled');
    if (isExpandChartEnabled) {
      component.expandChartColumnHeight();
    } else {
      component.reduceChartHeight();
    }
  },

  /**
   * @function getCurMonthYear
   * Method to get current month and year
   */
  getCurMonthYear() {
    let date = new Date();
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  }
});
