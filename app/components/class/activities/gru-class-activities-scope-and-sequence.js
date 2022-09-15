import Ember from 'ember';
import { SCOPE_AND_SEQUENCE_RESOURCE_TYPE } from 'gooru-web/config/config';
import {
  getScopeAndSequenceState,
  setScopeAndSequenceState
} from '../../../utils/utils';

export default Ember.Component.extend({
  classNames: ['gru-class-activities-scope-and-sequence'],

  // -------------------------------------------------------------------------
  // Dependencies

  scopeAndSequenceService: Ember.inject.service('api-sdk/scope-sequence'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} levelAndActionKeys help to define list of action name for each level
   */
  levelAndActionKeys: {
    gradesList: {
      actionKey: 'fetchModulesByScopeId',
      levelKey: 'modulesList'
    },
    modules: {
      actionKey: 'fetchTopicsByModule',
      levelKey: 'topicsList'
    },
    topics: {
      actionKey: 'fetchCompeteciesByTopics',
      levelKey: 'competenciesList'
    }
  },

  /**
   * @property {Object} resourceType help to hold the list of audience
   */
  resourceType: SCOPE_AND_SEQUENCE_RESOURCE_TYPE,

  /**
   * @property {Object} activeContentType it has active content type
   */
  activeContentType: null,

  /**
   * @property {Object} activeScopeAndSequence
   */
  activeScopeAndSequence: null,

  onChangeScopeAndSequence: Ember.observer(
    'activeScopeAndSequence',
    function() {
      this.lastStateContents();
    }
  ),

  /**
   * @property {Array} contentSource is has list of active content source
   */
  contentSource: Ember.computed.alias('activeSequence'),

  lasActiveCompetency: null,

  scopeSeqState: null,

  // -------------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.lastStateContents();
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
    // Action tigger when click on each accordion
    onSelectLevel(levelActionKey, level, params, key, topicList) {
      if (key) {
        topicList.map(topic => {
          if (topic.id !== level.id) {
            topic.set('isActive', false);
          }
        });
      }
      let scopeSeqState = this.get('scopeSeqState') || {};
      scopeSeqState[levelActionKey.levelKey] = level.id;
      this.set('scopeSeqState', scopeSeqState);
      level.set('isActive', !level.get('isActive'));
      if (!level.get(levelActionKey.levelKey)) {
        this.loadLevelData(levelActionKey, level, params);
      }
    },

    // Action trigger on toggle competency accordion
    onToggleCompetency(competency, idsList) {
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

    // Action trigger on clicking load more button
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
      competency.set('isZoomed', !competency.get('isZoomed'));
    }
  },

  // ------------------------------------------------------------------------
  // Methods

  // Method help to load data for each level of accordion
  loadLevelData(levelActionKey, level, params = null) {
    const scopeService = this.get('scopeAndSequenceService');
    const pathParams = params.pathParams;
    const lastState = getScopeAndSequenceState();
    const queryParams = params.queryParams ? params.queryParams : {};
    // Here actionKey is the method name from the {scopeAndSequenceService} service file
    scopeService[levelActionKey.actionKey](pathParams, queryParams).then(
      levelData => {
        level.set(`${levelActionKey.levelKey}`, levelData);

        if (level && level.modulesList && level.modulesList.length) {
          let activeModuleState = lastState
            ? level.modulesList.findBy('id', lastState.competenciesList)
            : null;
          let modulesList = activeModuleState || level.modulesList[0];
          let moduleId = modulesList.get('id');
          let ssId = level.get('id');
          let pathParams = {
            pathParams: {
              ssId,
              moduleId
            }
          };
          let levelAndActionKeys = this.get('levelAndActionKeys').modules;
          this.send(
            'onSelectLevel',
            levelAndActionKeys,
            modulesList,
            pathParams
          );
        }
        if (level && level.topicsList && level.topicsList.length) {
          let activeTopicState = lastState
            ? level.topicsList.findBy('id', lastState.competenciesList)
            : null;
          let topicsList = activeTopicState || level.topicsList[0];
          let topicId = topicsList.get('id');
          let ssId = level.get('id');
          let pathParamsTopics = {
            pathParams: {
              ssId,
              topicId
            }
          };
          let levelAndActionTopics = this.get('levelAndActionKeys').topics;
          this.send(
            'onSelectLevel',
            levelAndActionTopics,
            topicsList,
            pathParamsTopics
          );
        }
        if (level && level.competenciesList && level.competenciesList.length) {
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
      }
    );
  },

  // Method help to load activities content
  loadActivitiesContent(competency, filterKey = null) {
    const resourceType = this.get('resourceType');
    let filterKeys = [filterKey];
    if (filterKey) {
      competency.incrementProperty(`${resourceType[filterKey].name}Page`);
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

  // Method help to reset the properties
  resetProperties(propKey) {
    let modulesList = this.get('activeScopeAndSequence.modulesList') || [];
    let promiseAll = modulesList.map(module => {
      module.topicsList &&
        module.topicsList.forEach(topics => {
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
      let container = $('.gru-class-activities-scope-and-sequence');
      let moduleId = $(`#${ids.moduleId}-${ids.topicId}`).position();
      if (moduleId && moduleId.top) {
        let currentScroll = container.scrollTop();
        container.animate(
          {
            scrollTop: currentScroll + top - 85
          },
          300
        );
      }
    }, 200);
  },

  lastStateContents() {
    let activeSequence = this.get('activeScopeAndSequence');
    if (activeSequence && !activeSequence.get('modulesList')) {
      this.loadLevelData(
        this.get('levelAndActionKeys').gradesList,
        activeSequence,
        {
          pathParams: { ssId: activeSequence.get('scopeId') },
          queryParams: { gradeMasterId: activeSequence.get('id') }
        }
      );
    }
  }
});
