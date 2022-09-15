import Ember from 'ember';
import {
  CLASS_ACTIVITIES_ADDING_KEY_WITH_COMPONENT_MAPPING,
  CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS,
  SCOPE_AND_SEQUENCE_RESOURCE_TYPE,
  SMP_STRING,
  MEETING_TOOLS,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['gru-class-activities-adding-layout'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @type {ProfileService} Profile service object
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  /**
   * @type {scopeAndSequenceService}
   */
  scopeAndSequenceService: Ember.inject.service('api-sdk/scope-sequence'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @return videConferenceService
   */
  videConferenceService: Ember.inject.service('api-sdk/video-conference'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  passwordData: '1234567890',

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} todayActivities
   */
  activitiesContent: Ember.A([]),

  /**
   * @property {Array} activitiesContentWithIndex
   */
  activitiesContentWithIndex: Ember.Object.create({}),

  /**
   * @property {Object} activeContentType
   */
  activeContentType: null,

  /**
   * @property {Object} componentKeys holding of component keys
   */
  componentKeys: CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS,

  /**
   * @property {Object} switchComponentList Having list of component name that are used
   */
  switchComponentList: CLASS_ACTIVITIES_ADDING_KEY_WITH_COMPONENT_MAPPING,

  /**
   * @property {String} activeComponentKey Having active component Key
   */
  activeComponentKey: Ember.computed(function() {
    let tenantSetting = this.get('tenantSettingsObj');
    let primaryClass = this.get('primaryClass.preference');
    let isShowDefault = true;
    let concatSubject = null;
    if (primaryClass && primaryClass.framework && primaryClass.subject) {
      concatSubject = primaryClass.framework.concat('.', primaryClass.subject);
    }
    isShowDefault =
      tenantSetting &&
      tenantSetting.default_view_sns_at_fw_level &&
      tenantSetting.default_view_sns_at_fw_level[concatSubject] === false;
    return this.get('isPremiumClass') && !isShowDefault
      ? CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS.scopeAndSequence
      : CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS.defaultView;
  }),

  /**
   * @property {boolean} isPremiumClass
   */
  isPremiumClass: Ember.computed('primaryClass', function() {
    let primaryClass = this.get('primaryClass');
    let settings = primaryClass.get('setting');
    return settings && settings['course.premium'];
  }),

  /**
   * @property {String} activeComponent Help to render dynamic component
   */
  activeComponent: Ember.computed('activeComponentKey', function() {
    return this.get(`switchComponentList.${this.get('activeComponentKey')}`);
  }),

  /**
   * @property {Object} classPreference it has subjectCode and framework code
   */
  classPreference: null,

  /**
   * @property {number} page has loaded page number
   */
  page: 0,

  /**
   * @property {number} pageSize Help to pagination
   */
  pageSize: 10,

  /**
   * @property {Object} primaryClass it has Active class details
   */
  primaryClass: null,
  /**
   * @property {number} activeSequenceIndex help maintain the content source index
   */
  activeSequenceIndex: 0,

  /**
   * @property {boolean} hasCourse help to identify current class has course or not
   */
  hasCourse: Ember.computed('primaryClass', function() {
    return !!this.get('primaryClass.courseId');
  }),

  /**
   * @property {Array} activeSequence has list of selected source content from the filter
   */
  activeSequence: Ember.A(),

  /**
   * @property {Object} additionalFilter it has selected audience and competency details
   */
  additionalFilter: {},

  /**
   * @property {boolean} isFetchingContents
   */
  isFetchingContents: false,

  /**
   * @property {boolean} previewContent
   */
  previewContent: null,

  /**
   * @property {boolean} isShowContentPreview
   */
  isShowContentPreview: false,

  /**
   * @property {boolean} isShowOfflineActivityPreview
   */
  isShowOfflineActivityPreview: false,

  /**
   * @property {Array} secondaryClasses it has list of secondaryClasses
   */
  secondaryClasses: Ember.A(),

  /**
   * @property {Array} todayActivities it has today activities list
   */
  todayActivities: Ember.A(),

  /**
   * @property {Array} scopeAndSequences has list of scope and sequence that are assign to the class
   */
  scopeAndSequences: Ember.A([]),

  /**
   * @property {Object} resourceType has audience list
   */
  resourceType: SCOPE_AND_SEQUENCE_RESOURCE_TYPE,

  /**
   * @property {boolean} isLoading has audience list
   */
  isLoading: false,

  activeScopeAndSequence: null,

  searchTerms: '*',

  isDefaultScopeSequence: false,

  isScopeAndSequenceLoaded: false,

  // Observe todayActivities end at parent
  observeTodayActivities: Ember.observer('todayActivities', function() {
    const component = this;
    const activityList = component.get('todayActivities');
    component.set('activitiesList', activityList);
  }),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didInsertElement: function() {
    const scopeAndSequenceService = this.get('scopeAndSequenceService');
    if (this.get('primaryClass') && this.get('primaryClass.preference')) {
      scopeAndSequenceService
        .activityStatus(this.get('primaryClass.id'))
        .then(response => {
          this.set('activityStatus', response);
        });
    }
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    // Action trigger when click content types from the default view
    onChangeContentType(activeContent) {
      this.resetProperties();
      this.set('activeContentType', activeContent);
      if (
        this.get('activeComponentKey') === this.get('componentKeys').defaultView
      ) {
        this.initialLoader();
      }
      this.refreshData();
    },

    // Action trigger when switching components
    onChangeComponent(componentKey) {
      if (componentKey === 'defaultScopeAndSequence') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_SHOW_SCOPE_SEQUENCE
        );
      } else {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_SHOW_ALL
        );
      }
      this.set('activeComponentKey', componentKey);
      if (
        this.get('activeComponentKey') === this.get('componentKeys').defaultView
      ) {
        this.defaultSearchLoader();
      } else {
        if (!this.get('isScopeAndSequenceLoaded')) {
          this.set('isScopeAndSequenceLoaded', true);
          this.scopeAndSequenceContent();
        }
      }
    },

    /**
     * @function applyFilter Action tigger when click on applyFilter from search header
     * @param additionalFilter it has taxonomies and audience filter details
     * @param activeContentType it has active content type
     * @param contentResource has list of content sources
     */
    applyFilter(
      contentResource,
      additionalFilter,
      activeContent,
      isCustomeFilter = false,
      enableCaBaseline
    ) {
      this.resetProperties();
      this.setProperties({
        additionalFilter: additionalFilter,
        activeSequence: contentResource,
        activeContentType: activeContent
      });
      this.set('enableCaBaseline', enableCaBaseline);
      if (
        (additionalFilter.standard && additionalFilter.standard.length) ||
        enableCaBaseline
      ) {
        if (
          this.get('activeComponentKey') !==
          this.get('componentKeys').defaultView
        ) {
          this.set('activeComponentKey', this.get('componentKeys').defaultView);
        }
      }
      if (isCustomeFilter) {
        this.defaultViewContent(this.get('activeContentType.apiKey'));
        this.refreshData();
      } else {
        this.initialLoader();
      }
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CA_APPLY_FILTER
      );
    },

    // Action trigger when we click other scope and sequence from the dropdown
    onSelectScope(scope) {
      this.set('activeScopeAndSequence', scope);
      scope.set('isActive', true);
      this.send('onToggleDropdown', 'scope-sequence-blk');
    },

    // Action trigger when we toggle any accordion
    onToggleDropdown(container) {
      this.$(`.${container}`).slideToggle();
    },

    // Action trigger when search anything from search box
    onSearch(searchTerms) {
      searchTerms = searchTerms === '' ? '*' : searchTerms;
      this.set('searchTerms', searchTerms);
      if (
        this.get('activeComponentKey') !== this.get('componentKeys').defaultView
      ) {
        this.set('activeComponentKey', this.get('componentKeys').defaultView);
      }
      this.resetProperties();
      this.defaultViewContent(this.get('activeContentType.apiKey'));
      this.refreshData();
    },

    // Action trigger when selected the competency
    onSelectCompetency(competency, filterKeys) {
      this.onLoadScopeAndSequence(competency, filterKeys);
    },

    // Action tigger when click preview
    onShowContentPreview(previewContent) {
      const component = this;
      component.set('previewContent', previewContent);
      if (previewContent.get('format') === 'offline-activity') {
        component.set('isShowOfflineActivityPreview', true);
      } else {
        component.set('isShowContentPreview', true);
      }
    },

    // Action trigger when click on add class activities button
    onAddActivityPop(content) {
      this.set('isAddActivity', true);
      this.set('activeActivityContent', content);
    },

    // Action tigger when click add activity from the popup
    onAddActivity(
      content,
      scheduleDate = null,
      endDate = null,
      month,
      year,
      isScheduleByMonth = false
    ) {
      const component = this;
      scheduleDate = isScheduleByMonth
        ? null
        : scheduleDate || moment().format('YYYY-MM-DD');
      component.assignActivityToMultipleClass(
        content,
        scheduleDate,
        endDate,
        month,
        year
      );
    },
    // Action trigger when scroll the container
    onDefaultShowMore(levelInfo) {
      if (levelInfo) {
        levelInfo.page = levelInfo.page + 1;
        this.set('activeSequenceIndex', levelInfo.sequenceIndex);
      }
      if (this.get('activeContentType')) {
        this.defaultViewContent(
          this.get('activeContentType.apiKey'),
          levelInfo
        );
      }
    },
    onRefreshData(meetingInfo) {
      this.sendAction('onRefreshData', meetingInfo);
    }
  },

  // ------------------------------------------------------------------------
  // Methods

  // Method help to load global search content
  defaultViewContent(activeContentKey, levelInfo = null) {
    const component = this;
    let searchService = component.get('searchService');
    let activitiesContentWithIndex = component.get(
      'activitiesContentWithIndex'
    );
    let queryParams = component.contentRequestBody();
    if (levelInfo) {
      queryParams.page = levelInfo.page;
    }
    queryParams.audienceFilter = true;
    if (queryParams && queryParams.filters) {
      if (queryParams.filters.scopeKey === 'open-all') {
        queryParams.filters['flt.audience'] = 'Teachers, All Students';
      }
      queryParams.isDefaultShowFW = component.get('isDefaultShowFW');
      queryParams.classFramework = component.get('classFramework');
      let searchCall =
        queryParams.filters.scopeKey === 'open-all'
          ? searchService.searchCollectionsOpenAllKey(
            activeContentKey,
            queryParams,
            component.get('searchTerms')
          )
          : searchService[activeContentKey](
            component.get('searchTerms'),
            queryParams
          );
      searchCall.then(contentData => {
        if (!component.isDestroying) {
          let activeSequenceIndex = component.get('activeSequenceIndex');
          if (!activitiesContentWithIndex.get(`${activeSequenceIndex}`)) {
            activitiesContentWithIndex.set(
              `${activeSequenceIndex}`,
              Ember.Object.create({
                contentList: Ember.A(),
                sequenceIndex: activeSequenceIndex
              })
            );
          }
          activitiesContentWithIndex.set(
            `${activeSequenceIndex}.page`,
            queryParams.page
          );
          if (
            activeSequenceIndex < component.get('activeSequence').length - 1 &&
            !levelInfo
          ) {
            component.incrementProperty('activeSequenceIndex');
            component.set('isLoading', true);
            component.defaultViewContent(
              component.get('activeContentType.apiKey')
            );
          }
          let activitiesContent = activitiesContentWithIndex.get(
            `${activeSequenceIndex}.contentList`
          );
          activitiesContentWithIndex.set(
            `${activeSequenceIndex}.contentList`,
            activitiesContent.concat(contentData)
          );
          component.set('isFetchingContents', false);
          component.set('isLoading', false);
        }
      });
    }
  },

  // Method help to load scope and sequence content
  scopeAndSequenceActivitiesContent(competency, filterKey, activeIndex = 0) {
    const params = this.contentRequestBody(competency, filterKey, activeIndex);
    params.isDefaultShowFW = this.get('isDefaultShowFW');
    params.classFramework = this.get('classFramework');
    let actionKey = this.get('activeContentType.apiKey');
    const searchService = this.get('searchService');
    const activityContentKey = `${
      this.get('resourceType')[filterKey].name
    }Content`;
    let searchCall =
      params.filters.scopeKey === 'open-all'
        ? searchService.searchCollectionsOpenAllKey(
          actionKey,
          params,
          this.get('searchTerms')
        )
        : searchService[actionKey](this.get('searchTerms'), params);

    searchCall.then(contentData => {
      if (contentData) {
        if (contentData.length < this.get('pageSize')) {
          let levelName = `${
            this.get('resourceType')[filterKey].name
          }SkipedLevels`;
          let skipedLevel = competency.get(levelName);
          skipedLevel.push(activeIndex);
          competency.set(levelName, skipedLevel);
        }
        const contentList = competency.get(`${activityContentKey}`);
        if (!contentList[activeIndex]) {
          contentList[activeIndex] = Ember.A();
        }
        contentList.set(
          `${activeIndex}`,
          contentList[activeIndex].concat(contentData)
        );
      }
    });
  },
  /**
   * @function contentRequestBody Help to parse params that are help to API call
   */
  contentRequestBody(competency = null, filterKey = null, activeIndex = 0) {
    let params = {
      taxonomies: null,
      page: this.get('page'),
      pageSize: this.get('pageSize'),
      excludeNonCrosswalkableContents: true
    };
    const classPreference = this.get('primaryClass.preference');
    if (this.get('enableCaBaseline')) {
      params.isShowDiagnosticAssessent = true;
    }
    if (classPreference) {
      params.fwCode = classPreference.get('framework');
    }
    const activeSequence = this.get('activeSequence');
    const activeSequenceIndex = competency
      ? activeIndex
      : this.get('activeSequenceIndex');
    params.taxonomies = this.get('additionalFilter').standard;
    if (
      activeSequence &&
      activeSequence.length &&
      this.get('additionalFilter')
    ) {
      params = Object.assign(params, {
        filters: Object.assign(
          activeSequence[activeSequenceIndex].get('filters'),
          this.get('additionalFilter').filters
        )
      });
    }
    if (filterKey && competency) {
      params.page = competency.get(
        `${this.get('resourceType')[filterKey].name}Page`
      );
      let standardCode = this.get('isDefaultScopeSequence')
        ? competency.get('id')
        : competency.get('code');
      params.taxonomies = params.taxonomies.concat([standardCode]);
      params.filters = Object.assign({}, params.filters, {
        'flt.audience': this.get('resourceType')[filterKey]['flt.audience']
      });
      params.filters.isCrosswalk = true;
    } else {
      let isAssessment =
        this.get('activeContentType.format') === CONTENT_TYPES.ASSESSMENT;
      if (params.filters && classPreference) {
        params.filters['flt.subject'] =
          this.get('enableCaBaseline') && isAssessment
            ? classPreference
              .get('framework')
              .concat('.', classPreference.get('subject'))
            : classPreference.get('subject');
      }
    }
    return params;
  },

  // Method help to reset the Properties
  resetProperties() {
    this.set('activeSequenceIndex', 0);
    this.set('activitiesContentWithIndex', Ember.Object.create({}));
    this.set('page', 0);
  },
  // Method help to assign the class activity content to all the class
  assignActivityToMultipleClass(
    content,
    scheduleDate,
    endDate,
    month = undefined,
    year = undefined
  ) {
    const component = this;
    content.set('isScheduledActivity', !!scheduleDate);
    content.set('isUnscheduledActivity', month && year);
    const secondaryClasses = component.get('secondaryClasses');
    const classesToBeAdded = Ember.A([component.get('primaryClass')]).concat(
      secondaryClasses
    );
    let promiseList = classesToBeAdded.map(classes => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        component
          .addActivityToClass(
            classes.get('id'),
            content,
            scheduleDate,
            month,
            year,
            endDate
          )
          .then(function(activityId) {
            const activityClasses =
              content.get('activityClasses') || Ember.A([]);
            let activityClass = Ember.Object.create({
              id: classes.get('id'),
              activity: Ember.Object.create({
                id: activityId,
                date: scheduleDate,
                month,
                year
              })
            });
            activityClasses.pushObject(activityClass);
            content.set('activityClasses', activityClasses);
            if (content.get('hasVideoConference')) {
              return component.fetchActivityUsers(
                activityClass,
                content,
                classes,
                resolve
              );
            } else {
              resolve();
            }
          }, reject);
      });
    });
    Ember.RSVP.all(promiseList).then(() => {
      if (moment().isSame(scheduleDate, 'day')) {
        content.set('isAdded', true);
      } else {
        content.set('isScheduled', true);
      }
      component.sendAction('activityAdded', content);
    });
  },

  // Methods help to schedule class activities
  addActivityToClass(classId, content, scheduleDate, month, year, endDate) {
    const component = this;
    const contentId = content.get('id');
    const contentType = content.get('format');
    return component
      .get('classActivityService')
      .addActivityToClass(
        classId,
        contentId,
        contentType,
        scheduleDate,
        month,
        year,
        endDate
      );
  },

  /**
   * @function getClassInfo
   * @param {UUID} classId
   * @return Promise classdata
   */
  getClassInfo(classId) {
    const component = this;
    return component.get('classService').readClassInfo(classId);
  },

  // Method help to fetch user list for the activity
  fetchActivityUsers(activities, content, classes, resolve) {
    let component = this;
    return Ember.RSVP.hash({
      activityMembers: component
        .get('classActivityService')
        .fetchUsersForClassActivity(
          classes.get('id'),
          activities.get('activity.id')
        )
    }).then(({ activityMembers }) => {
      let emailIDs = activityMembers.filterBy('email').mapBy('email') || [];
      if (emailIDs.length) {
        return component
          .createConferenceEvent(classes, content, emailIDs)
          .then(eventDetails => {
            if (eventDetails.meetingUrl) {
              let updateParams = {
                classId: classes.get('id'),
                contentId: activities.get('activity.id'),
                data: {
                  meeting_id: eventDetails.meetingId,
                  meeting_url: content.meetingUrl
                    ? content.meetingUrl
                    : eventDetails.meetingUrl,
                  meeting_endtime: content.meetingEndTime,
                  meeting_starttime: content.meetingStartTime,
                  meeting_timezone: moment.tz.guess()
                }
              };
              let activity = activities.get('activity');
              activities.set(
                'activity',
                Object.assign(activity, updateParams.data)
              );
              component
                .get('videConferenceService')
                .updateConferenceEvent(updateParams)
                .then(() => {
                  resolve();
                });
            } else {
              return resolve();
            }
          });
      } else {
        return resolve();
      }
    });
  },

  // Method help to initialize scope and sequenece listing
  scopeAndSequenceContent() {
    let classPreference = this.get('classPreference');
    if (classPreference) {
      let params = {
        subjectCode: classPreference.get('subject'),
        fwCode: classPreference.get('framework'),
        grade: this.get('primaryClass.currentGrade')
      };
      const scopeAndSequenceService = this.get('scopeAndSequenceService');
      Ember.RSVP.hash({
        gradeList: this.get('taxonomyService').fetchGradesBySubject({
          subject: params.subjectCode,
          fw_code: params.fwCode
        }),
        defaultScope: this.get('taxonomyService').fetchCourses(
          params.fwCode,
          `${params.fwCode}.${params.subjectCode}`
        ),
        scopeAndSequenceList: scopeAndSequenceService.fetchScopeAndSequence(
          params
        )
      }).then(({ gradeList, defaultScope, scopeAndSequenceList }) => {
        let parsedList = this.parseScopeAndSequenceList(
          gradeList,
          scopeAndSequenceList
        );
        if (!scopeAndSequenceList.length) {
          this.set('isDefaultScopeSequence', true);
          parsedList = defaultScope;
          parsedList = parsedList.filter(item => item.title !== SMP_STRING);
          this.set(
            'activeComponentKey',
            CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS.defaultScopeAndSequence
          );
        }
        let currentGrade = parsedList.findBy(
          'id',
          this.get('primaryClass.gradeCurrent')
        );
        if (currentGrade) {
          this.set('activeScopeAndSequence', currentGrade);
        }
        let activeGradeObject = gradeList.findBy(
          'id',
          this.get('primaryClass.gradeCurrent')
        );
        let defaultActiveScope = parsedList.find(
          (grade, index) =>
            grade[grade.title ? 'title' : 'grade'] ===
              (activeGradeObject && activeGradeObject.grade) ||
            index + 1 === (activeGradeObject && activeGradeObject.sequence)
        );
        if (defaultActiveScope) {
          this.set('activeScopeAndSequence', defaultActiveScope);
        }
        if (!currentGrade && !defaultActiveScope) {
          this.set('activeScopeAndSequence', parsedList.get(0));
        }
        this.set('scopeAndSequences', parsedList);
        this.set('isLoading', false);
      });
    }
  },

  // Method help to parse the list of scope and sequence list by grade
  parseScopeAndSequenceList(gradeList = [], scopeAndSequenceList = []) {
    let parsedList = Ember.A();
    scopeAndSequenceList.forEach(item => {
      if (item.get('gradesCovered').length) {
        let gradesCovered = item.get('gradesCovered');
        gradesCovered.forEach(gradeId => {
          let grade = gradeList.findBy('id', gradeId);
          if (grade) {
            grade.setProperties({
              scopeName: item.get('name'),
              scopeId: item.get('id')
            });
            parsedList.pushObject(grade);
          }
        });
      }
    });
    return parsedList;
  },

  // Method help to load content based on component
  initialLoader() {
    this.screenChangeDetection();
    this.set('isLoading', true);
    const activeComponentKey = this.get('activeComponentKey');
    const componentKeys = this.get('componentKeys');
    const activeContentType = this.get('activeContentType');
    if (componentKeys.defaultView === activeComponentKey) {
      this.defaultViewContent(activeContentType.get('apiKey'));
    } else if (
      componentKeys.scopeAndSequence === activeComponentKey ||
      componentKeys.defaultScopeAndSequence === activeComponentKey
    ) {
      this.scopeAndSequenceContent();
    } else {
      this.set('isLoading', false);
    }
  },

  // Method help to handled on mobile view click event
  screenChangeDetection() {
    let component = this;
    if (component.$(window).width() <= '768') {
      component.$('.layout-title').off('click');
      component.$('.layout-title').on('click', function() {
        component.$().toggleClass('show-content');
      });
    }
  },

  refreshData() {
    let contentKey = this.get('isDefaultScopeSequence')
      ? 'domainList'
      : 'modulesList';
    let scopeAndSequences = this.get('scopeAndSequences');
    scopeAndSequences.forEach(activeSequence => {
      if (activeSequence && activeSequence.get(`${contentKey}`)) {
        let modulesList = activeSequence.get(`${contentKey}`);
        modulesList &&
          modulesList.map(module => {
            module.topicsList &&
              module.topicsList.forEach(topics => {
                topics.competenciesList &&
                  topics.competenciesList
                    .filter(item => item.isActive || item.hasContent)
                    .forEach(competency => {
                      competency.set('hasContent', false);
                      competency.setProperties({
                        teacherspage: 0,
                        studentspage: 0,
                        hasContent: true,
                        teachersContent: Ember.Object.create({}),
                        studentsContent: Ember.Object.create({}),
                        studentsSkipedLevels: [],
                        teachersSkipedLevels: []
                      });
                      let filterKeys = ['TEACHERS', 'STUDENTS'];
                      this.send('onSelectCompetency', competency, filterKeys);
                    });
              });
          });
      }
    });
  },

  defaultSearchLoader() {
    let activityList = this.get('activitiesContentWithIndex');
    if (!activityList || !Object.keys(activityList).length) {
      this.send('onDefaultShowMore', null);
    }
  },

  onLoadScopeAndSequence(competency, filterKeys) {
    let activeSequence = this.get('activeSequence');
    filterKeys.forEach(filterKey => {
      let skipedLevel = competency.get(
        `${this.get('resourceType')[filterKey].name}SkipedLevels`
      );
      activeSequence.forEach((seq, i) => {
        if (
          seq.key === 'course-map' &&
          filterKey === 'TEACHERS' &&
          skipedLevel.indexOf(i) === -1
        ) {
          skipedLevel.push(i);
        }
        if (skipedLevel.indexOf(i) === -1) {
          this.scopeAndSequenceActivitiesContent(competency, filterKey, i);
        }
      });
    });
  },

  createConferenceEvent(classes, content, emailIDs) {
    const component = this;
    if (component.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      let params = {
        topic: `${classes.title} : ${content.title}`,
        type: 2,
        start_time: content.meetingStartTime,
        duration: moment(content.meetingEndTime).diff(
          moment(content.meetingStartTime),
          'minutes'
        ),
        timezone: moment.tz.guess(),
        password: component.get('passwordData')
      };
      return component.get('videConferenceService').createZoomMeeting(params);
    } else {
      let params = {
        summary: `${classes.title} : ${content.title}`,
        startDateTime: content.meetingStartTime,
        endDateTime: content.meetingEndTime,
        attendees: emailIDs,
        timeZone: moment.tz.guess()
      };

      if (params.attendees.length) {
        return component
          .get('videConferenceService')
          .createConferenceEvent(params);
      }
    }
  }
});
