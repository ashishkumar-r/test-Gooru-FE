import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['ca-month-picker'],

  // -------------------------------------------------------------------------
  // Properties
  /**
   * It maintains number of months to show or not
   * @type {Number}
   */
  numberOfMonthsToShow: 3,

  /**
   * It maintains whether to show calender or not
   * @type {Boolean}
   */
  showCalendarView: false,

  /**
   * Maintains the value of selected year
   * @type {Moment}
   */
  forYear: moment(),

  /**
   * Maintains the value which of year activities displaying
   * @type {Moment}
   */
  selectedYear: Ember.computed(function() {
    return this.get('forYear') || moment().format('YYYY');
  }),

  /**
   * Maintains the selected month by user
   * @type {String}
   */
  selectedMonth: Ember.computed(function() {
    return this.get('forMonth') || moment().format('MM');
  }),

  classStartDate: Ember.computed('class', function() {
    return this.get('class.startDate');
  }),

  /**
   * It maintains list of months to be display for unschedule contents
   * @return {Array}
   */
  months: Ember.computed('currentMonth', function() {
    let component = this;
    let monthsList = Ember.A([]);
    let currentMonth = component.get('currentMonth');
    let monthAndYearOfCurrentDate = moment().format('YYYY-MM');
    let firtDateOfCurrentMonth = moment(`${monthAndYearOfCurrentDate}-01`);
    if (currentMonth) {
      let numberOfMonthsToShow = component.get('numberOfMonthsToShow');
      for (let index = 0; index < numberOfMonthsToShow; index++) {
        let slectedMonth = moment(currentMonth).add(index, 'months');
        let monthName = moment(currentMonth)
          .add(index, 'months')
          .format('MMMM');
        let monthYear = moment(currentMonth)
          .add(index, 'months')
          .format('YYYY');
        let monthNumber = moment(currentMonth)
          .add(index, 'months')
          .format('MM');
        let month = Ember.Object.create({
          monthNumber,
          monthName,
          monthYear
        });
        month.set(
          'isPast',
          !slectedMonth.isSameOrAfter(firtDateOfCurrentMonth)
        );
        monthsList.pushObject(month);
      }
    }
    return monthsList;
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onSelectMonth(month) {
      let component = this;
      component.sendAction('onSelectMonth', month);
    },

    showPreviousYear() {
      const component = this;
      let previousYear = component.get('selectedYear');
      component.set('selectedYear', parseInt(previousYear) - 1);
      const monthPickerEle = component.$('#ca-monthpicker');
      monthPickerEle
        .find('.datepicker .datepicker-months thead tr:first-child th.prev')
        .click();
    },

    showNextYear() {
      const component = this;
      let nextYear = component.get('selectedYear');
      component.set('selectedYear', parseInt(nextYear) + 1);
      const monthPickerEle = component.$('#ca-monthpicker');
      monthPickerEle
        .find('.datepicker .datepicker-months  thead tr:first-child .next')
        .click();
    },

    onCloseDatePicker() {
      this.sendAction('closeDatePicker');
    }
  },

  didInsertElement() {
    let component = this;
    component.initialize();
  },
  didRender() {
    let component = this;
    $(
      '#ca-monthpicker .datepicker .datepicker-months .table-condensed tbody tr td span'
    ).attr('tabindex', component.get('tabindex'));
  },

  // -------------------------------------------------------------------------
  // Methods
  initialize() {
    const component = this;
    let monthPickerEle = component.$('#ca-monthpicker');
    let defaultParams = {
      format: 'mm',
      viewMode: 'months',
      minViewMode: 'months'
    };
    let selectedMonth = component.get('selectedMonth');
    const showCalendarView = component.get('showCalendarView');
    let forYear = component.get('selectedYear');
    if (component.get('disableFutureDate')) {
      defaultParams.endDate = 'today';
    }
    let showAtcView = component.get('showAtcView');
    if (showAtcView) {
      defaultParams.format = 'mm-yyyy';
      defaultParams.startDate = moment(this.get('classStartDate')).format(
        'MM-YYYY'
      );
      defaultParams.endDate = moment().format('MM-YYYY');
      if (forYear && forYear >= moment().format('YYYY')) {
        defaultParams.endDate = moment().format('MM-YYYY');
      }
    }
    let pickerStartDate = component.get('pickerStartDate');
    if (pickerStartDate) {
      defaultParams.startDate = moment(pickerStartDate).format('YYYY-MM-DD');
    }
    monthPickerEle.datepicker(defaultParams);
    if (showCalendarView && selectedMonth && !showAtcView) {
      let forMonth = moment(selectedMonth).format('MM');
      monthPickerEle.datepicker('setDate', forMonth);
      let monthAndyear = `${forYear}-${forMonth}`;
      component.sendAction('onSelectMonth', monthAndyear, false);
    }
    if (showAtcView && selectedMonth) {
      let forMonth = moment(selectedMonth).format('MM');
      let forYear = component.get('forYear');
      monthPickerEle.datepicker('setDate', `${forMonth}-${forYear}`);
    }
    monthPickerEle.off('changeDate').on('changeDate', function() {
      let monthpicker = this;
      let selectedMonth = Ember.$(monthpicker)
        .datepicker('getFormattedDate')
        .valueOf();
      let forYear = component.get('selectedYear');
      if (!moment(forYear).isValid()) {
        forYear = moment(forYear).format('YYYY');
      }
      let monthAndyear = `${forYear}-${selectedMonth}`;
      if (showAtcView) {
        monthAndyear = moment(selectedMonth, 'MM-YYYY').format('YYYY-MM');
      }
      component.sendAction('onSelectMonth', monthAndyear, true);
    });
    monthPickerEle.off('keypress').on('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        document.activeElement.click();
      }
    });
  }
});
