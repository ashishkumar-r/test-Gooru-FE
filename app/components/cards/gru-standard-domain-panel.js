import Ember from 'ember';
import { getObjectsDeepCopy, getObjectCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // ----------------------------------------------------------
  // Attributes

  classNames: ['gru-standard-domain-panel'],

  /**
   * @property {Object} competency
   */
  subject: null,
  /**
   * @property {Array} competencyMatrixCoordinates
   */
  competencyMatrixCoordinates: null,

  /**
   * @property {Array} domains
   */
  // domains: Ember.computed.alias('competencyMatrixCoordinates.domains'),

  /**
   * @property {String} framework
   */
  framework: null,

  showSearchResult: false,

  filterActiveDomain: null,

  isLoading: true,

  filteredDomain: Ember.computed('domains', function() {
    let component = this;
    if (component.get('domains')) {
      setTimeout(() => component.set('isLoading', false), 100);
    }
    return getObjectsDeepCopy(component.get('domains'));
  }),

  onWatchDomains: Ember.observer('domains.@each.isExpanded', function() {
    let expandedDiv = this.get('domains').findBy('isExpanded', true);
    let filterActiveDomain = this.get('filterActiveDomain');
    if (filterActiveDomain) {
      filterActiveDomain.set('isExpanded', false);
    }
    if (expandedDiv) {
      let filteredDomain = this.get('filteredDomain');
      let activeFilteredDomain = filteredDomain.findBy(
        'domainCode',
        expandedDiv.domainCode
      );
      if (activeFilteredDomain) {
        activeFilteredDomain.set('isExpanded', true);
        this.set('filterActiveDomain', activeFilteredDomain);
      }
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
      let filterActiveDomain = component.get('filterActiveDomain');
      if (
        filterActiveDomain &&
        filterActiveDomain.domainCode !== selectedDomain.domainCode
      ) {
        filterActiveDomain.set('isExpanded', false);
      }
      let domains = component.get('domains');
      selectedDomain.toggleProperty('isExpanded');
      component.set('filterActiveDomain', selectedDomain);
      if (domains.length) {
        const activeDomain = domains.findBy(
          'domainCode',
          selectedDomain.domainCode
        );
        if (activeDomain) {
          component.sendAction('onDomainSelect', activeDomain);
        }
      }
    },

    onSelectTopic(topic) {
      this.sendAction('onSelectTopic', topic);
    },

    onSelectDatamodel(datamodel) {
      const component = this;
      component.set('isShowDomainList', datamodel === 'proficiency');
    },
    expandPullUp() {
      let component = this;
      component.$('.gru-standard-domain-panel-container').addClass('pullUp');
    },

    closeSearch() {
      let component = this;
      component.$('.gru-standard-domain-panel-container').removeClass('pullUp');
    },

    onSearchCompetencies() {
      let searchTerms = event.target.value;
      this.filterDomainData(searchTerms);
    }
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  isShowDomainList: true,

  // ------------------------------------------------------------------
  // Methods

  filterDomainData(terms) {
    const component = this;
    let actualDomainData = getObjectsDeepCopy(component.get('domains'));
    if (terms !== '') {
      let domainData = Ember.A();
      actualDomainData.forEach(domain => {
        let topicList = Ember.A();
        domain.topics.forEach(topic => {
          let competencies = topic.competencies.filter(competency => {
            return competency.competencyName.indexOf(terms) !== -1;
          });
          if (competencies.length) {
            let topicItem = getObjectCopy(topic);
            topicItem.set('competencies', competencies);
            topicList.pushObject(topicItem);
          }
        });
        if (topicList.length) {
          domain.set('topics', topicList);
          domainData.pushObject(domain);
        }
      });
      this.set('filteredDomain', domainData);
      return;
    }
    this.set('filteredDomain', actualDomainData);
  }
});
