import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  classNames: ['proficiency-subject-panel'],

  /**
   * @property {Object} competency
   */
  subject: null,
  /**
   * @property {Array} competencyMatrixCoordinates
   */
  competencyMatrixCoordinates: null,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {Array} domains
   */
  // domains: Ember.computed.alias('competencyMatrixCoordinates.domains'),

  /**
   * @property {String} framework
   */
  framework: null,

  isLoading: true,

  onWatchDomains: Ember.observer('domains.@each.isExpanded', function() {
    let component = this;
    let expandedDiv = component.get('domains').findBy('isExpanded', true);
    if (component.get('domains')) {
      setTimeout(() => component.set('isLoading', false), 100);
    }

    if (expandedDiv) {
      setTimeout(() => {
        let container = $('.domain-list');
        let top = $(`#scroll-domain-${expandedDiv.domainSeq}`).position().top;
        let currentScroll = container.scrollTop();
        container.animate(
          {
            scrollTop: currentScroll + top - 85
          },
          300
        );
      }, 200);
    }
  }),

  actions: {
    onClosePullUp() {
      let component = this;
      component.sendAction('onClosePullUp');
    },

    onDomainSelect(selectedDomain) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_DOMAIN);
      component.sendAction('onDomainSelect', selectedDomain);
    },

    onSelectTopic(topic) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_DOMAIN_COMPTENCY);
      this.sendAction('onSelectTopic', topic);
    },

    onSelectDatamodel(datamodel) {
      const component = this;
      component.set('isShowDomainList', datamodel === 'proficiency');
    }
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  isShowDomainList: true
});
