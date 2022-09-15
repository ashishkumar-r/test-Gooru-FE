import Ember from 'ember';
import d3 from 'd3';
import { getGradeColor } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['atc-chart'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * Analytics Service
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * Class Service
   */
  classService: Ember.inject.service('api-sdk/class'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    if (component.get('isPremiumClass')) {
      component.loadPremiumAtcChartData();
    } else {
      component.loadClassicAtcChartData();
    }
  },

  /**
   * Observer to watch class data changes
   */
  classDataObserver: Ember.observer('classData', function() {
    let component = this;
    d3.select('svg.atc-chart').remove();
    d3.select('div.atc-tooltip').remove();
    if (component.get('isPremiumClass')) {
      component.loadPremiumAtcChartData();
    } else {
      component.loadClassicAtcChartData();
    }
  }),

  /**
   * Observer to watch chart data changes
   */
  chartDataObserver: Ember.observer('chartData', function() {
    const component = this;
    d3.select('svg.atc-chart').remove();
    d3.select('div.atc-tooltip').remove();
    component.drawchart();
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /*
     * Action triggered when the user click reset zoom
     */
    onClearZoom() {
      const component = this;
      d3.select('svg.atc-chart').remove();
      d3.select('div.atc-tooltip').remove();
      component.drawchart();
      component.set('isZoomInView', false);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadClassicAtcChartData
   * Method to load classic course atc view chart data
   */
  loadClassicAtcChartData() {
    const component = this;
    component.set('isLoading', true);
    let performanceSummaryPromise = component.getClassicAtcPerformanceSummary();
    performanceSummaryPromise.then(function(performanceSummary) {
      component.getClassMembers().then(function(classMembers) {
        let studentData = component.getStudentWisePerformance(
          classMembers,
          performanceSummary
        );
        component.set('chartData', studentData);
        component.set('isShowChart', true);
      });
    });
  },

  /**
   * @function loadPremiumAtcChartData
   * Method to load premium course atc view chart data
   */
  loadPremiumAtcChartData() {
    const component = this;
    component.set('isLoading', true);
    if (component.get('subjectCode')) {
      let performanceSummaryPromise = component.getPremiumAtcPerformanceSummary();
      performanceSummaryPromise.then(function(performanceSummary) {
        component.getClassMembers().then(function(classMembers) {
          let studentData = component.getStudentWisePerformance(
            classMembers,
            performanceSummary
          );
          component.set('chartData', studentData);
          component.set('isShowChart', true);
        });
      });
    } else {
      component.set('isLoading', false);
    }
  },

  /**
   * @function getClassicAtcPerformanceSummary
   * Method to fetch class performance for the ATC view
   */
  getClassicAtcPerformanceSummary() {
    const component = this;
    const analyticsService = component.get('analyticsService');
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    return Ember.RSVP.resolve(
      analyticsService.getAtcPerformanceSummary(classId, courseId)
    );
  },

  /**
   * @function getPremiumAtcPerformanceSummary
   * Method to fetch premium class performance for the ATC view
   */
  getPremiumAtcPerformanceSummary() {
    const component = this;
    const analyticsService = component.get('analyticsService');
    let classId = component.get('classId');
    let subjectCode = component.get('subjectCode');
    return Ember.RSVP.resolve(
      analyticsService.getAtcPerformanceSummaryPremiumClass(
        classId,
        subjectCode
      )
    );
  },

  /**
   * @function getClassMembers
   * Method to fetch class members
   */
  getClassMembers() {
    const component = this;
    const classService = component.get('classService');
    let classId = component.get('classId');
    let classMembersPromise = Ember.RSVP.resolve(
      classService.readClassMembers(classId)
    );
    return Ember.RSVP.hash({
      classMembers: classMembersPromise
    }).then(function(hash) {
      return hash.classMembers.members;
    });
  },

  /**
   * @function getStudentWisePerformance
   * Method to organize student wise performance data
   */
  getStudentWisePerformance(students, performances) {
    const component = this;
    let studentsPerformanceData = Ember.A([]);
    if (students && Ember.isArray(students)) {
      students.map(student => {
        let studentPerformance = performances.findBy('userId', student.id);
        let studentData = {
          id: student.id,
          thumbnail: student.avatarUrl,
          identity: component.getStudentIdentity(student),
          score: 0,
          progress: 0,
          fullName: `${student.lastName}, ${student.firstName}`
        };

        if (component.get('isPremiumClass') && studentPerformance) {
          studentData.totalComptency = studentPerformance.totalCompetency || 0;
          studentData.completedCompetency =
            studentPerformance.completedCompetency || 0;
          studentData.progress =
            Math.round(studentPerformance.progress * 100) / 100 || 0;
          studentData.score =
            Math.round(studentPerformance.score * 100) / 100 || 0;
        } else if (studentPerformance) {
          studentData.progress =
            Math.round(studentPerformance.progress * 100) / 100 || 0;
          studentData.score =
            Math.round(studentPerformance.score * 100) / 100 || 0;
        }

        studentsPerformanceData.push(studentData);
      });
    }
    return studentsPerformanceData;
  },

  /**
   * @function getStudentIdentity
   * Method to find out student identity to show in the ATC view chart
   */
  getStudentIdentity(student) {
    let identity = 'NA';
    if (student) {
      if (student.firstName || student.lastName) {
        let firstName = student.firstName;
        let lastName = student.lastName;
        identity = `${lastName ? lastName.charAt(0) : ''} ${
          firstName ? firstName.charAt(0) : ''
        }`;
      } else if (student.email) {
        let validEmailChars = student.email.split('@')[0];
        identity = validEmailChars.substring(0, 2);
      } else if (student.username) {
        identity = student.username.substring(0, 2);
      }
    }
    return identity;
  },

  /**
   * @function drawchart
   * Method to draw ATC view chart
   */
  drawchart() {
    let component = this;
    var margin = { top: 20, right: 100, bottom: 50, left: 100 },
      width = 960 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

    var dataset = component.get('chartData');

    var maxScore = d3.max(dataset, function(d) {
      return d.score;
    });
    var maxProgress = d3.max(dataset, function(d) {
      return d.progress;
    });
    var minScore = d3.min(dataset, function(d) {
      return d.score;
    });
    var minProgress = d3.min(dataset, function(d) {
      return d.progress;
    });
    var totalCompetencyCount =
      d3.min(dataset, function(d) {
        return d.totalComptency;
      }) || 100;
    var minCompletedCompetencyCount =
      d3.min(dataset, function(d) {
        return d.completedCompetency;
      }) || 0;
    var maxCompletedCompetencyCount =
      d3.max(dataset, function(d) {
        return d.completedCompetency;
      }) || 0;

    var xAxisDomain = [0, 100];
    var yAxisDomain = [0, 100];

    if (component.get('isPremiumClass')) {
      if (
        maxCompletedCompetencyCount === totalCompetencyCount ||
        minCompletedCompetencyCount === 0
      ) {
        xAxisDomain = [-10, totalCompetencyCount + 10];
      } else {
        xAxisDomain = [0, totalCompetencyCount];
      }
    } else if (maxProgress === 100 || minProgress === 0) {
      xAxisDomain = [-10, 110];
    }

    if (maxScore === 100 || minScore === 0) {
      yAxisDomain = [-10, 110];
    }

    var xScale = d3.scale
      .linear()
      .domain(xAxisDomain)
      .range([0, width]);

    var yScale = d3.scale
      .linear()
      .domain(yAxisDomain)
      .range([height, 0]);

    var xAxis = d3.svg
      .axis()
      .scale(xScale)
      .orient('bottom')
      .tickValues(d3.range(xAxisDomain[0], xAxisDomain[1], 10))
      .innerTickSize(-height)
      .outerTickSize(-380)
      .tickPadding(10);

    var yAxis = d3.svg
      .axis()
      .scale(yScale)
      .orient('left')
      .tickValues(d3.range(yAxisDomain[0], yAxisDomain[1], 10))
      .innerTickSize(-width)
      .outerTickSize(-760)
      .tickPadding(10);

    var svg = d3
      .select(component.element)
      .append('svg')
      .attr('class', 'atc-chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(
        d3.behavior
          .zoom()
          .scaleExtent([1, 10])
          .x(xScale)
          .y(yScale)
          .on('zoom', function() {
            svg.select('.x.axis').call(xAxis);
            svg.select('.y.axis').call(yAxis);
            svg.selectAll('.node-point').attr('transform', function(d) {
              if (component.get('isPremiumClass')) {
                return `translate(${xScale(d.completedCompetency)}, ${yScale(
                  d.score
                )})`;
              } else {
                return `translate(${xScale(d.progress)}, ${yScale(d.score)})`;
              }
            });
            component.cleanUpChart();
            component.set('isZoomInView', true);
          })
      )
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    svg
      .append('g')
      .attr('transform', 'translate(-498, 270) rotate(-90)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', '50')
      .attr('y', '445')
      .text('Performance');

    svg
      .append('g')
      .attr('transform', 'translate(350, 40) rotate(0)')
      .append('text')
      .attr('class', 'placeholder')
      .attr('x', '0')
      .attr('y', height)
      .text('Progress');

    var tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'atc-tooltip')
      .style('position', 'absolute')
      .style('z-index', '9999')
      .style('visibility', 'hidden');

    var studentNodes = svg
      .selectAll('.student-nodes')
      .data(dataset)
      .enter()
      .append('g')
      .attr('transform', function(d) {
        if (component.get('isPremiumClass')) {
          return `translate(${xScale(d.completedCompetency)}, ${yScale(
            d.score
          )})`;
        } else {
          return `translate(${xScale(d.progress)}, ${yScale(d.score)})`;
        }
      })
      .attr('class', 'node-point')
      .on('mouseover', function(d) {
        var tooltipHtml = '<table>';
        tooltipHtml += `<tr> <td>Name:</td> <td> &nbsp; ${d.fullName}</td> </tr>`;
        tooltipHtml += `<tr> <td>Performance:</td> <td> &nbsp; ${d.score} %</td> </tr>`;
        tooltipHtml += `<tr> <td>Progress:</td> <td> &nbsp; ${d.progress} %</td> </tr>`;
        if (component.get('isPremiumClass')) {
          tooltipHtml += `<tr><td>Total Competencies:</td><td>&nbsp;${d.totalComptency}</td></tr>`;
          tooltipHtml += `<tr><td>Competencies Completed:</td><td>&nbsp;${d.completedCompetency}</td></tr>`;
        }
        tooltipHtml += '</table>';

        tooltip
          .html(tooltipHtml)
          .style('left', `${d3.event.pageX}px`)
          .style('top', `${d3.event.pageY - 28}px`)
          .style('margin-left', '30px');
        return tooltip.style('visibility', 'visible');
      })
      .on('mouseout', function() {
        return tooltip.style('visibility', 'hidden');
      });

    studentNodes
      .append('circle')
      .attr('cx', 5)
      .attr('cy', 5)
      .attr('r', 16)
      .style('fill', function(d) {
        return getGradeColor(d.score);
      });

    studentNodes
      .append('svg:image')
      .attr('class', 'student-profile')
      .attr('x', -7)
      .attr('y', -7)
      .attr({
        'xlink:href': function(d) {
          return d.thumbnail;
        },
        width: 24,
        height: 24
      });

    studentNodes
      .append('text')
      .attr('class', 'student-info')
      .attr('x', -3)
      .attr('y', 30)
      .text(function(d) {
        return d.identity;
      });

    component.cleanUpChart();
    component.set('isLoading', false);
  },

  /**
   * @function cleanUpChart
   * Method to clean up chart views as per requirement
   */
  cleanUpChart() {
    let component = this;
    const axes = ['x', 'y'];
    axes.map(axis => {
      var axisContainer = d3.selectAll(`.${axis}.axis .tick`);
      //axisContainer.attr('style', function(d, i) {
      axisContainer.attr('style', function() {
        var curAxisElement = d3.select(this);
        var curAxisText = curAxisElement.select('text');
        if (component.get('isPremiumClass') && axis === 'x') {
          curAxisText.text(`${curAxisText.text()}`);
        } else {
          curAxisText.text(`${curAxisText.text()}%`);
        }
        //if (i % 2 !== 0 || i === 0) {
        //  curAxisElement.remove();
        //}
      });
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String}
   * Property to store active class id
   */
  classId: Ember.computed('classData', function() {
    const component = this;
    return component.get('classData.id');
  }),

  /**
   * @property {String}
   * Property to store active class's course id
   */
  courseId: Ember.computed('classData', function() {
    const component = this;
    return component.get('classData.courseId');
  }),

  /**
   * @property {String}
   * Property to store active class's course subject
   */
  subjectCode: Ember.computed.alias('classData.preference.subject'),

  /**
   * @property {Boolean}
   * Property to show/hide loading spinner
   */
  isLoading: false,

  /**
   * @property {Boolean}
   * Property to show/hide reset chart
   */
  isZoomInView: false,

  isShowChart: true
});
