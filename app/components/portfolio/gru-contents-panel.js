import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['portfolio', 'gru-contents-panel'],

  classNameBindings: [
    'isExpanded:expanded-panel',
    'isLazyLoadEnabled:lazy-load'
  ],

  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  portfolioService: Ember.inject.service('api-sdk/portfolio'),

  i18n: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    let appliedFilters = component.get('appliedFilters');
    const activeSubject = component.get('subject');
    const activeDomain = component.get('domain');
    const activeCompetency = component.get('competency');
    appliedFilters.subjectCode = activeSubject
      ? activeSubject.get('code')
      : undefined;
    appliedFilters.domainCode = activeDomain
      ? activeDomain.get('domainCode')
      : undefined;
    appliedFilters.gutCode = activeCompetency
      ? activeCompetency.competencyCode
      : undefined;
    const contentType = component.get('contentType');
    if (contentType === 'diagnostic') {
      component.loadDiagnostic();
    } else if (contentType === 'domain-diagnostic') {
      component.loadDomainDiagnostic();
    } else {
      component.loadPortfolioActivities(appliedFilters);
    }
    if (component.get('isAllowAutoPagination')) {
      component.scrollHandler();
    }
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when clicking filter icon
    onOpenFilter() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_PORTFOLIO_FILTER);
      component.toggleProperty('isShowContentFilters');
    },

    //Action triggered when apply updated filters
    refreshFilters(appliedFilters) {
      const component = this;
      component.set('offset', 0);
      component.$('.portfolio-contents-container .body-container').scrollTop(0);
      component.loadPortfolioActivities(appliedFilters);
      component.toggleProperty('isShowContentFilters');
    },

    //Action triggered when clear filters
    clearFilters() {
      const component = this;
      component.loadPortfolioActivities();
    },

    //Action triggered while toggling body container
    onToggleContainer() {
      const component = this;
      component.$('.body-container').slideToggle();
      component.set('isExpanded', !this.get('isExpanded'));
    },

    //Action triggered when click performance of an activity
    onShowActivityReport(activity) {
      const component = this;
      component.set('reportActivityId', activity.get('id'));
      component.set('reportActivityType', activity.get('type'));
      if (activity.get('type') === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        component.set('isShowOfflineActivityReport', true);
      } else {
        component.set('isShowPortfolioActivityReport', true);
      }
    },

    //Actio triggered when click show more button
    onShowMoreItems() {
      const component = this;
      component.set('isLazyLoadEnabled', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} userId
   * Active userID should be student
   */
  userId: Ember.computed(function() {
    return this.get('session.userId');
  }),

  /**
   * @property {Boolean} isShowContentFilters
   * Property to show/hide content filters
   */
  isShowContentFilters: false,

  /**
   * @property {Object} filters
   */
  filters: {},

  /**
   * @property {Date} userCreatedAt
   * Property for date of when user has created
   */
  userCreatedAt: Ember.computed('userProfile.createdAt', function() {
    return moment(this.get('userProfile.createdAt')).format('YYYY-MM-DD');
  }),

  totalStudiedActivities: 0,

  /**
   * @property {Object} appliedFilters
   * Property for currently applied filters
   */
  appliedFilters: Ember.computed(function() {
    return Ember.Object.create({});
  }),

  /**
   * @property {Number} offset
   * Property for active offset of content list
   */
  offset: 0,

  /**
   * @property {Number} limit
   * Property for limit to be fetched for content list
   */
  limit: 10,

  /**
   * @property {Array} studiedPortfolioActivities
   * Property for list of studied activities
   */
  studiedPortfolioActivities: Ember.A([]),

  /**
   * @property {Boolean} isFetchedAllContent
   * Property to check whether all contents are fetched or not
   */
  isFetchedAllContent: false,

  /**
   * @property {Boolean} isLoadingMore
   * Prperty to check whether loading more contents or not
   */
  isLoadingMore: false,

  /**
   * @property {String} activeContentLabel
   * Property for active content type label
   */
  activeContentLabel: Ember.computed(function() {
    const component = this;
    const contentType = component.get('contentType');
    const localString =
      contentType === CONTENT_TYPES.OFFLINE_ACTIVITY
        ? 'common.offline-activites'
        : contentType === CONTENT_TYPES.ASSESSMENT
          ? 'common.assessments'
          : contentType === CONTENT_TYPES.COLLECTION
            ? 'common.collections'
            : contentType === 'diagnostic'
              ? 'common.diagnostic-assessments'
              : 'common.domain-diagnostic';
    return component.get('i18n').t(localString);
  }),

  /**
   * @property {Boolean} isExpanded
   * Property to toggle the container between expanded/collapsed state
   */
  isExpanded: true,

  isDiagnostic: false,

  isDomainDiagnostic: false,

  /**
   * @property {Boolean} isLazyLoadEnabled
   * Property to enable lazy load of activity list
   */
  isLazyLoadEnabled: false,

  /**
   * @property {Boolean} isAllowAutoPagination
   * Property to enable auto pagination of activities while scroll down to bottom
   */
  isAllowAutoPagination: true,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadPortfolioActivities
   * @param {Object} filters
   * Method to load student studied items
   */
  loadPortfolioActivities(filters) {
    const component = this;
    filters = JSON.parse(JSON.stringify(filters));
    const contentType = component.get('contentType');
    let studiedPortfolioActivities = component.get(
      'studiedPortfolioActivities'
    );
    component.set('isLoading', true);
    Ember.RSVP.hash({
      portfolioContents: component.fetchPotfolioItems(filters, contentType)
    }).then(({ portfolioContents }) => {
      if (portfolioContents.length) {
        const domainDiagnosticContent = portfolioContents.filterBy(
          'contentSource',
          'domain-diagnostic',
          'updatedAt'
        );
        if (domainDiagnosticContent.length) {
          component.sendAction('onDomainDiagnostic', domainDiagnosticContent);
        }
        const userProfile = component.get('userProfiles');
        userProfile.set('hasContent', true);
        component.sendAction('onPortfolioContents', portfolioContents);
      }
      if (contentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        component.parseStudiedOfflineActivities(
          studiedPortfolioActivities,
          portfolioContents
        );
      }

      if (filters && !component.get('isLoadingMore')) {
        studiedPortfolioActivities = Ember.A([]);
      }

      let isDiagnostic = portfolioContents.filter(
        contentItem =>
          contentItem.contentSource.split(':').splice(-1)[0] === 'diagnostic'
      );
      if (isDiagnostic && isDiagnostic.length) {
        component.sendAction('onDiagnosticList', isDiagnostic);
      }
      let isDomainDiagnostic = portfolioContents.filter(
        contentItem => contentItem.contentSource === 'domain-diagnostic'
      );
      if (isDomainDiagnostic && isDomainDiagnostic.length) {
        component.sendAction('onDomainDiagnosticList', isDomainDiagnostic);
      }

      if (
        contentType === CONTENT_TYPES.COLLECTION ||
        contentType === CONTENT_TYPES.ASSESSMENT ||
        contentType === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
        contentType === CONTENT_TYPES.EXTERNAL_COLLECTION
      ) {
        portfolioContents = portfolioContents.filter(
          contentItem =>
            contentItem.contentSource !== 'domain-diagnostic' &&
            contentItem.contentSource.indexOf('ActivityStream') !== 0 &&
            contentItem.contentSource.split(':').splice(-1)[0] !== 'diagnostic'
        );

        if (component.get('isStudent')) {
          portfolioContents = portfolioContents.filter(
            contentItem => !contentItem.contentSource.includes('diagnostic')
          );
        }

        if (!component.isDestroyed) {
          studiedPortfolioActivities = studiedPortfolioActivities.concat(
            portfolioContents
          );
          component.set(
            'totalStudiedActivities',
            studiedPortfolioActivities.length
          );
          component.set(
            'studiedPortfolioActivities',
            studiedPortfolioActivities
          );
          component.set(
            'isFetchedAllContent',
            portfolioContents.length < component.get('limit')
          );
          component.set('isLoading', false);
          component.set('isLoadingMore', false);
        }
      }
    });
  },

  loadDiagnostic() {
    const component = this;
    let portfolioContents = component.get('diagnosticList');
    let studiedPortfolioActivities = component.get(
      'studiedPortfolioActivities'
    );
    component.set('isLoading', true);
    if (!component.isDestroyed) {
      studiedPortfolioActivities = studiedPortfolioActivities.concat(
        portfolioContents
      );
      component.set(
        'totalStudiedActivities',
        studiedPortfolioActivities.length
      );
      component.set('studiedPortfolioActivities', studiedPortfolioActivities);
      component.set(
        'isFetchedAllContent',
        portfolioContents.length < component.get('limit')
      );
      component.set('isLoading', false);
      component.set('isLoadingMore', false);
    }
  },

  loadDomainDiagnostic() {
    const component = this;
    let portfolioContents = component.get('domainDiagnosticList');
    let studiedPortfolioActivities = component.get(
      'studiedPortfolioActivities'
    );
    component.set('isLoading', true);
    if (!component.isDestroyed) {
      studiedPortfolioActivities = studiedPortfolioActivities.concat(
        portfolioContents
      );
      component.set(
        'totalStudiedActivities',
        studiedPortfolioActivities.length
      );
      component.set('studiedPortfolioActivities', studiedPortfolioActivities);
      component.set(
        'isFetchedAllContent',
        portfolioContents.length < component.get('limit')
      );
      component.set('isLoading', false);
      component.set('isLoadingMore', false);
    }
  },

  /**
   * @function parseStudiedOfflineActivities
   * @param {Array} studiedActivities
   * @param {Object} studiedActivities
   * Method to parse offline activities contents and group them by sub type
   */
  parseStudiedOfflineActivities(
    studiedPortfolioActivities = Ember.A([]),
    studiedActivities
  ) {
    const component = this;
    const offlineActivitySubtypes = Object.keys(studiedActivities);
    let totalStudiedActivities = component.get('totalStudiedActivities');
    let totalFetchedActitivities = 0;
    let parsedOfflineActivities = Ember.A([]);

    offlineActivitySubtypes.map(subType => {
      let offlineActivities = studiedActivities[subType];
      totalFetchedActitivities += offlineActivities.length;
      if (totalFetchedActitivities) {
        const userProfile = component.get('userProfiles');
        userProfile.set('hasContent', true);
        component.sendAction('onPortfolioContents', offlineActivities);
      }
      parsedOfflineActivities.pushObject(
        Ember.Object.create({
          label: `common.subtask.${subType}`,
          offlineActivities
        })
      );
    });
    if (!component.isDestroyed) {
      studiedPortfolioActivities = studiedPortfolioActivities.concat(
        parsedOfflineActivities
      );
      component.set('studiedPortfolioActivities', studiedPortfolioActivities);
      component.set(
        'totalStudiedActivities',
        totalStudiedActivities + totalFetchedActitivities
      );
      component.set(
        'isFetchedAllContent',
        totalFetchedActitivities < component.get('limit')
      );
      component.set('isLoading', false);
      component.set('isLoadingMore', false);
    }
  },

  /**
   * @function fetchPotfolioItems
   * @param {Object} filters
   * @param {String} activityType
   * Method to fetch portfolio items by given content type
   */
  fetchPotfolioItems(filters = {}, activityType) {
    const component = this;
    const portfolioService = component.get('portfolioService');
    const userId = component.get('userId');
    const offset = component.get('offset');
    const limit = component.get('limit');
    const requestParam = {
      userId,
      activityType,
      offset,
      limit
    };
    filters = Object.assign(filters, requestParam);
    let contentBase = component.getContentBaseByFilter(filters);
    let classFramework = component.get('classFrameworkCode');
    let isDefaultShowFW = component.get('isDefaultShowFW');
    return portfolioService.getUserPortfolioUniqueItems(
      filters,
      contentBase,
      classFramework,
      isDefaultShowFW
    );
  },

  /**
   * @function getContentBaseByFilter
   * @param {Object} filters
   * @return {String}
   * Method to get content base which is required for calling appropriate api based on applied filters
   */
  getContentBaseByFilter(filters) {
    let contentBase = 'content';
    if (filters.gutCode && filters.gutCode !== '') {
      contentBase = 'competency';
    } else if (filters.domainCode && filters.domainCode !== '') {
      contentBase = 'domain';
    } else if (filters.subjectCode && filters.subjectCode !== '') {
      contentBase = 'subject';
    }
    return contentBase;
  },

  /**
   * @func scrollHandler
   * Method to handle scrolling event of body container
   */
  scrollHandler() {
    const component = this;
    component
      .$('.portfolio-contents-container .body-container')
      .on('scroll', function() {
        if (
          !component.get('isFetchedAllContent') &&
          !component.get('isLoading')
        ) {
          const innerHeight = component.$(this).innerHeight();
          const scrollTop = component.$(this).scrollTop();
          const scrollHeight = component.$(this)[0].scrollHeight;
          if (scrollTop + innerHeight >= scrollHeight - 100) {
            component.loadMoreContents();
          }
        }
      });
  },

  /**
   * @function loadMoreContents
   * Method to load more contents by given offset and limit values
   */
  loadMoreContents() {
    const component = this;
    component.incrementProperty('offset', component.get('limit'));
    component.set('isLoadingMore', true);
    component.loadPortfolioActivities(component.get('appliedFilters'));
  }
});
