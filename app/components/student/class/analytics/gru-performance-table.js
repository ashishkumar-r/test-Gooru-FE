import Ember from 'ember';
import { alphabeticalStringSort, numberSort } from 'gooru-web/utils/utils';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import { aggregateCollectionPerformanceSummaryItems } from 'gooru-web/utils/performance-summary';

/**
 * Student Performance Table
 *
 * Component responsible for showing the Performance Table in the student page.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-performance-table'],
  /**
   * Query param, filterBy selected
   * @property {String}
   */
  reportIcon: '',

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
       * Sort metric by criteria
       */
    sort: function(metric) {
      this.sortByMetrics(metric);
      var metricsIndex = metric.get('index');
      var sortCriteria = this.get('sortCriteria');
      var newSortCriteria = {
        metricsIndex: metricsIndex
      };

      this.set('sortByMetric', metric.get('value'));

      if (sortCriteria.metricsIndex === metricsIndex) {
        // Reverse the sort order if the same column has been selected
        newSortCriteria.order = sortCriteria.order * -1;
        this.set('sortCriteria', newSortCriteria);
      } else {
        newSortCriteria.order = this.get('defaultSortOrder');
        this.set('sortCriteria', newSortCriteria);
      }
    },
    /**
       * View analytics report
       */
    viewReport: function(assessmentId) {
      this.sendAction('onViewReport', assessmentId);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this._super(...arguments);
    this.set('reportIcon', DEFAULT_IMAGES.REPORTICON);
    Ember.run.scheduleOnce('afterRender', this, function() {
      this.set('sortCriteria', this.initSortCriteria());
      this.resetSortByMetrics();
    });
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @prop { Object } sortCriteria - Object with information on how the data should be sorted
   * - metricsIndex: {number} - Index of metrics option
   * - order: {number} - Ascending or descending order
   */
  sortCriteria: null,

  /**
   * @property {CollectionPerformanceSummary}
   */
  aggregatedPerformanceSummary: Ember.computed(
    'collectionPerformanceSummaryItems.[]',
    function() {
      return aggregateCollectionPerformanceSummaryItems(
        this.get('collectionPerformanceSummaryItems') || Ember.A([])
      );
    }
  ),

  /**
   * Number of assessments completed
   * @property {Number}
   */
  assessmentsCompleted: Ember.computed(
    'assessments.length',
    'collectionPerformanceSummaryItems.length',
    function() {
      const performanceData = this.createDataArray(
        this.get('assessments'),
        this.get('collectionPerformanceSummaryItems')
      );
      return performanceData.filterBy('performanceData.status', 'complete')
        .length;
    }
  ),
  /**
   * The assessment performanceData
   * @property {performanceData[]}
   */
  performanceData: Ember.computed(
    'assessments.length',
    'collectionPerformanceSummaryItems.length',
    'sortCriteria',
    function() {
      const performanceData = this.createDataArray(
        this.get('assessments'),
        this.get('collectionPerformanceSummaryItems')
      );
      const sortCriteria = this.get('sortCriteria');

      if (sortCriteria) {
        let metricsIndex = sortCriteria.metricsIndex;
        let sortedData = performanceData;
        if (metricsIndex >= 0) {
          let sortByMetric = this.get('sortByMetric');
          sortedData.sort(function(a, b) {
            if (a.performanceData && b.performanceData) {
              if (sortByMetric === 'score') {
                return (
                  numberSort(a.performanceData.score, b.performanceData.score) *
                  sortCriteria.order
                );
              } else if (sortByMetric === 'completion') {
                return (
                  numberSort(
                    a.performanceData.completionDone,
                    b.performanceData.completionDone
                  ) * sortCriteria.order
                );
              } else if (sortByMetric === 'study-time') {
                return (
                  numberSort(
                    a.performanceData.timeSpent,
                    b.performanceData.timeSpent
                  ) * sortCriteria.order
                );
              } else {
                return (
                  alphabeticalStringSort(
                    a.assessment.title,
                    b.assessment.title
                  ) * sortCriteria.order
                );
              }
            }
          });
        }
        return sortedData.filterBy('performanceData');
      } else {
        return performanceData.filterBy('performanceData');
      }
    }
  ),

  /**
   * Default list of  metrics to be displayed by the component
   * @sorted {Boolean}
   * @isAsc {Boolean}
   * @visible {Boolean}
   * @constant {Array}
   */
  metrics: Ember.A([
    Ember.Object.create({
      value: 'assessment',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: true,
      index: 4
    }),
    Ember.Object.create({
      value: 'score',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: false,
      index: 0
    }),
    Ember.Object.create({
      value: 'completion',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: false,
      index: 1
    }),
    Ember.Object.create({
      value: 'study-time',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: false,
      index: 2
    })
  ]),

  /**
   * Default sort order for values in columns (1 = ascending; -1 = descending)
   *  * @property {number} defaultSortOrder
   */
  defaultSortOrder: 1,

  /**
   * Indicate if show report column
   */
  showReportColumn: false,

  /**
   * metric sent by the sort function
   */
  sortByMetric: null,

  /**
   * Content title, it could be course, unit or lesson title
   * @property {string}
   */
  contentTitle: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Initialize the table's sort criteria
   * @return {Object}
   */
  initSortCriteria: function() {
    return {
      metricsIndex: -1,
      order: this.get('defaultSortOrder')
    };
  },

  /**
   * Create an array to fill the student performance table.
   * @param assessments the table assessments by sort criteria
   * @param {CollectionPerformanceSummary[]} collectionPerformanceSummaryItems the student performance data for each assessments
   */
  createDataArray: function(assessments, collectionPerformanceSummaryItems) {
    const dataArray = Ember.A([]);

    assessments.forEach(function(assessment) {
      var collectionPerformanceSummaryItem = collectionPerformanceSummaryItems.findBy(
        'id',
        assessment.get('id')
      );
      var itemDataArray = Ember.Object.create({
        performanceData: collectionPerformanceSummaryItem,
        assessment: assessment
      });
      dataArray.push(itemDataArray);
    });

    return dataArray;
  },

  /**
   * Sort by specific metric
   * @metric {Ember Object}
   *
   */
  sortByMetrics(metric) {
    var component = this;
    var metrics = component.get('metrics');
    metrics.forEach(function(option) {
      if (option.get('value') === metric.get('value')) {
        metric.set('sorted', true);
        component.changeTypeSort(metric);
      } else {
        option.set('isAsc', null);
        option.set('sorted', false);
      }
    });
  },

  /**
   * Change the type of sort
   * @metric {Ember Object}
   *
   */
  changeTypeSort(metric) {
    metric.set('isAsc', !metric.get('isAsc'));
  },

  resetSortByMetrics() {
    var component = this;
    var metrics = component.get('metrics');
    metrics.forEach(function(option) {
      option.set('isAsc', null);
      option.set('sorted', false);
    });
  }
});
