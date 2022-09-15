import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['portfolio', 'gru-content-filters'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.reloadFilters();
    component.set(
      'isReloadFilters',
      !!component.get('activeFiltersList.length')
    );
  },

  // -------------------------------------------------------------------------
  // Events
  actions: {
    //Action triggered when choosing a date range
    onSelectDateRange(startDate, endDate) {
      const component = this;
      let appliedFilters = component.get('appliedFilters');
      appliedFilters.startDate = moment(startDate).format('YYYY-MM-DD');
      appliedFilters.endDate = moment(endDate).format('YYYY-MM-DD');
      component.set('appliedFilters', appliedFilters);
      component.set(
        'daterange',
        Ember.Object.create({
          startDate,
          endDate
        })
      );
      let daterangeFilterObject = Ember.Object.create({
        type: 'daterange',
        value: `${appliedFilters.startDate} - ${appliedFilters.endDate}`,
        displayValue: `${appliedFilters.startDate} - ${appliedFilters.endDate}`
      });
      component.actions.onSelectFilterItem(daterangeFilterObject, component);
    },

    //Action triggered when toggle date range picker
    onShowDateRangeSelector() {
      const component = this;
      component.toggleProperty('isShowDateRangeSelector');
    },

    //Action triggered when close date range picker
    onCloseDatePicker() {
      const component = this;
      component.toggleProperty('isShowDateRangeSelector');
    },

    //Action triggered when apply selected filters to portfolio
    applyFilters() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_PORTFOLIO_APPLY_FILTER);
      let appliedFilters = component.get('appliedFilters');
      appliedFilters = Object.assign(
        appliedFilters,
        component.get('gutFilters')
      );
      component.sendAction('refreshFilters', appliedFilters);
    },

    //Action triggered when selecting a filter item
    onSelectFilterItem(filterObject, component = this) {
      let activeFiltersList = component.get('activeFiltersList');
      let existingFilterObject = activeFiltersList.findBy(
        'type',
        filterObject.get('type')
      );
      let filterObjectIndex = existingFilterObject
        ? activeFiltersList.indexOf(existingFilterObject)
        : -1;
      if (filterObjectIndex >= 0) {
        activeFiltersList.splice(filterObjectIndex, 1, filterObject);
      } else {
        activeFiltersList.pushObject(filterObject);
      }
    },

    //Action triggered when reset/clear filters
    onResetFilters() {
      const component = this;
      component.resetFilters();
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function resetFilters
   * Method to reset filters
   */

  /**
   * @property {Object} appliedFilters
   * Property for active filters
   */
  appliedFilters: Ember.computed(function() {
    return Ember.Object.create({});
  }),

  /**
   * @property {Boolean} isShowDateRangeSelector
   * Property to show/hide date range selector
   */
  isShowDateRangeSelector: false,

  /**
   * @property {Date} startDate
   * Property for date range start date
   */
  startDate: Ember.computed(function() {
    return moment()
      .subtract(1, 'months')
      .format('MM-DD-YYYY');
  }),

  /**
   * @property {Date} endDate
   * Property for date range end date
   */
  endDate: Ember.computed(function() {
    return moment().format('YYYY-MM-DD');
  }),

  activeFiltersList: Ember.A([]),

  isReloadFilters: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function resetFilters
   * Method to reset filters
   */
  resetFilters() {
    const component = this;
    component.set('appliedFilters', {});
    component.set('activeFiltersList', Ember.A([]));
    component.sendAction('refreshFilters', {});
  },

  /**
   * @function reloadFilters
   * Method to reload filters
   */
  reloadFilters() {
    const component = this;
    const appliedFilters = component.get('appliedFilters');
    if (appliedFilters.startDate && appliedFilters.endDate) {
      component.set(
        'daterange',
        Ember.Object.create({
          startDate: appliedFilters.startDate,
          endDate: appliedFilters.endDate
        })
      );
    }
    let gutFilters = {
      subjectCode: appliedFilters.subjectCode,
      domainCode: appliedFilters.domainCode,
      gutCode: appliedFilters.gutCode
    };
    component.set('gutFilters', gutFilters);
  }
});
