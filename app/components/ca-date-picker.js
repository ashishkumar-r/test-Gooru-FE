import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['ca-date-picker-container'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this._super(...arguments);
    this.initialize();
    this.doHighlightActivity();
  },
  didRender() {
    let component = this;
    $(
      '#ca-datepicker .datepicker .datepicker-days .table-condensed tbody tr td'
    ).attr('tabindex', component.get('tabindex'));
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    showPreviousMonth() {
      let component = this;
      let forFirstDateOfMonth = component.get('forFirstDateOfMonth');
      let forMonth = moment(forFirstDateOfMonth)
        .subtract(1, 'months')
        .format('MM');
      let forYear = moment(forFirstDateOfMonth)
        .subtract(1, 'months')
        .format('YYYY');
      if (component.get('updateMonthAndYear')) {
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
      }
      let datepickerPrevEle = component.$(
        '#ca-datepicker .datepicker-days .prev'
      );
      datepickerPrevEle.trigger('click');
      let date = `${forYear}-${forMonth}-01`;
      let parsedDate = moment(date).format('YYYY-MM-DD');
      component.set('forFirstDateOfMonth', parsedDate);
      component.sendAction('showPreviousMonth', parsedDate);
      if (component.get('highlightFirstDayOfMonth')) {
        component.updateFirstDayOfMonth(parsedDate);
      }
    },

    showNextMonth() {
      let component = this;
      let forFirstDateOfMonth = component.get('forFirstDateOfMonth');
      let forMonth = moment(forFirstDateOfMonth)
        .add(1, 'months')
        .format('MM');
      let forYear = moment(forFirstDateOfMonth)
        .add(1, 'months')
        .format('YYYY');
      if (component.get('updateMonthAndYear')) {
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
      }
      let datepickerNextEle = component.$(
        '#ca-datepicker .datepicker-days .next'
      );
      datepickerNextEle.trigger('click');
      let date = `${forYear}-${forMonth}-01`;
      let parsedDate = moment(date).format('YYYY-MM-DD');
      component.set('forFirstDateOfMonth', parsedDate);
      component.sendAction('showNextMonth', parsedDate);
      if (component.get('highlightFirstDayOfMonth')) {
        component.updateFirstDayOfMonth(parsedDate);
      }
    },

    showCalendar() {
      this.toggleDatePicker();
    },

    onSelectMonth(month) {
      this.sendAction('onSelectMonth', month);
      this.set('forFirstDateOfMonth', `${month}-01`);
    },

    onSelectToday() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_CA_TODAY);
      let allowDateSelectorToggle = component.get('allowDateSelectorToggle');
      if (allowDateSelectorToggle) {
        component.toggleDatePicker();
      }
      component.showTodayActivity();
    },

    onToggleDatePicker() {
      this.sendAction('onToggleDatePicker');
      this.toggleProperty('isShowPicker');
    },

    onCloseDatePicker() {
      this.sendAction('closeDatePicker');
      this.set('isShowPicker', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains the value which of month activities displaying
   * @type {Integer}
   */
  forMonth: Ember.computed(function() {
    return moment().format('MM');
  }),

  /**
   * Maintains the value whether validate end date or not
   * @type {Boolean}
   */
  validateEndDate: false,

  isShowPicker: false,

  /**
   * Maintains the value which of year activities displaying
   * @type {Integer}
   */
  forYear: Ember.computed(function() {
    return moment().format('YYYY');
  }),

  /**
   * Maintains  the value of first date of month
   * @return {String}
   */
  forFirstDateOfMonth: Ember.computed('forMonth', 'forYear', function() {
    let forMonth = this.get('forMonth');
    let forYear = this.get('forYear');
    let date = `${forYear}-${forMonth}-01`;
    return moment(date).format('YYYY-MM-DD');
  }),

  /**
   * Start date will allow to pick date only future and today dates
   * @type {String}
   */
  startDate: null,

  /**
   * Maintains the state of datepicker display
   * @type {Boolean}
   */
  isInline: false,

  /**
   * It Maintains the state of month need to display or not.
   * @type {Boolean}
   */
  showMonths: false,

  /**
   * It will  whether calender toggle allowed or not.
   * @type {Boolean}
   */
  allowDateSelectorToggle: false,

  /**
   * Enable previous date visible and disable future date in range date picker
   */
  disableFutureDate: false,

  /**
   * It will decide whether today button need to show or not.
   * @type {Boolean}
   */
  showToday: false,

  /**
   * If show today is true then this attribute will check today is exist for the current month selection.
   * @return {String}
   */
  isTodayExistInCurrentMonth: Ember.computed('forFirstDateOfMonth', function() {
    let component = this;
    let forFirstDateOfMonth = component.get('forFirstDateOfMonth');
    return moment().format('MM') === moment(forFirstDateOfMonth).format('MM');
  }),

  /**
   * It will decide whether  need to highlight activities or not.
   * @type {Boolean}
   */
  highlightActivities: false,

  /**
   * It will decide whether  need to highlight first date of the month or not.
   * @type {Boolean}
   */
  highlightFirstDayOfMonth: false,

  /**
   * It will decide whether need to update forYear and forMonth or not.
   * @type {Boolean}
   */
  updateMonthAndYear: true,

  /**
   * Maintain course active date
   */
  courseStartDate: null,

  /**
   * Change start date datepicker month navigation
   */
  forChangeStartDateNavMonth: false,
  // -------------------------------------------------------------------------
  // Observers
  /**
   * This method  will trigger when  the property change happen in activities or highlightActivities
   */
  doHighlightActivities: Ember.observer(
    'highlightActivities',
    'activities.[]',
    function() {
      this.doHighlightActivity();
    }
  ),

  onSelectStartDate: Ember.observer('startDate', function() {
    let component = this;
    let startDate = this.get('startDate');
    if (!this.get('courseStartDate')) {
      let forFirstDateOfMonth = moment(startDate).format('YYYY-MM-DD');
      component.set('forFirstDateOfMonth', forFirstDateOfMonth);
    }
    if (startDate) {
      component.$('#ca-datepicker').datepicker('setStartDate', startDate);
    }
  }),

  // -------------------------------------------------------------------------
  // Methods
  initialize() {
    const component = this;
    let datepickerEle = component.$('#ca-datepicker');
    let defaultParams = {
      maxViewMode: 0,
      startDate: this.get('courseStartDate'),
      endDate: this.get('disableFutureDate') ? null : 'today',
      format: 'yyyy-mm-dd',
      todayHighlight: true
    };
    let startDate = this.get('startDate');
    let userStartDateAsToday = this.get('userStartDateAsToday');
    if (!startDate && userStartDateAsToday) {
      startDate = moment().format('YYYY-MM-DD');
    }
    if (startDate) {
      defaultParams.startDate = moment(startDate).format('YYYY-MM-DD');
    }
    let pickerStartDate = component.get('pickerStartDate');
    if (pickerStartDate) {
      defaultParams.startDate = moment(pickerStartDate).format('YYYY-MM-DD');
    }
    datepickerEle.datepicker(defaultParams);
    if (this.get('forChangeStartDateNavMonth')) {
      this.set('forFirstDateOfMonth', this.get('courseStartDate'));
      datepickerEle.datepicker('setDate', this.get('courseStartDate'));
    }
    let selectedDate = component.get('selectedDate');
    if (selectedDate) {
      let parsedDate = moment(selectedDate).format('YYYY-MM-DD');
      component.set('forFirstDateOfMonth', parsedDate);
      datepickerEle.datepicker('setDate', parsedDate);
      component.sendAction('onSelectDate', parsedDate, false);
    }
    datepickerEle.off('changeDate').on('changeDate', function() {
      let datepicker = this;
      let selectedDate = Ember.$(datepicker)
        .datepicker('getFormattedDate')
        .valueOf();
      component.doHighlightActivity();
      component.sendAction('onSelectDate', selectedDate, true);
    });
    if (component.get('isActivity')) {
      datepickerEle.keypress(function(e) {
        if (e.keyCode === 13 || e.which === 13) {
          document.activeElement.click();
        }
      });
    } else {
      datepickerEle
        .off('keypress')
        .on('keypress', '.has-activities', function(e) {
          if (e.keyCode === 13 || e.which === 13) {
            document.activeElement.click();
          }
        });
    }
  },

  showTodayActivity() {
    let component = this;
    let isTodayExistInCurrentMonth = component.get(
      'isTodayExistInCurrentMonth'
    );
    let date = moment().format('YYYY-MM-DD');
    if (!isTodayExistInCurrentMonth) {
      let datePickerEle = component.$('#ca-datepicker');
      datePickerEle.datepicker('update', date);
      let forMonth = moment(date).format('MM');
      let forYear = moment(date).format('YYYY');
      if (component.get('updateMonthAndYear')) {
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
      }
      let forFirstDateOfMonth = `${forYear}-${forMonth}-01`;
      component.set('forFirstDateOfMonth', forFirstDateOfMonth);
      component.sendAction('onSelectToday', date, true);
    } else {
      component.sendAction('onSelectToday', date);
    }
  },

  updateFirstDayOfMonth(date) {
    let component = this;
    let datePickerEle = component.$('#ca-datepicker');
    datePickerEle.datepicker('update', date);
  },

  toggleDatePicker() {
    let component = this;
    let element = component.$('.ca-datepicker-container');
    let dateDisplayEle = component.$('.cal-mm-yyyy');
    if (!element.hasClass('active')) {
      element.slideDown(400, function() {
        element.addClass('active');
        dateDisplayEle.addClass('active');
      });
    } else {
      element.slideUp(400, function() {
        element.removeClass('active');
        dateDisplayEle.removeClass('active');
      });
    }
  },

  doHighlightActivity() {
    let component = this;
    Ember.run.later(function() {
      let highlightActivities = component.get('highlightActivities');
      if (highlightActivities) {
        let dateEles = component.$(`#ca-datepicker
        .datepicker .datepicker-days .table-condensed tbody tr td`);
        let activities = component.get('activities');
        dateEles.each(function(index, dateEle) {
          let dateElement = component.$(dateEle);
          if (!(dateElement.hasClass('new') || dateElement.hasClass('old'))) {
            let day = dateElement.html();
            if (day.length === 1) {
              day = `0${day}`;
            }
            let activity = activities.findBy('day', day);
            if (activity) {
              dateElement.removeClass('no-activities');
              dateElement.addClass('has-activities');
              if (component.get('isEnableFutureActivities')) {
                dateElement.removeClass('disabled');
              }
              dateEles.attr('tabindex', component.get('tabindex'));
            } else {
              dateElement.addClass('no-activities');
              dateElement.removeClass('has-activities');
            }
          }
        });
      }
    }, 400);
  }
});
