import Ember from 'ember';
import { SCREEN_SIZES } from 'gooru-web/config/config';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Component.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['library-search-header'],

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {Array} filterByList
   * Property to store filter-by list
   */
  filterByList: null,

  /**
   * @property {Object} selectedFilters
   * Property to store selected filters
   */
  selectedFilters: null,

  /**
   * @property {Object} selectedCount
   * Property to store selected filters
   */

  isSelectedBox: false,

  isDeepLinks: Ember.computed(function() {
    return this.get('isDeepLink') === 'true';
  }),

  /**
   * @property {Boolean} isShow
   * Property to toggle filter view
   */
  isShow: false,

  /**
   * @property {Boolean} isMobileView
   * Property to store isMobile view or not
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * @property {Number} selectedFiltersLimit
   * Property to hold limit of selected filters to show
   */
  selectedFiltersLimit: Ember.computed('isMobileView', function() {
    return this.get('isMobileView') ? 7 : 5;
  }),

  /**
   * @property {Observe} onSelectFilter
   */
  onSelectFilter: Ember.observer('selectedFilters.[]', function() {
    let component = this;
    component.parseSelectedFilters();
  }),

  actions: {
    /**
     * Action get triggered when filter button is clicked
     */
    toggleSearchFilter() {
      let component = this;
      component.toggleProperty('isShow');
    },

    selectBox() {
      let component = this;
      component.set('isSelectedBox', !component.get('isSelectedBox'));
      component.sendAction('onSelectBox', component.get('isSelectedBox'));
    },

    onSubmit() {
      this.sendAction('onSubmit');
    },

    searchFilter(param) {
      const component = this;
      component.sendAction('onSearch', component.get('searchTerm'), param);
    },

    /**
     * Action get triggered when clear button is clicked
     */
    clearFilter(item) {
      const component = this;

      /**Removed grade**/
      if (item.filter === 'flt.taxGrade') {
        const removeItem = component
          .get('selectedFilters')
          .filter(
            item =>
              item.filter === 'flt.fwCode' ||
              item.filter === 'flt.domain' ||
              item.filter === 'flt.standard'
          );
        component.get('selectedFilters').removeObjects(removeItem);
      }
      /**Removed subject**/
      if (item.filter === 'flt.subject') {
        const removeItem = component
          .get('selectedFilters')
          .filter(
            item =>
              item.filter === 'flt.subject' ||
              item.filter === 'flt.fwCode' ||
              item.filter === 'flt.taxGrade' ||
              item.filter === 'flt.domain' ||
              item.filter === 'flt.standard'
          );
        component.get('selectedFilters').removeObjects(removeItem);
        component.set('selectedSubject', null);
      }

      /**Removed domain */
      if (item.filter === 'flt.domain') {
        const removeItem = component
          .get('selectedFilters')
          .filter(item => item.filter === 'flt.standard');
        component.get('selectedFilters').removeObjects(removeItem);
      }
      component.set('unCheckedItem', item);
      component.get('selectedFilters').removeObject(item);
      component.send('searchContent', false);
      component.set(
        'moreFilters',
        component
          .get('selectedFilters')
          .slice(
            component.get('selectedFiltersLimit'),
            component.get('selectedFilters').length
          )
      );
    },
    /**
     * Action get triggered when search button is clicked
     */
    searchContent(param) {
      const component = this;
      component.sendAction('onSearch', component.get('searchTerm'), param);

      $('#searchInput').keypress(function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
        }
      });
    },

    /**
     * Action get triggered when user select on content type filter
     */
    onSelectFilterBy(item) {
      const component = this;
      component.setTitle('Library Search', item.type, null, true);
      component.get('selectedResourceTypes').clear();
      component.get('selectedQuestionTypes').clear();
      component.set('activeContentType', item.get('type'));
      component.send('searchContent', false);

      let parseEvent;
      if (item.type === 'course') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_COURSE;
      }
      if (item.type === 'collection') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_COLLECTION;
      }
      if (item.type === 'assessment') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_ASSESSMENT;
      }
      if (item.type === 'offline-activity') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_OFFLINE_ACTIVITY;
      }
      if (item.type === 'resource') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_RESOURCES;
      }
      if (item.type === 'question') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_QUESTION;
      }
      if (item.type === 'rubric') {
        parseEvent = PARSE_EVENTS.CONTENT_BUILDER_RUBRICS;
      }
      this.get('parseEventService').postParseEvent(parseEvent);
    },

    showModal(item) {
      let component = this;
      component.sendAction('onShowModal', item, null, null, 'gru-resource-new');
    },

    selectResourceOption(item) {
      let component = this;
      let selectedResourceTypes = component.get('selectedResourceTypes');
      if (selectedResourceTypes.includes(item)) {
        selectedResourceTypes.removeObject(item);
      } else {
        selectedResourceTypes.pushObject(item);
      }
      component.send('searchContent', false);
    },

    selectQuestionOption(item) {
      let component = this;
      let selectedQuestionTypes = component.get('selectedQuestionTypes');
      if (selectedQuestionTypes.includes(item)) {
        selectedQuestionTypes.removeObject(item);
      } else {
        selectedQuestionTypes.pushObject(item);
      }
      component.send('searchContent', false);
    },

    goBack() {
      const component = this;
      if (component.get('useBackUrl')) {
        window.history.back();
      } else {
        component.get('router').transitionTo('library');
      }
    },
    createDropdown() {
      if ($('.filters-container .actions .btn-group').hasClass('open')) {
        $('.filters-container .actions .btn-group').removeClass('open');
      } else {
        $('.filters-container .actions .btn-group').addClass('open');
      }
    }
  },

  init() {
    const component = this;
    component._super(...arguments);
    component.set('offlineActivityModel', {
      courseId: null,
      unitId: null,
      lessonId: 'new',
      associateLesson: false,
      isIndependentOA: true
    });
    component.loadFilters();
  },

  didRender() {
    const component = this;
    component.initializePopover();
  },

  didInsertElement() {
    const component = this;
    let selectedFilters = component.get('selectedFilters');
    if (selectedFilters) {
      component.parseSelectedFilters();
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Method to parse selected filters to render
   */
  parseSelectedFilters() {
    const component = this;
    let selectedFilters = component.get('selectedFilters');
    let selectedFiltersLimit = component.get('selectedFiltersLimit');
    if (selectedFilters.length < selectedFiltersLimit) {
      component.set('filters', selectedFilters);
    } else {
      component.set('filters', selectedFilters.slice(0, selectedFiltersLimit));
      component.set(
        'moreFilters',
        selectedFilters.slice(selectedFiltersLimit, selectedFilters.length)
      );
    }
  },

  /**
   * Method to initialize popover
   */
  initializePopover() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip();
    component.$('.more-pointer').popover({
      html: true,
      trigger: 'click',
      animation: true,
      placement: 'auto',
      content: () => {
        return component.$('.more-filters').html();
      }
    });
    component.$(document).click(function(event) {
      if (event.target.className !== 'more-pointer') {
        if (component.$('.more-pointer')) {
          component.$('.more-pointer').popover('hide');
        }
      }
    });
  },

  /**
   * Method to load filters
   */
  loadFilters() {
    const component = this;
    component.set('filterByList', component.getFilters());
  },

  /**
   * Method to perpare filter list
   */
  getFilters() {
    const component = this;
    return Ember.A([
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.courses').string,
        type: 'course'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.collections').string,
        type: 'collection'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.assessments').string,
        type: 'assessment'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('common.offline-activites').string,
        type: 'offline-activity'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.resources').string,
        type: 'resource'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.questions').string,
        type: 'question'
      }),
      Ember.Object.create({
        label: component.get('i18n').t('search-filter.rubrics').string,
        type: 'rubric'
      })
    ]);
  }
});
