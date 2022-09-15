import Ember from 'ember';
import { SCOPE_AND_SEQUENCE_RESOURCE_TYPE } from 'gooru-web/config/config';
import {
  getScopeAndSequenceState,
  setScopeAndSequenceState
} from '../../../utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['gru-class-activities-default-scope-sequence'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @return {ScopeAndSequenceService} scopeAndSequenceService
   */
  scopeAndSequenceService: Ember.inject.service('api-sdk/scope-sequence'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @type {tenantService} Service to fetch the tenant related information.
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} levelAndActionKeys help to define list of action name for each level
   */
  levelAndActionKeys: {
    domainList: {
      actionKey: 'fetchDomainsByGrade',
      levelKey: 'domainList'
    },
    topicsList: {
      actionKey: 'fetchTopicsByDomain',
      levelKey: 'topicsList'
    },
    competenciesList: {
      actionKey: 'fetchCompetenciesByDomainTopic',
      levelKey: 'competenciesList'
    }
  },

  scopeSeqState: null,

  /**
   * @property {Object} audienceType help to hold the list of audience
   */
  audienceType: SCOPE_AND_SEQUENCE_RESOURCE_TYPE,

  /**
   * @property {Object} activeContentType it has active content type
   */
  activeContentType: null,

  /**
   * @property {Object} primaryClass it has active class details
   */
  primaryClass: null,

  /**
   * @property {Object} domainList it has list domains for the grade
   */
  domainList: Ember.A(),

  /**
   * @property {Object} classPreference class preference settings
   */
  classPreference: Ember.computed('primaryClass', function() {
    let preference = this.get('primaryClass.preference');
    return preference || null;
  }),

  /**
   * @property {String} gradeId class currrent grade
   */
  gradeId: Ember.computed('primaryClass', function() {
    return this.get('primaryClass.gradeCurrent');
  }),

  /**
   * @property {Array} contentSource is has list of active content source
   */
  contentSource: Ember.computed.alias('activeSequence'),

  /**
   * @property {Object} activeScopeAndSequence
   */
  activeScopeAndSequence: null,

  onChangeScopeAndSequence: Ember.observer(
    'activeScopeAndSequence',
    function() {
      this.loadDomainDetails();
    }
  ),

  isBaselineRegularKey: Ember.computed(function() {
    return this.get('isEnableCaBaseline');
  }),

  lasActiveCompetency: null,

  // -------------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.loadDomainDetails();
  },

  didRender() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * @action Action trigger when we click on accordion for each level
     * @param {Object} params it has path params for the actions
     * @param {Object} level has level object
     * @param {Object} levelActionKey it has which action need to trigger for the currrent level
     */
    onSelectLevel(levelActionKey, level, params) {
      params.pathParams = Object.assign(
        {},
        this.defaultPathParams(),
        params.pathParams
      );
      let scopeSeqState = this.get('scopeSeqState') || {};
      scopeSeqState[levelActionKey.levelKey] = level.id;
      this.set('scopeSeqState', scopeSeqState);
      level.set('isActive', !level.get('isActive'));
      if (!level.get(levelActionKey.levelKey)) {
        this.loadLevelData(levelActionKey, level, params);
      }
    },
    /**
     *  @action trigger when click on competency tab
     * @param {Object} competency has selected competency details
     */
    onToggleCompetency(competency, idsList) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CA_SHOW_SCOPE_SEQUENCE_SELECTED
      );
      if (!competency.get('isActive')) {
        this.resetProperties('isActive').then(() => {
          this.scrollIntoView(idsList.ids);
        });
      }
      this.set('scopeSeqState.lastState', competency.id);
      setScopeAndSequenceState(this.get('scopeSeqState'));
      competency.set('isActive', !competency.get('isActive'));
      if (competency.get('isActive') && !competency.get('hasContent')) {
        this.loadActivitiesContent(competency);
        this.set('lasActiveCompetency', competency);
      }
    },
    // Action trigger when click load more teacher or student side
    onLoadMore(competency, filterKey) {
      this.loadActivitiesContent(competency, filterKey);
    },
    // Action tigger on clicking show preview
    onShowContentPreview(content) {
      this.sendAction('onShowContentPreview', content);
    },
    // Action trigger on click add class activities from right panel
    onAddActivityPop(content) {
      this.sendAction('onAddActivityPop', content);
    },

    // Action trigger on clicking add activities from the popup
    onAddActivity(content, startDate, endDate) {
      this.sendAction('onAddActivity', content, startDate, endDate);
    },

    // Action helps to maximize minimize the competency tab
    maximizePageSize(competency) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CA_SHOW_SCOPE_SEQUENCE_EXPAND
      );
      competency.set('isZoomed', !competency.get('isZoomed'));
    }
  },

  // ------------------------------------------------------------------------
  // Methods
  // Method help to handle all the API calls
  loadLevelData(levelActionKey, level, params = null) {
    const scopeService = this.get('scopeAndSequenceService');
    const pathParams = params.pathParams;
    const lastState = getScopeAndSequenceState();
    let isDefaultShowFW = this.get('isDefaultShowFW');
    let classFramework = this.get('classPreference.framework');
    // Here actionKey is the method name from the {scopeAndSequenceService} service file
    scopeService[levelActionKey.actionKey](
      pathParams,
      isDefaultShowFW,
      classFramework
    ).then(levelData => {
      level.set(`${levelActionKey.levelKey}`, levelData);
      if (level && level.topicsList && level.topicsList.length) {
        level.topicsList.forEach(topics => {
          let getTopicStatus = this.get('activityStatus.topics')
            ? this.get('activityStatus.topics').findBy('code', topics.code)
            : null;
          topics.set('getTopicStatus', getTopicStatus);
        });
        let activeTopicState = lastState
          ? level.topicsList.findBy('id', lastState.competenciesList)
          : null;

        let topicsList = activeTopicState || level.topicsList[0];
        let levelAndAction = this.get('levelAndActionKeys');
        let levelActionTriggerKey = levelAndAction.competenciesList;
        let topicId = topicsList.get('id');
        let domainId = level.get('id');
        let pathParamscompetencies = {
          pathParams: {
            topicId,
            domainId
          }
        };
        this.send(
          'onSelectLevel',
          levelActionTriggerKey,
          topicsList,
          pathParamscompetencies
        );
      }

      if (level && level.competenciesList && level.competenciesList.length) {
        level.competenciesList.forEach(competencies => {
          let getCompetencyStatus = this.get('activityStatus.competencies')
            ? this.get('activityStatus.competencies').findBy(
              'displayCode',
              competencies.code
            )
            : null;
          competencies.set('getCompetencyStatus', getCompetencyStatus);
        });
        let activeCompState = lastState
          ? level.competenciesList.findBy('id', lastState.lastState)
          : null;
        let competenciesList = activeCompState || level.competenciesList[0];
        let domainIndex = 0;
        let topicIndex = 0;
        let compIndex = 0;
        let idsList = {
          ids: {
            domainIndex,
            topicIndex,
            compIndex
          }
        };
        this.send('onToggleCompetency', competenciesList, idsList);
      }
    });
  },

  // Method help to load collection based on competency
  loadActivitiesContent(competency, filterKey = null) {
    const audienceType = this.get('audienceType');
    let filterKeys = [filterKey];
    if (filterKey) {
      competency.incrementProperty(`${audienceType[filterKey].name}Page`);
    }
    if (!competency.get('hasContent')) {
      competency.setProperties({
        teacherspage: 0,
        studentspage: 0,
        hasContent: true,
        teachersContent: Ember.Object.create({}),
        studentsContent: Ember.Object.create({}),
        studentsSkipedLevels: [],
        teachersSkipedLevels: []
      });
      filterKeys = ['TEACHERS', 'STUDENTS'];
    }
    this.sendAction('onSelectCompetency', competency, filterKeys);
  },

  // Method help to initialize component based on grade
  loadDomainDetails() {
    let activeSequence = this.get('activeScopeAndSequence');
    let taxonomyService = this.get('taxonomyService');
    const lastState = getScopeAndSequenceState();
    if (activeSequence && !activeSequence.get('domainList')) {
      let classPreference = this.get('classPreference');
      let params = this.defaultPathParams();
      if (
        classPreference &&
        params.fwId &&
        params.subjectId &&
        params.gradeId
      ) {
        taxonomyService
          .fetchDomains(params.fwId, params.subjectId, activeSequence.id)
          .then(domains => {
            activeSequence.set('domainList', domains);
            activeSequence.get('domainList').map(domain => {
              const domainCode = domain.code.split('-').pop();
              let getDomainStatus = this.get('activityStatus.domains')
                ? this.get('activityStatus.domains').findBy('code', domainCode)
                : null;
              domain.set('getDomainStatus', getDomainStatus);
            });
            let activeDomainState = lastState
              ? domains.findBy('id', lastState.topicsList)
              : null;
            let level =
              domains && domains.length ? activeDomainState || domains[0] : '';
            let levelAndAction = this.get('levelAndActionKeys');
            let levelActionKey = levelAndAction.topicsList;
            let domainId = level.get('id');
            let pathParams = {
              pathParams: {
                domainId
              }
            };
            this.send('onSelectLevel', levelActionKey, level, pathParams);
          });
      }
    }
  },

  // Methods has default path params that needs for all the level
  defaultPathParams() {
    return {
      fwId: this.get('classPreference.framework'),
      subjectId: this.get('classPreference.subject'),
      gradeId: this.get('activeScopeAndSequence.id')
    };
  },

  // Method help to reset the properties
  resetProperties(propKey) {
    let domainList = this.get('activeScopeAndSequence.domainList') || [];
    let promiseAll = domainList.map(domain => {
      domain.topicsList &&
        domain.topicsList.forEach(topics => {
          topics.competenciesList &&
            topics.competenciesList
              .filterBy(`${propKey}`, true)
              .forEach(competency => {
                competency.set(`${propKey}`, false);
              });
        });
    });
    return Ember.RSVP.all(promiseAll);
  },

  scrollIntoView(ids) {
    setTimeout(() => {
      let top;
      let container = $('.gru-class-activities-default-scope-sequence');
      let topPosition = $(
        `#dm-${ids.domainIndex}-tp-${ids.topicIndex}-cc-${ids.compIndex}`
      ).position();
      top = topPosition ? topPosition.top : undefined;
      if (top) {
        let currentScroll = container.scrollTop();
        container.animate(
          {
            scrollTop: currentScroll + top - 85
          },
          300
        );
      }
    }, 200);
  }
});
