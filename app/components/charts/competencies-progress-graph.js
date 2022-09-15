import Ember from 'ember';
import { findPercentage } from 'gooru-web/utils/math';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['charts', 'competencies-progress-graph'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    Ember.run.later(function() {
      const competenciesContext = component.get('competenciesContext');
      const totalCount = component.get('totalCount');
      competenciesContext.map(competencyContext => {
        const competencyGraphContainer = component.$(
          `.${competencyContext.type}-progress`
        );
        competencyGraphContainer.animate(
          {
            height: `${findPercentage(totalCount, competencyContext.count)}%`
          },
          1000,
          function() {
            competencyGraphContainer.addClass('show-count');
          }
        );
      }, 2000);
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} competenciesContext
   * Property for type based competencies context
   */
  competenciesContext: Ember.computed(function() {
    const component = this;
    const masteredCount = component.get('masteredCount');
    const inProgressCount = component.get('inProgressCount');
    const notStartedCount = component.get('notStartedCount');
    let competenciesContext = Ember.A([
      {
        count: masteredCount,
        type: 'mastered'
      },
      {
        count: inProgressCount,
        type: 'inprogress'
      },
      {
        count: notStartedCount,
        type: 'notstarted'
      }
    ]);
    return competenciesContext;
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on progress graph
    onClickProgressChart() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_STUDENT_LJ_PROGRESS_VIEW
      );
      this.sendAction('onClickProgressChart');
    }
  }
});
