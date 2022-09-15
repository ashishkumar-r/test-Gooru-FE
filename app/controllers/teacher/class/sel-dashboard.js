import Ember from 'ember';
import {
  SEL_STUDENT_REPORT_COLOR,
  SEL_STUDENT_ACTIVITY_COLOR
} from 'gooru-web/config/config';
import d3 from 'd3';

export default Ember.Controller.extend({
  // ----------------------------------------------------------------------
  // Dependencies

  // --------------------------------------------------------------------
  // Properties

  /**
   * Inject the  student class parent controller.
   */
  studentClassController: Ember.inject.controller('student.class'),

  reportService: Ember.inject.service('api-sdk/report'),

  isShowDetailView: false,

  isLoading: false,

  isLoadingLessonSummary: false,

  lessonSummaryReport: false,

  isLoadingActivitySummary: false,

  activitySummaryReport: false,

  activityType: 'reflection',

  isLoadingQuizSummary: false,

  quizSummaryReport: false,

  isLoadingFeelingSummary: false,

  feelingSummaryReport: false,

  isLoadingRechargeSummary: false,

  rechargeSummaryReport: [],

  isShowFRQ: false,

  /**
   * @property {Boolean} isDaily
   */
  isDaily: true,

  /**
   * @property {String} forMonth
   */
  forMonth: Ember.computed(function() {
    return moment().format('MM');
  }),

  /**
   * @property {String} forYear
   */
  forYear: Ember.computed(function() {
    return moment().format('YYYY');
  }),

  /**
   * Set custom range start date
   */
  rangeStartDate: null,

  /**
   * Set custom range end date
   */
  rangeEndDate: Ember.computed(function() {
    return moment()
      .endOf('day')
      .format('YYYY-MM-DD');
  }),

  /**
   * @property {String} classStartDate
   */
  classStartDate: Ember.computed('currentClass.startDate', function() {
    if (this.get('currentClass.startDate')) {
      return moment(this.get('currentClass.startDate')).format('YYYY-MM-DD');
    }
    return moment()
      .subtract(1, 'M')
      .format('YYYY-MM-DD');
  }),

  isNext: Ember.computed('rangeEndDate', 'isDateRange', function() {
    let rangeEndDate = this.get('rangeEndDate');
    let today = moment().format('YYYY-MM-DD');
    let isDateRange = this.get('isDateRange');
    return isDateRange || moment(today).isSameOrBefore(rangeEndDate);
  }),

  isPrevious: Ember.computed(
    'rangeStartDate',
    'rangeEndDate',
    'isDateRange',
    function() {
      let rangeStartDate = this.get('rangeStartDate');
      let rangeEndDate = this.get('rangeEndDate');
      let isDateRange = this.get('isDateRange');
      let classStartDate = moment(this.get('classStartDate')).format(
        'YYYY-MM-DD'
      );
      return (
        isDateRange ||
        moment(classStartDate).isSameOrAfter(
          rangeStartDate ? rangeStartDate : rangeEndDate
        )
      );
    }
  ),

  // --------------------------------------------------------------------
  // Actions

  actions: {
    onGoBack() {
      this.transitionToRoute('teacher.class.atc', this.get('currentClass.id'));
    },

    goBack() {
      this.set('isShowFRQ', false);
    },

    onGoBackToDetailView() {
      this.set('isShowDetailView', false);
      this.set('isLoading', true);
      this.loadSelReportChart(this.get('studentSelReport'));
    },

    onClickActivityType(type) {
      const controller = this;
      let selectedActivity = controller.get('selectedActivity');
      if (type) {
        controller.set('activityType', type);
        controller.set('isShowFRQ', true);
      }
      if (controller.get('isShowFRQ')) {
        controller.loadRechargeReport(selectedActivity);
      } else {
        controller.loadDetailReport(selectedActivity, true);
        controller.loadLessonReport(selectedActivity, true);
        controller.loadActivityReport(selectedActivity, true);
      }
    },

    //Action triggered when clicking on datepicker view
    onSelectRangeType(rangeType) {
      const controller = this;
      let startDate =
        !controller.get('isAllTime') && !controller.get('isDateRange')
          ? controller.get('rangeStartDate')
          : null;
      let endDate =
        !controller.get('isAllTime') && !controller.get('isDateRange')
          ? controller.get('rangeEndDate')
          : moment().format('YYYY-MM-DD');
      let classStartDate = controller.get('classStartDate');
      controller.set('isDaily', false);
      controller.set('isMonthly', false);
      controller.set('isWeekly', false);
      if (rangeType === 'isDaily') {
        let selectedDate = startDate ? startDate : endDate;
        controller.set(
          'selectedDate',
          moment(classStartDate).isAfter(selectedDate)
            ? classStartDate
            : selectedDate
        );
      } else if (rangeType === 'isWeekly') {
        let selectedWeekStartDate = startDate
          ? moment(startDate)
            .startOf('Week')
            .format('YYYY-MM-DD')
          : moment(endDate)
            .startOf('Week')
            .format('YYYY-MM-DD');
        let selectedWeekEndDate = startDate
          ? moment(startDate)
            .endOf('Week')
            .format('YYYY-MM-DD')
          : moment(endDate)
            .endOf('Week')
            .format('YYYY-MM-DD');
        let selectedWeekDate = startDate
          ? moment(startDate).format('MM') ===
            moment(selectedWeekStartDate).format('MM')
            ? selectedWeekStartDate
            : selectedWeekEndDate
          : moment(endDate).format('MM') ===
            moment(selectedWeekStartDate).format('MM')
            ? selectedWeekStartDate
            : selectedWeekEndDate;
        controller.set('forMonth', moment(selectedWeekDate).format('MM'));
        controller.set('forYear', moment(selectedWeekDate).format('YYYY'));
        controller.set(
          'selectedWeekDate',
          moment(classStartDate).isAfter(selectedWeekDate)
            ? classStartDate
            : selectedWeekDate
        );
      } else {
        let selectedMonth = startDate
          ? moment(startDate).format('YYYY-MM')
          : moment(endDate).format('YYYY-MM');
        controller.set('selectedYear', moment(selectedMonth).format('YYYY'));
        controller.set('selectedMonth', selectedMonth);
      }
      controller.set(`${rangeType}`, true);
    },

    //Action triggered when toggle report period
    closeDatePicker() {
      $('.back-container .date-range-picker-container').slideUp();
      this.set('isCalendarEnable', false);
    },

    //Datepicker selection of a date
    onSelectDate(date, isDateChange) {
      let controller = this;
      let forMonth = moment(date).format('MM');
      let forYear = moment(date).format('YYYY');
      if (isDateChange) {
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.set('selectedDate', date);
        controller.set('rangeEndDate', date);
        controller.set('rangeStartDate', null);
        controller.set('isAllTime', false);
        controller.set('isDateRange', false);
        controller.send('onClickActivityType');
        controller.send('closeDatePicker');
      }
    },

    onSelectWeek(startDate, endDate, isDateChange) {
      let controller = this;
      let forMonth = moment(endDate).format('MM');
      let forYear = moment(endDate).format('YYYY');
      if (isDateChange) {
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.set('selectedWeekDate', startDate);
        controller.set('rangeStartDate', startDate);
        controller.set('rangeEndDate', endDate);
        controller.set('isAllTime', false);
        controller.set('isDateRange', false);
        controller.send('onClickActivityType');
        controller.send('closeDatePicker');
      }
    },

    onSelectMonth(date, isDateChange) {
      let controller = this;
      let startDate = `${date}-01`;
      let endDate = moment(startDate)
        .endOf('month')
        .format('YYYY-MM-DD');
      let forMonth = moment(startDate).format('MM');
      let forYear = moment(startDate).format('YYYY');
      if (isDateChange) {
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.set('selectedMonth', date);
        controller.set('rangeStartDate', startDate);
        controller.set('rangeEndDate', endDate);
        controller.set('isAllTime', false);
        controller.set('isDateRange', false);
        controller.send('onClickActivityType');
        controller.send('closeDatePicker');
      }
    },

    onSelectToday(date) {
      let controller = this;
      controller.send('onSelectDate', date, true);
    },

    getTillnowData() {
      let controller = this;
      let startDate = moment(controller.get('classStartDate')).format(
        'YYYY-MM-DD'
      );
      let endDate = moment().format('YYYY-MM-DD');
      controller.set('isDaily', false);
      controller.set('isMonthly', false);
      controller.set('isWeekly', false);
      controller.set('isDateRange', false);
      controller.set('isAllTime', true);
      controller.set('rangeStartDate', startDate);
      controller.set('rangeEndDate', endDate);
      controller.send('onClickActivityType');
      controller.send('closeDatePicker');
    },

    /**
     * Show range date picker while click dropdown custom option
     */
    onRangePickerReport() {
      let controller = this;
      let startDate = moment(controller.get('classStartDate')).format(
        'YYYY-MM-DD'
      );
      let endDate = moment().format('YYYY-MM-DD');
      controller.set('startDate', startDate);
      controller.set('endDate', endDate);
      controller.set('isDaily', false);
      controller.set('isMonthly', false);
      controller.set('isWeekly', false);
      controller.set('isAllTime', false);
      controller.set('isDateRange', true);
    },

    showPrevious() {
      const controller = this;
      let toData = controller.get('rangeEndDate');
      if (controller.get('isDaily')) {
        let date = moment(toData)
          .subtract(1, 'days')
          .format('YYYY-MM-DD');
        controller.send('onSelectDate', date, true);
      } else if (controller.get('isWeekly')) {
        let startDate = moment(toData)
          .subtract(1, 'weeks')
          .startOf('Week')
          .format('YYYY-MM-DD');
        let endDate = moment(toData)
          .subtract(1, 'weeks')
          .endOf('Week')
          .format('YYYY-MM-DD');
        controller.send('onSelectWeek', startDate, endDate, true);
      } else {
        let startDate = moment(toData)
          .subtract(1, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        let monthAndyear = `${forYear}-${forMonth}`;
        controller.send('onSelectMonth', monthAndyear, true);
      }
    },

    showNext() {
      const controller = this;
      let toData = controller.get('rangeEndDate');
      if (controller.get('isDaily')) {
        let date = moment(toData)
          .add(1, 'days')
          .format('YYYY-MM-DD');
        controller.send('onSelectDate', date, true);
      } else if (controller.get('isWeekly')) {
        let startDate = moment(toData)
          .add(1, 'weeks')
          .startOf('Week')
          .format('YYYY-MM-DD');
        let endDate = moment(toData)
          .add(1, 'weeks')
          .endOf('Week')
          .format('YYYY-MM-DD');
        controller.send('onSelectWeek', startDate, endDate, true);
      } else {
        let startDate = moment(toData)
          .add(1, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        let monthAndyear = `${forYear}-${forMonth}`;
        controller.send('onSelectMonth', monthAndyear, true);
      }
    },

    /**
     * Close range date picker
     */

    onCloseDatePicker() {
      this.$('.student-rangepicker-container').hide();
      this.set('isCalendarEnable', false);
    },

    /**
     * Select from date and to date while submit
     */

    onChangeDateForStudent(startDate, endDate) {
      let controller = this;
      controller.set('rangeStartDate', moment(startDate).format('YYYY-MM-DD'));
      controller.set('rangeEndDate', moment(endDate).format('YYYY-MM-DD'));
      controller.send('onClickActivityType');
      controller.send('closeDatePicker');
    },

    //Action triggered when toggle report period
    onToggleReportPeriod() {
      this.set('isCalendarEnable', !this.get('isCalendarEnable'));
      $('.back-container .date-range-picker-container').slideToggle();
    }
  },

  loadSelReportChart(studentSelReportData) {
    let controller = this;
    Ember.run.scheduleOnce('afterRender', controller, function() {
      let data = Ember.A([]);
      let totalStudentCount = studentSelReportData.context.total_students;
      let setTick = totalStudentCount <= 5 ? 5 : totalStudentCount;
      studentSelReportData.data.forEach((item, index) => {
        item.index = index;
        item.total = totalStudentCount;
        let itemObj = {
          categorie: item.title,
          values: [
            {
              value: item.started ? item.started : 0,
              rate: 'Not at all',
              selReportData: item
            },
            {
              value: item.completed ? item.completed : 0,
              rate: 'Not very much',
              selReportData: item
            }
          ]
        };
        data.pushObject(itemObj);
      });

      var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 40
        },
        width =
          (data.length === 1 ? 170 : 130) * data.length -
          margin.left -
          margin.right,
        height = 500 - margin.top - margin.bottom;

      var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

      var x1 = d3.scale.ordinal();

      var y = d3.scale.linear().range([height, 0]);

      var xAxis = d3.svg
        .axis()
        .scale(x0)
        .orient('bottom');

      var yAxis = d3.svg
        .axis()
        .scale(y)
        .tickFormat(d3.format('.0f'))
        .ticks(setTick <= 5 ? 5 : null)
        .orient('left');

      var color = d3.scale.ordinal().range(SEL_STUDENT_REPORT_COLOR);

      var svg = d3
        .select('#sel_data_report')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', 520)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      var categoriesNames = data.map(function(d) {
        return d.categorie;
      });
      var rateNames = data[0].values.map(function(d) {
        return d.rate;
      });

      x0.domain(categoriesNames);
      x1.domain(rateNames).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, setTick]);

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .call(controller.wrapText, x0.rangeBand(), false);

      svg
        .append('g')
        .attr('class', 'y axis')
        .style('opacity', '0')
        .call(yAxis);

      svg
        .select('.y')
        .transition()
        .duration(500)
        .delay(1300)
        .style('opacity', '1');

      var slice = svg
        .selectAll('.slice')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'g')
        .attr('transform', function(d) {
          return `translate(${x0(d.categorie)},0)`;
        });

      slice
        .selectAll('rect')
        .data(function(d) {
          return d.values;
        })
        .enter()
        .append('rect')
        .attr('width', x1.rangeBand())
        .attr('x', function(d) {
          return x1(d.rate);
        })
        .style('fill', function(d) {
          return color(d.rate);
        })
        .attr('y', function() {
          return y(0);
        })
        .attr('height', function() {
          return height - y(0);
        })
        .on('click', function(d) {
          controller.set('isShowFRQ', false);
          controller.set('selectedActivity', d.selReportData);
          controller.set('isShowDetailView', true);
          controller.loadDetailReport(d.selReportData, false);
          controller.loadLessonReport(d.selReportData, false);
          controller.loadActivityReport(d.selReportData, false);
          controller.loadRechargeReport(d.selReportData);
        });

      slice
        .selectAll('rect')
        .transition()
        .delay(function() {
          return Math.random() * 1000;
        })
        .duration(1000)
        .attr('y', function(d) {
          return y(d.value) - 1;
        })
        .attr('height', function(d) {
          return height - y(d.value);
        });

      slice
        .selectAll('.bar')
        .data(function(d) {
          return d.values;
        })
        .enter()
        .append('text')
        .data(function(d) {
          return d.values;
        })
        .attr('x', function(d) {
          return x1(d.rate) + 5;
        })
        .attr('y', function(d) {
          return y(d.value) - 1;
        })
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('width', x1.rangeBand())
        .attr('transform', 'translate(20, -20)')
        .text(function(d) {
          return d.value;
        });
    });
    controller.set('isLoading', false);
  },

  loadDetailReport(studentSelReportData, isExist) {
    let controller = this;
    controller.set('isLoading', true);
    Ember.run.later(function() {
      let data = Ember.A([]);
      let totalStudentCount = studentSelReportData.total;
      let setTick = totalStudentCount <= 5 ? 5 : totalStudentCount;
      let itemObj = {
        categorie: `L${studentSelReportData.index + 1}`,
        title: studentSelReportData.title,
        values: [
          {
            value: studentSelReportData.started
              ? studentSelReportData.started
              : 0,
            rate: 'Not at all',
            selReportData: studentSelReportData
          },
          {
            value: studentSelReportData.completed
              ? studentSelReportData.completed
              : 0,
            rate: 'Not very much',
            selReportData: studentSelReportData
          }
        ]
      };
      data.pushObject(itemObj);
      if (isExist) {
        d3.select('#sel_detail_report')
          .selectAll('svg')
          .remove();
      }
      var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 40
        },
        width = 170 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      var x0 = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

      var x1 = d3.scale.ordinal();

      var y = d3.scale.linear().range([height, 0]);

      var xAxis = d3.svg
        .axis()
        .scale(x0)
        .orient('bottom');

      var yAxis = d3.svg
        .axis()
        .scale(y)
        .ticks(setTick <= 5 ? 5 : null)
        .orient('left');

      var color = d3.scale.ordinal().range(SEL_STUDENT_REPORT_COLOR);

      var svg = d3
        .select('#sel_detail_report')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', 520)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      var categoriesNames = data.map(function(d) {
        return d.categorie;
      });
      var rateNames = data[0].values.map(function(d) {
        return d.rate;
      });

      x0.domain(categoriesNames);
      x1.domain(rateNames).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, setTick]);

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      svg
        .append('g')
        .attr('class', 'y axis')
        .style('opacity', '0')
        .call(yAxis);

      svg
        .select('.y')
        .transition()
        .duration(500)
        .delay(1300)
        .style('opacity', '1');

      svg.selectAll('.x.axis .tick')[0].forEach(function(d1) {
        d3.select(d1)
          .on('mouseover', function(d) {
            d3.select('.textlbl')
              .transition()
              .duration(200)
              .style('opacity', 1);
            d3.select('.textlbl')
              .html(function() {
                var label = data.find(element => element.categorie === d);
                return label.title;
              })
              .style('display', 'block')
              .style('top', `${d3.event.pageY - 10}px`)
              .style('left', `${d3.event.pageX + 10}px`);
          })
          .on('mouseout', function() {
            d3.select('.textlbl')
              .style('display', 'none')
              .style('opacity', 0);
          });
      });

      var slice = svg
        .selectAll('.slice')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'g')
        .attr('transform', function(d) {
          return `translate(${x0(d.categorie)},0)`;
        });

      slice
        .selectAll('rect')
        .data(function(d) {
          return d.values;
        })
        .enter()
        .append('rect')
        .attr('width', x1.rangeBand())
        .attr('x', function(d) {
          return x1(d.rate);
        })
        .style('fill', function(d) {
          return color(d.rate);
        })
        .attr('y', function() {
          return y(0);
        })
        .attr('height', function() {
          return height - y(0);
        });

      slice
        .selectAll('rect')
        .transition()
        .delay(function() {
          return Math.random() * 1000;
        })
        .duration(1000)
        .attr('y', function(d) {
          return y(d.value) - 1;
        })
        .attr('height', function(d) {
          return height - y(d.value);
        });

      slice
        .selectAll('.bar')
        .data(function(d) {
          return d.values;
        })
        .enter()
        .append('text')
        .data(function(d) {
          return d.values;
        })
        .attr('x', function(d) {
          return x1(d.rate) + 5;
        })
        .attr('y', function(d) {
          return y(d.value) - 1;
        })
        .attr('dy', '1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('width', x1.rangeBand())
        .attr('transform', 'translate(20, -20)')
        .text(function(d) {
          return d.value;
        });
      controller.set('isLoading', false);
    }, 1000);
  },

  loadLessonReport(selReportData, isExist) {
    let controller = this;
    controller.set('isLoadingLessonSummary', true);
    let currentClass = controller.get('currentClass');
    const startDate = controller.get('rangeStartDate');
    const endDate = controller.get('rangeEndDate');
    const dataParam = {
      from: startDate ? startDate : endDate,
      to: endDate
    };
    Ember.RSVP.hash({
      getLessonSummaryReport: controller
        .get('reportService')
        .fetchLessonSummaryReport(
          currentClass.get('id'),
          selReportData.lesson_id,
          dataParam
        )
    }).then(function(hash) {
      let lessonSummary = hash.getLessonSummaryReport;
      let lessonReport =
        lessonSummary && lessonSummary.data && lessonSummary.data.length;
      controller.set('lessonSummaryReport', lessonReport);
      if (isExist) {
        d3.select('#line_chart')
          .selectAll('svg')
          .remove();
      }
      if (lessonReport) {
        var margin = {
            top: 10,
            right: 100,
            bottom: 120,
            left: 100
          },
          width = 780 - margin.left - margin.right,
          height = 520 - margin.top - margin.bottom;
        var svg = d3
          .select('#line_chart')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        let data = Ember.A([]);
        let totalStudentCount = lessonSummary.context.total_students;
        let setTick = totalStudentCount >= 10 ? totalStudentCount : 10;
        lessonSummary.data.forEach((item, index) => {
          let itemObj = {
            time: index,
            title: item.title,
            valueA: item.completed ? item.completed : 0,
            valueB: item.started ? item.started : 0
          };
          data.pushObject(itemObj);
        });

        // List of groups (here I have one group per column)
        var allGroup = ['valueA', 'valueB'];

        var dataReady = allGroup.map(function(grpName) {
          return {
            name: grpName,
            values: data.map(function(d) {
              return {
                time: d.time,
                title: d.title,
                value: +d[grpName]
              };
            })
          };
        });
        let domainWidth = lessonSummary.data.length;
        var myColor = d3.scale.ordinal().range(SEL_STUDENT_ACTIVITY_COLOR);
        // Add X axis
        var x = d3.scale
          .linear()
          .domain([0, domainWidth])
          .range([0, width]);
        svg
          .append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3.svg
              .axis()
              .scale(x)
              .ticks(lessonSummary.data.length)
              .tickFormat(function(d, i) {
                return lessonSummary.data[i] ? lessonSummary.data[i].title : '';
              })
              .orient('bottom')
          )
          .selectAll('text')
          .attr('transform', 'translate(-10,0) rotate(-45)')
          .style('text-anchor', 'end')
          .call(controller.wrapText, margin.bottom, false);

        // Add Y axis
        var y = d3.scale
          .linear()
          .domain([0, setTick])
          .range([height, 0]);
        svg
          .append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(-40,0)')
          .call(
            d3.svg
              .axis()
              .scale(y)
              .orient('left')
          );

        // Add the lines
        var line = d3.svg
          .line()
          .x(function(d) {
            return x(+d.time);
          })
          .y(function(d) {
            return y(+d.value);
          });
        svg
          .selectAll('myLines')
          .data(dataReady)
          .enter()
          .append('path')
          .attr('d', function(d) {
            return line(d.values);
          })
          .attr('stroke', function(d) {
            return myColor(d.name);
          })
          .style('stroke-width', 2)
          .style('fill', 'none');

        // Add the points
        svg
          .selectAll('myDots')
          .data(dataReady)
          .enter()
          .append('g')
          .attr('class', 'dot-point')
          .style('fill', function(d) {
            return myColor(d.name);
          })
          // Second we need to enter in the 'values' part of this group
          .selectAll('myPoints')
          .data(function(d) {
            return d.values;
          })
          .enter()
          .append('circle')
          .attr('cx', function(d) {
            return x(d.time);
          })
          .attr('cy', function(d) {
            return y(d.value);
          })
          .attr('r', 3)
          .attr('stroke', 'white');

        d3.selectAll('circle').each(function(d) {
          d3.select('.dot-point')
            .append('text')
            .attr('x', x(d.time) - 10)
            .attr('y', y(d.value) - 10)
            .text(d.value);
        });
      }
      controller.set('isLoadingLessonSummary', false);
    });
  },

  loadActivityReport(selReportData, isExist) {
    const controller = this;
    controller.set('isLoadingActivitySummary', true);
    let currentClass = controller.get('currentClass');
    let activityType = controller.get('activityType');
    const startDate = controller.get('rangeStartDate');
    const endDate = controller.get('rangeEndDate');
    const dataParam = {
      from: startDate ? startDate : endDate,
      to: endDate
    };
    Ember.RSVP.hash({
      getActivitySummaryReport: controller
        .get('reportService')
        .fetchActivitySummaryReport(
          currentClass.get('id'),
          selReportData.lesson_id,
          activityType,
          dataParam
        )
    }).then(function(hash) {
      let activitySummary = hash.getActivitySummaryReport;
      let activityReport =
        activitySummary && activitySummary.data && activitySummary.data.length;
      controller.set('activitySummaryReport', activityReport);
      if (isExist) {
        d3.select('#reflection_chart')
          .selectAll('svg')
          .remove();
      }
      if (activityReport) {
        let collectionId = activitySummary.data.map(summary => {
          return summary.collection_id;
        });
        let collectionIds = collectionId.join(',');
        controller.loadReflectionQuizReport(
          selReportData,
          false,
          collectionIds
        );
        controller.loadFeelingReport(selReportData, false, collectionIds);
        let data = Ember.A([]);
        let totalStudentCount = activitySummary.context.total_students;
        let setTick = totalStudentCount >= 10 ? totalStudentCount : 10;
        activitySummary.data.forEach(item => {
          let itemObj = {
            title: item.title,
            started: item.started ? item.started : 0,
            collectionId: item.collection_id
          };
          data.pushObject(itemObj);
        });

        // set the dimensions and margins of the graph
        var margin = {
            top: 20,
            right: 30,
            bottom: 40,
            left: 100
          },
          width = 1000 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

        var svg = d3
          .select('#reflection_chart')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // Add X axis
        var x = d3.scale
          .linear()
          .domain([0, setTick])
          .range([0, width]);
        svg
          .append('g')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3.svg
              .axis()
              .scale(x)
              .orient('bottom')
          )
          .attr('class', 'x axis')
          .selectAll('text')
          .attr('transform', 'translate(-10,0)rotate(-45)')
          .style('text-anchor', 'end');

        var color = d3.scale.ordinal().range(SEL_STUDENT_REPORT_COLOR);

        // Y axis
        var y = d3.scale
          .ordinal()
          .domain(
            data.map(function(d) {
              return d.title;
            })
          )
          .rangeRoundBands([0, 320], 0.1);
        svg
          .append('g')
          .attr('class', 'y axis')
          .call(
            d3.svg
              .axis()
              .scale(y)
              .orient('left')
          );

        //Bars
        svg
          .selectAll('myRect')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'pointer')
          .attr('x', x(0))
          .attr('y', function(d) {
            return y(d.title);
          })
          .attr('width', function(d) {
            return x(d.started);
          })
          .attr('height', y.rangeBand())
          .attr('fill', color())
          .on('click', function(d) {
            controller.loadReflectionQuizReport(
              selReportData,
              true,
              d.collectionId
            );
            controller.loadFeelingReport(selReportData, true, d.collectionId);
          });

        //add a value label to the right of each bar
        svg
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'label')
          //y position of the label is halfway down the bar
          .attr('y', function(d) {
            return y(d.title) + y.rangeBand() / 2 + 4;
          })
          //x position is 3 pixels to the right of the bar
          .attr('x', function(d) {
            return x(d.started) + 3;
          })
          .text(function(d) {
            return d.started;
          });
      }
      controller.set('isLoadingActivitySummary', false);
    });
  },

  loadReflectionQuizReport(selReportData, isExist, collectionIds) {
    const controller = this;
    controller.set('isLoadingQuizSummary', true);
    let currentClass = controller.get('currentClass');
    let activityType = controller.get('activityType');
    const startDate = controller.get('rangeStartDate');
    const endDate = controller.get('rangeEndDate');
    const dataParam = {
      from: startDate ? startDate : endDate,
      to: endDate,
      collectionIds: collectionIds
    };
    Ember.RSVP.hash({
      getQuizSummaryReport: controller
        .get('reportService')
        .fetchQuizSummaryReport(
          currentClass.get('id'),
          selReportData.lesson_id,
          activityType,
          dataParam
        )
    }).then(function(hash) {
      let quizSummary = hash.getQuizSummaryReport;
      let quizReport =
        quizSummary && quizSummary.data && quizSummary.data.length;
      controller.set('quizSummaryReport', quizReport);
      if (isExist) {
        d3.select('#reflection_quiz_chart')
          .selectAll('svg')
          .remove();
      }
      if (quizReport) {
        let data = Ember.A([]);
        let totalStudentCount = quizSummary.context.total_students;
        let setTick = totalStudentCount >= 10 ? totalStudentCount : 10;
        quizSummary.data.forEach(item => {
          let itemObj = {
            title: item.answer_option,
            started: item.student_count ? item.student_count : 0
          };
          data.pushObject(itemObj);
        });

        // set the dimensions and margins of the graph
        var margin = {
            top: 20,
            right: 30,
            bottom: 40,
            left: 400
          },
          width = 1000 - margin.left - margin.right,
          height = 380 - margin.top - margin.bottom;

        var svg = d3
          .select('#reflection_quiz_chart')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // Add X axis
        var x = d3.scale
          .linear()
          .domain([0, setTick])
          .range([0, width]);
        svg
          .append('g')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3.svg
              .axis()
              .scale(x)
              .orient('bottom')
          )
          .attr('class', 'x axis')
          .selectAll('text')
          .style('text-anchor', 'middle');

        var color = d3.scale.ordinal().range(SEL_STUDENT_REPORT_COLOR);

        // Y axis
        var y = d3.scale
          .ordinal()
          .domain(
            data.map(function(d) {
              return d.title;
            })
          )
          .rangeRoundBands([0, 300], 0.1);
        svg
          .append('g')
          .attr('class', 'y axis')
          .call(
            d3.svg
              .axis()
              .scale(y)
              .orient('left')
          )
          .selectAll('.tick text')
          .call(controller.wrapText, margin.left, true);

        //Bars
        svg
          .selectAll('myRect')
          .data(data)
          .enter()
          .append('rect')
          .attr('x', x(0))
          .attr('y', function(d) {
            return y(d.title);
          })
          .attr('width', function(d) {
            return x(d.started);
          })
          .attr('height', y.rangeBand())
          .attr('fill', color());

        //add a value label to the right of each bar
        svg
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'label')
          //y position of the label is halfway down the bar
          .attr('y', function(d) {
            return y(d.title) + y.rangeBand() / 2 + 4;
          })
          //x position is 3 pixels to the right of the bar
          .attr('x', function(d) {
            return x(d.started) + 3;
          })
          .text(function(d) {
            return d.started;
          });
      }
      controller.set('isLoadingQuizSummary', false);
    });
  },

  loadFeelingReport(selReportData, isExist, collectionIds) {
    const controller = this;
    controller.set('isLoadingFeelingSummary', true);
    let currentClass = controller.get('currentClass');
    const startDate = controller.get('rangeStartDate');
    const endDate = controller.get('rangeEndDate');
    const dataParam = {
      from: startDate ? startDate : endDate,
      to: endDate,
      collectionIds: collectionIds
    };
    Ember.RSVP.hash({
      getFeelingSummaryReport: controller
        .get('reportService')
        .fetchFeelingSummaryReport(
          currentClass.get('id'),
          selReportData.lesson_id,
          'feeling',
          dataParam
        )
    }).then(function(hash) {
      let feelingSummary = hash.getFeelingSummaryReport;
      let feelingReport =
        feelingSummary && feelingSummary.data && feelingSummary.data.length;
      controller.set('feelingSummaryReport', feelingReport);
      if (isExist) {
        d3.select('#feelings_chart')
          .selectAll('svg')
          .remove();
      }
      if (feelingReport) {
        let data = Ember.A([]);
        let totalStudentCount = feelingSummary.context.total_students;
        let setTick = totalStudentCount >= 10 ? totalStudentCount : 10;
        feelingSummary.data.forEach(item => {
          let itemObj = {
            title: item.answer_option,
            started: item.student_count ? item.student_count : 0
          };
          data.pushObject(itemObj);
        });

        // set the dimensions and margins of the graph
        var margin = {
            top: 30,
            right: 30,
            bottom: 100,
            left: 60
          },
          width =
            (feelingSummary.data.length >= 8
              ? feelingSummary.data.length * 70
              : 460) -
            margin.left -
            margin.right,
          height = 400 - margin.top - margin.bottom;

        var svg = d3
          .select('#feelings_chart')
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        // X axis
        var x = d3.scale
          .ordinal()
          .domain(
            data.map(function(d) {
              return d.title;
            })
          )
          .rangeRoundBands([0, width], 0.1);

        svg
          .append('g')
          .attr('transform', `translate(0,${height})`)
          .call(
            d3.svg
              .axis()
              .scale(x)
              .orient('bottom')
          )
          .attr('class', 'x axis')
          .selectAll('text')
          .attr('transform', 'translate(-10,0)rotate(-45)')
          .style('text-anchor', 'end')
          .call(controller.wrapText, margin.bottom, false);

        var color = d3.scale.ordinal().range(SEL_STUDENT_REPORT_COLOR);

        // Add Y axis
        var y = d3.scale
          .linear()
          .domain([0, setTick])
          .range([height, 0]);
        svg
          .append('g')
          .call(
            d3.svg
              .axis()
              .scale(y)
              .orient('left')
          )
          .attr('class', 'y axis');

        // Bars
        svg
          .selectAll('mybar')
          .data(data)
          .enter()
          .append('rect')
          .attr('x', function(d) {
            return x(d.title);
          })
          .attr('y', function(d) {
            return y(d.started);
          })
          .attr('width', x.rangeBand())
          .attr('height', function(d) {
            return height - y(d.started);
          })
          .attr('fill', color());
      }
      controller.set('isLoadingFeelingSummary', false);
    });
  },

  loadRechargeReport(selReportData) {
    const controller = this;
    controller.set('isLoadingRechargeSummary', true);
    let currentClass = controller.get('currentClass');
    let activityType = controller.get('activityType');
    const startDate = controller.get('rangeStartDate');
    const endDate = controller.get('rangeEndDate');
    const dataParam = {
      from: startDate ? startDate : endDate,
      to: endDate
    };
    Ember.RSVP.hash({
      getRechargeSummaryReport: controller
        .get('reportService')
        .fetchRechargeSummaryReport(
          currentClass.get('id'),
          selReportData.lesson_id,
          activityType,
          dataParam
        )
    }).then(function(hash) {
      let rechargeSummary = hash.getRechargeSummaryReport;
      if (rechargeSummary.data && rechargeSummary.data.length) {
        rechargeSummary.data.forEach(dataList => {
          if (dataList.responses && dataList.responses.length) {
            dataList.responses.forEach(response => {
              if (response.answer) {
                let answer = JSON.parse(response.answer);
                response.answerText = answer[0].text;
              }
            });
          }
        });
      }
      controller.set('rechargeSummaryReport', rechargeSummary);
      controller.set('isLoadingRechargeSummary', false);
    });
  },

  wrapText(text, width, isExist) {
    text.each(function() {
      var text = d3.select(this),
        words = text
          .text()
          .split(/\s+/)
          .reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy')),
        tspan = text
          .text(null)
          .append('tspan')
          .attr('x', isExist ? -10 : 0)
          .attr('y', y)
          .attr('dy', `${dy}em`);
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', isExist ? -10 : 0)
            .attr('y', y)
            .attr('dy', `${++lineNumber * lineHeight + dy}em`)
            .text(word);
        }
      }
    });
  }
});
