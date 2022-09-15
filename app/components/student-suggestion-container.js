import Ember from 'ember';
import { PLAYER_EVENT_SOURCE, SUGGESTION_TYPE } from 'gooru-web/config/config';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(tenantSettingsMixin, {
  classNames: ['student-suggestion-container'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {service} suggestService
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  /**
   * @property {CourseMapService}
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @property {service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} offset
   */
  offset: 0,

  /**
   * @property {Number} max
   */
  max: 10,

  /**
   * @property {Number} page
   */
  page: 1,

  /**
   * @property {String}
   */
  selectedTab: Ember.computed('isPublicClass', function() {
    return this.get('isPublicClass') ? 'system' : 'teacher';
  }),

  /**
   * @property {String} classId
   */
  classId: null,

  /**
   * @property {String} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Boolean} isScopeSelected
   */
  isScopeSelected: false,

  /**
   * @property {Boolean} isShowMoveVisible
   */
  isShowMoreVisible: false,

  /**
   * Maintains the list of  menu items
   * @type {Array}
   */
  scopeItems: Ember.computed('classId', function() {
    let scopeItems = Ember.A([]);
    scopeItems.pushObject(this.createScopeItem('all', 'common.all', false));
    scopeItems.pushObject(
      this.createScopeItem('course-map', 'common.course-map', false)
    );
    scopeItems.pushObject(
      this.createScopeItem(
        'class-activity',
        'student-landing.class.class-activities',
        false
      )
    );
    scopeItems.pushObject(
      this.createScopeItem(
        'proficiency',
        'profile.gru-navigation.proficiency',
        false
      )
    );
    return scopeItems;
  }),

  /**
   * It will compute the selected scope item on changes of scope item selection or data change.
   * @type {String}
   */
  selectedScopeItem: Ember.computed('scopeItems.@each.selected', function() {
    let scopeItems = this.get('scopeItems');
    return scopeItems.findBy('selected', true);
  }),

  actions: {
    onSelectTab(item) {
      const component = this;

      if (item === 'system') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_SYSTEM);
      } else {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_TEACHER);
      }

      component.set('selectedTab', item);
      component.loadSuggestionData();
    },

    /**
     * Action triggered when click show more activity
     */
    onClickShowMoreSuggstions() {
      const component = this;
      const offset = component.get('page') * component.get('max');
      component.set('offset', offset);
      component.loadSuggestionData(true);
      component.incrementProperty('page');
    },

    /**
     * Toggle menu list based on the recent selection of the menu.
     */
    toggleScopeList() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_FILTER);
      component.toggleProperty('isScopeSelected');
    },

    /**
     * Choose the menu item
     */
    onChooseScopeItem(selectedItem) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(
          PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_FILTER_SELECTED
        );
      component.set('page', 1);
      component.set('offset', 0);
      component.toggleScopeItem(selectedItem);
    },
    /**
     * Action triggered when the user play collection
     */
    onPlaySuggestionContent(suggestionContent) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_PLAY);
      const suggestionOrigin = suggestionContent.get('suggestionOrigin');
      const suggestionArea = suggestionContent.get('suggestionArea');
      // TODO: CA and Proficiency doesn't support system suggestion

      if (suggestionArea === 'class-activity') {
        const pathType = SUGGESTION_TYPE.CA_TEACHER;
        component.playCAContent(suggestionContent, pathType);
      } else if (suggestionArea === 'proficiency') {
        const pathType = SUGGESTION_TYPE.PROFICIENY_TEACHER;
        component.playProficiencyContent(suggestionContent, pathType);
      } else {
        const pathType = suggestionOrigin;
        if (pathType === 'system' && !suggestionContent.get('accepted')) {
          component.addSuggestedPath(suggestionContent).then(pathId => {
            suggestionContent.pathId = pathId;
            component.playCourseMapContent(suggestionContent, pathType);
          });
        } else {
          component.playCourseMapContent(suggestionContent, pathType);
        }
      }
    },

    studentSuggestionReport(activity) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION_REPORT);
      component.set('isShowPerformanceReport', true);
      component.set('selectedActivityContext', activity);
    },

    onCloseContainer() {
      const component = this;
      component.sendAction('onCloseContainer');
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
      component.loadSuggestionData();
    }
  },

  /**
   * @function toggleScopeItem
   * Method to toggle selected scope item
   */
  toggleScopeItem(selectedItem) {
    const component = this;
    let scopeItems = component.get('scopeItems');
    scopeItems.forEach(item => {
      item.set('selected', false);
      if (selectedItem.get('label') === item.get('label')) {
        item.set('selected', true);
        component.toggleProperty('isScopeSelected');
        component.loadSuggestionData();
      }
    });
  },

  /**
   * @function addSuggestedPath
   * Method to add Suggested Path
   */
  addSuggestedPath(suggestion) {
    const component = this;
    const courseMapService = this.get('courseMapService');
    let mapContext = {};
    mapContext.ctx_user_id = component.get('userId');
    mapContext.ctx_class_id = component.get('classId');
    mapContext.ctx_course_id = suggestion.get('courseId');
    mapContext.lessonId = suggestion.get('lessonId');
    mapContext.ctx_collection_id = suggestion.get('collectionId');
    mapContext.ctx_unit_id = suggestion.get('unitId');
    mapContext.suggested_content_type = suggestion.get('suggestedContentType');
    mapContext.suggested_content_id = suggestion.get('suggestedContentId');
    mapContext.suggested_content_subtype =
      suggestion.get('suggestedContentType') === 'collection'
        ? 'signature-collection'
        : 'signature-assessment';
    mapContext.ctx_path_id = suggestion.get('ctxPathId');
    mapContext.ctx_path_type = suggestion.get('ctxPathType');
    return courseMapService.addSuggestedPath(mapContext);
  },

  playCAContent(suggestionContent, pathType) {
    const component = this;
    const contentId = suggestionContent.get('suggestedContentId');
    const collectionType = suggestionContent.get('suggestedContentType');
    const classId = component.get('classId');
    const caContentId = suggestionContent.get('caId');
    const pathId = suggestionContent.get('id');
    let queryParams = {
      collectionId: contentId,
      classId,
      role: 'student',
      source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      type: collectionType,
      caContentId,
      pathId,
      pathType,
      isIframeMode: true
    };
    component.set(
      'playerUrl',
      component.get('router').generate('player', contentId, {
        queryParams
      })
    );
    let content = suggestionContent;
    content.set('format', collectionType);
    component.set('isOpenPlayer', true);
    component.set('playerContent', content);
  },

  playCourseMapContent(suggestionContent, pathType) {
    const component = this;
    const contentId = suggestionContent.get('suggestedContentId');
    const collectionType = suggestionContent.get('suggestedContentType');
    const classId = component.get('classId');
    const pathId = suggestionContent.get('pathId');
    const courseId = suggestionContent.get('courseId');
    const unitId = suggestionContent.get('unitId');
    const lessonId = suggestionContent.get('lessonId');
    const collectionSource = `${pathType}_suggestions`;
    const ctxPathId = suggestionContent.get('ctxPathId');
    const ctxPathType = suggestionContent.get('ctxPathType');
    let queryParams = {
      collectionId: contentId,
      classId,
      role: 'student',
      source: PLAYER_EVENT_SOURCE.COURSE_MAP,
      type: collectionType,
      pathId,
      unitId,
      lessonId,
      collectionSource,
      pathType,
      isIframeMode: true,
      isNotification: true,
      ctxPathId,
      ctxPathType
    };
    component.set(
      'playerUrl',
      component.get('router').generate('study-player', courseId, {
        queryParams
      })
    );
    let content = suggestionContent;
    content.set('format', collectionType);
    component.set('isOpenPlayer', true);
    component.set('playerContent', content);
  },

  playProficiencyContent(suggestionContent, pathType) {
    const component = this;
    const contentId = suggestionContent.get('suggestedContentId');
    const collectionType = suggestionContent.get('suggestedContentType');
    const classId = component.get('classId');
    const pathId = suggestionContent.get('id');
    let queryParams = {
      collectionId: contentId,
      classId,
      role: 'student',
      source: PLAYER_EVENT_SOURCE.MASTER_COMPETENCY,
      type: collectionType,
      pathId,
      pathType,
      isIframeMode: true
    };
    component.set(
      'playerUrl',
      component.get('router').generate('player', contentId, {
        queryParams
      })
    );
    let content = suggestionContent;
    content.set('format', collectionType);
    component.set('isOpenPlayer', true);
    component.set('playerContent', content);
  },

  init() {
    const component = this;
    component._super(...arguments);
    component.loadSuggestionData();
  },

  didRender() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  didInsertElement() {
    const component = this;
    component.onOpenSuggestionContainer();
  },

  onOpenSuggestionContainer() {
    const component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400
    );
  },

  createScopeItem(key, label, selected) {
    return Ember.Object.create({
      key: key,
      label: label,
      selected: selected
    });
  },

  loadSuggestionData(loadMore = false) {
    const component = this;
    component.set('isLoading', true);
    const userId = component.get('userId');
    const classId = component.get('classId');
    const offset = component.get('offset');
    const max = component.get('max');
    const suggestionOrigin = component.get('selectedTab');
    let scope = component.get('selectedScopeItem.key');
    //Set All scope value as undefined to fetch from all origin
    if (scope === 'all') {
      scope = undefined;
    }
    component
      .get('suggestService')
      .fetchInClassSuggestionsForStudent(userId, classId, {
        scope,
        suggestionOrigin,
        offset,
        max
      })
      .then(result => {
        component.set('isLoading', false);
        const isShowMoreVisible = result.length === component.get('max');
        if (loadMore) {
          let suggestions = component.get('suggestions');
          let mergedResult = suggestions.concat(result);
          component.set('suggestions', mergedResult);
        } else {
          component.set('suggestions', result);
        }
        component.set('isShowMoreVisible', isShowMoreVisible);
      });
  }
});
