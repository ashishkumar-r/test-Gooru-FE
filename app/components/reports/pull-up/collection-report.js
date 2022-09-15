import Ember from 'ember';
import {
  EMOTION_VALUES,
  CONTENT_TYPES,
  ANSWER_SCORE_TYPE_ENUM,
  SIGNATURE_CONTENTS
} from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import {
  downloadAllSubmision,
  setDownloadPathForUrl
} from 'gooru-web/utils/utils';
import { download } from '../../../utils/csv';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-collection-report'],

  classNameBindings: ['isOAReport:oa-report-pullup'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Service} tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  reportService: Ember.inject.service('api-sdk/report'),

  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  session: Ember.inject.service('session'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onDowloadDropdown() {
      this.set('displayOptions', true);
    },

    onDownloadCSV() {
      this.set('displayOptions', false);
      let studentReport = [];
      const studentEvidence = this.get('studentEvidence');
      const studentHeader = ['Students', ...this.get('tableHeaders')];
      studentReport.push(studentHeader);
      studentEvidence.forEach(item => {
        item.evidence.forEach(evidence => {
          const studentItem = [item.user.fullName, ...Object.values(evidence)];
          studentReport.push(studentItem);
        });
      });
      let sheetClassName = this.get('class.title');
      const sheetName = `${'AdwReport - '}${sheetClassName}`;
      download(sheetName, studentReport);
    },

    onPrintPreview() {
      this.set('displayOptions', false);
      let className = this.get('class.title');
      var tempTitle = document.title;
      document.title = `${'AdwReport - '}${className}`;
      window.print();
      document.title = tempTitle;
    },

    onClickDownload() {
      const filename = `${this.get('selectedCollection.format')}_${this.get(
        'selectedCollection.title'
      )}`;
      downloadAllSubmision(this.get('submissionData'), filename, null, true);
    },
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onChooseGridView() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_GRID_VIEW
      );
      this.set('isGridView', true);
      this.set('isListView', false);
    },

    onChooseListView() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_LIST_VIEW
      );
      this.set('isGridView', false);
      this.set('isListView', true);
    },

    onToggleTimeSpentFlt() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_TIMESPEND
      );
      this.toggleProperty('isTimeSpentFltApplied');
    },

    onToggleReactionFlt() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_REACTION
      );
      this.toggleProperty('isReactionFltApplied');
    },

    onClickPrev() {
      let component = this;
      component
        .$(
          '.collection-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let collections = component.get('collections');
      let selectedElement = component.$(
        '.collection-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = collections.length - 1;
      }
      component.set('selectedCollection', collections.objectAt(selectedIndex));
      component
        .$('.collection-report-container #report-carousel-wrapper')
        .carousel('prev');
      component.loadData();
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.collection-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let collections = component.get('collections');
      let selectedElement = component.$(
        '.collection-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (collections.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedCollection', collections.objectAt(selectedIndex));
      component
        .$('.collection-report-container #report-carousel-wrapper')
        .carousel('next');
      component.loadData();
    },

    studentReport(collection, userId, studentPerformance) {
      let component = this;
      if (!userId) {
        userId = component.get('session.userId');
      }
      let params = {
        userId,
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unitId: component.get('unit.id'),
        lessonId: component.get('lesson.id'),
        collectionId: collection.get('id'),
        type: collection.get('format'),
        lesson: component.get('lesson'),
        isStudent: component.get('isStudent'),
        collection,
        studentPerformance,
        isUnit0: component.get('unit.isUnit0')
      };
      let reportType = params.type;
      if (reportType === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        component.set('isShowStudentReport', false);
        component.set('isShowStudentExternalAssessmentReport', true);
      } else if (reportType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        params.performance = studentPerformance;
        component.set('isShowStudentOfflineActivityReport', true);
      } else {
        component.set('isShowStudentReport', true);
        component.set('isShowStudentExternalAssessmentReport', false);
      }
      component.set('studentReportContextData', params);
    },

    onClickChart(userId, showReport) {
      if (showReport) {
        let component = this;
        if (!userId) {
          userId = component.get('session.userId');
        }
        let collection = component.get('selectedCollection');
        let params = {
          userId: userId,
          classId: component.get('classId'),
          courseId: component.get('courseId'),
          unitId: component.get('unit.id'),
          lessonId: component.get('lesson.id'),
          collectionId: collection.get('id'),
          type: collection.get('format'),
          lesson: component.get('lesson'),
          isStudent: component.get('isStudent'),
          collection
        };
        component.set('studentReportContextData', params);
        component.set('isShowStudentReport', true);
      }
    },

    openQuestionReport(question, contents) {
      let component = this;
      let context = component.get('context');
      let params = {
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unit: component.get('unit'),
        lesson: component.get('lesson'),
        collection: component.get('selectedCollection'),
        selectedQuestion: question,
        contents: contents,
        classMembers: component.get('classMembers'),
        selectedUserId: context.selectedUserId
      };
      component.set('studentQuestionReportContextData', params);
      this.set('isShowQuestionReport', true);
    },

    likertQuestionReport(question, contents) {
      let component = this;
      let context = component.get('context');
      let params = {
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unit: component.get('unit'),
        lesson: component.get('lesson'),
        collection: component.get('selectedCollection'),
        selectedQuestion: question,
        contents: contents,
        classMembers: component.get('classMembers'),
        selectedUserId: context.selectedUserId
      };
      component.set('likertReportContextData', params);
      this.set('isShowLikertReport', true);
    },

    onClosePullUp() {
      let component = this;
      component.set('isShowQuestionReport', false);
      component.set('isShowStudentExternalAssessmentReport', false);
      component.closePullUp(true);
    },
    reportClose() {
      let component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
        }
      );
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },
  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.handleScrollToFixHeader();
    this.openPullUp();
    this.slideToSelectedCollection();
    this.loadData();
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this collection report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * CourseId belongs to this collection report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Unit belongs to this collection report.
   * @type {String}
   */
  unit: Ember.computed.alias('context.unitModel'),

  /**
   * Lesson belongs to this collection report.
   * @type {[type]}
   */
  lesson: Ember.computed.alias('context.lessonModel'),

  /**
   * collectionId of this report.
   * @type {[type]}
   */
  collectionId: Ember.computed.alias('context.collectionId'),

  /**
   * By default it will show both assessment and collections
   * @type {String}
   */
  filterByContentType: null,

  isAdwReport: true,

  /**
   * List of collection mapped to lesson.
   * @type {Array}
   */
  collections: Ember.computed('context.collections', function() {
    let collections = this.get('context.collections');
    let filterByContentType = this.get('filterByContentType');
    let collectionList = collections.filterBy('performance.hasStarted', true);
    if (filterByContentType) {
      collectionList = collections.filterBy('format', filterByContentType);
    }
    return collectionList;
  }),

  /**
   * Selected collection.
   * @type {Array}
   */
  selectedCollection: Ember.computed.alias('context.collection'),

  /**
   * @property {Boolean} isOfflineActivityReport
   */
  isOfflineActivityReport: Ember.computed.equal(
    'selectedCollection.format',
    CONTENT_TYPES.OFFLINE_ACTIVITY
  ),

  /**
   * @property {Boolean} isExternalAssessmentReport
   */
  isExternalAssessmentReport: Ember.computed.equal(
    'selectedCollection.format',
    CONTENT_TYPES.EXTERNAL_ASSESSMENT
  ),

  isOAReport: Ember.computed('selectedCollection', 'isAdwReport', function() {
    return (
      this.get('selectedCollection.format') === 'offline-activity' &&
      this.get('showConsolidatedReport') &&
      this.get('isAdwReport')
    );
  }),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * This property will get change based on view selection, by default grid view off.
   * @type {Boolean}
   */
  isGridView: false,

  /**
   * This property will get change based on view selection, by default list view  on.
   * @type {Boolean}
   */
  isListView: true,

  /**
   * This property will get change based on filter selection, by default reaction filter off.
   * @type {Boolean}
   */
  isReactionFltApplied: false,

  /**
   * This property will get change based on filter selection, by default timespent filter off.
   * @type {Boolean}
   */
  isTimeSpentFltApplied: false,

  /**
   * selected collection object which will have other meta data's
   * @type {Object}
   */
  collection: null,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  /**
   * Stutent  report data
   * @type {Object}
   */
  studentReportData: Ember.A([]),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * This attribute decide default sorting key
   * @type {String}
   */
  defaultSortCriteria: 'lastName',

  /**
   * Maintain the status of sort by firstName
   * @type {String}
   */
  sortByFirstnameEnabled: false,

  /**
   * Maintain the status of sort by lastName
   * @type {String}
   */
  sortByLastnameEnabled: true,

  displayOptions: false,

  /**
   * Maintain the status of sort by score
   * @type {String}
   */
  sortByScoreEnabled: false,

  /**
   * Maintain the status of sort by timeSpent
   * @type {String}
   */
  sortByTimeSpentEnabled: false,

  tenantSettingsObj: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSetting;
  }),

  showConsolidatedReport: Ember.computed(function() {
    let tenantSettings = this.get('tenantSettingsObj');
    return tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings
        .show_oa_consolidated_report === true
      ? tenantSettings.ui_element_visibility_settings
        .show_oa_consolidated_report
      : false;
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collection.standards.[]', function() {
    let standards = this.get('collection.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  studentEvidence: Ember.A([]),

  /**
   * Maintains the state of role.
   * @type {Boolean}
   */
  isStudent: Ember.computed.alias('context.isStduent'),

  /**
   * Maintains list of students selected for  suggest
   * @type {Array}
   */
  studentsSelectedForSuggest: Ember.A([]),

  /**
   * Maintains maximum number of search results
   * @type {Number}
   */
  maxSearchResult: 6,

  /**
   * suggest count
   * @type {Number}
   */
  suggestResultCount: 0,

  /**
   * Maintains context data
   * @type {Object}
   */
  context: null,

  /**
   * defaultSuggestContentType
   * @type {String}
   */
  defaultSuggestContentType: 'collection',

  /**
   * Maintains the state of student report pullup
   * @type {Boolean}
   */
  isShowStudentReport: false,

  /**
   * Maintains the state of question report pullup
   * @type {Boolean}
   */
  isShowQuestionReport: false,

  isShowLikertReport: false,

  /**
   * Maintains the state of student external assessment report pullup
   * @type {Boolean}
   */
  isShowStudentExternalAssessmentReport: false,

  /**
   * Property to check, whether it is an archived class or not
   * @type {Boolean}
   */
  isArchivedClass: false,

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  },

  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  handleScrollToFixHeader() {
    let component = this;
    component
      .$('.collection-report-container .report-content')
      .scroll(function() {
        let scrollTop = component
          .$('.collection-report-container .report-content')
          .scrollTop();
        let scrollFixed = component.$(
          '.collection-report-container .report-content .pull-up-collection-report-listview .on-scroll-fixed'
        );
        let height =
          component
            .$('.collection-report-container .report-content .report-carousel')
            .height() +
          component
            .$(
              '.collection-report-container .report-content .report-header-container'
            )
            .height();
        if (scrollTop >= height) {
          let position = scrollTop - height;
          component.$(scrollFixed).css('top', `${position}px`);
        } else {
          component.$(scrollFixed).css('top', '0px');
        }
      });
  },

  slideToSelectedCollection() {
    let component = this;
    let collections = component.get('collections');
    let selectedCollection = component.get('selectedCollection');
    let selectedIndex = collections.indexOf(selectedCollection);
    component
      .$('.collection-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  loadData() {
    let component = this;
    let collectionId = component.get('selectedCollection.id');
    let format = component.get('selectedCollection.format');
    let unitId = component.get('unit.id');
    let lessonId = component.get('lesson.id');
    let courseId = component.get('courseId');
    let classId = component.get('classId');
    let oaId = this.get('context.collection.id');
    let collectionType =
      format === 'collection' || format === 'collection-external'
        ? 'collection'
        : 'assessment';
    component.set('collectionType', collectionType);
    component.set('isLoading', true);
    if (collectionType === 'collection') {
      component.set('isTimeSpentFltApplied', true);
    }
    let classService = component.get('classService');
    let classDataPromise = classId
      ? classService.readClassInfo(classId)
      : Ember.RSVP.resolve({});
    return Ember.RSVP.hash({
      collection: component.getContentDetails(format, collectionId),
      reportData: this.get('showConsolidatedReport')
        ? this.get('reportService').fetchActivityEvidenceReport(classId, oaId)
        : null,
      performance: component
        .get('analyticsService')
        .findResourcesByCollection(
          classId,
          courseId,
          unitId,
          lessonId,
          collectionId,
          collectionType
        ),
      classData: classDataPromise
    }).then(({ collection, performance, classData, reportData }) => {
      if (!component.isDestroyed) {
        if (reportData) {
          const { evidenceHeader, oaEvidence } = reportData;
          this.set('tableHeaders', evidenceHeader);
          this.set('studentEvidence', oaEvidence);
          if (!oaEvidence.length) {
            this.set('isAdwReport', false);
          }
        } else {
          this.set('isAdwReport', false);
        }
        component.set('collection', collection);
        component.set('class', classData);
        if (
          format === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
          format === CONTENT_TYPES.OFFLINE_ACTIVITY
        ) {
          component.parseClassMemberAndExternalPerformanceData(performance);
        } else {
          component.parseClassMemberAndPerformanceData(collection, performance);
        }
        component.set('isLoading', false);
        component.loadSuggestion();
        const dataParam = {
          classId,
          unitId,
          courseId,
          lessonId,
          oaId: collectionId
        };
        const Ids = this.get('studentReportData').map(student => {
          return student.id;
        });
        dataParam.studentId = { students: Ids };
        let submissionData = [];
        component
          .get('offlineActivityService')
          .getBulkSubmission(dataParam)
          .then(response => {
            if (response) {
              const bulkUser = JSON.parse(response);
              bulkUser.students.forEach(student => {
                if (student.tasks) {
                  student.tasks.forEach(task => {
                    if (task.submissions) {
                      task.submissions.filter(item => {
                        if (item.submissionType === 'uploaded') {
                          const userDetail = this.get('studentReportData').find(
                            data => {
                              return data.id === student.userId;
                            }
                          );
                          const fileName =
                            item.submissionInfo.indexOf(
                              component.get('session.cdnUrls.content')
                            ) !== -1
                              ? item.submissionInfo
                              : `${component.get('session.cdnUrls.content')}${
                                item.submissionInfo
                              }`;
                          const fileItem = {
                            fileUrl: setDownloadPathForUrl(fileName),
                            orginalFileName: item.submissionOriginalFileName,
                            userName: `${userDetail.firstName}${userDetail.lastName}`
                          };
                          submissionData.push(fileItem);
                        }
                      });
                    }
                  });
                  if (submissionData) {
                    component.set('submissionData', submissionData);
                  }
                }
              });
            }
          });
      }
    });
  },

  parseClassMemberAndExternalPerformanceData(performance) {
    let component = this;
    let classMembers = component.get('classMembers');
    let users = Ember.A([]);
    classMembers.map(member => {
      let user = component.createUser(member);
      let userPerformance = performance.findBy('user', member.id);
      let userExternalAssessmentPerf = userPerformance
        ? userPerformance.assessment
        : null;
      if (userExternalAssessmentPerf) {
        user.set('score', userExternalAssessmentPerf.score);
        user.set('hasStarted', true);
        user.set('reaction', userExternalAssessmentPerf.reaction);
        user.set('difference', 100 - userExternalAssessmentPerf.score);
      } else {
        user.set('hasStarted', false);
      }
      users.pushObject(user);
    });
    component.set('studentReportData', users);
    component.set('sortByLastnameEnabled', true);
    component.set('sortByFirstnameEnabled', false);
    component.set('sortByScoreEnabled', false);
    component.set('sortByTimeSpentEnabled', false);
    component.set('studentsSelectedForSuggest', Ember.A([]));
    component.set('suggestResultCount', 0);
    component.set('defaultSuggestContentType', 'collection');
    component.handleCarouselControl();
  },

  parseClassMemberAndPerformanceData(collection, performance) {
    let component = this;
    let classMembers = component.get('classMembers');
    let users = Ember.A([]);
    let usersTotaltimeSpent = Ember.A([]);
    classMembers.forEach(member => {
      let user = component.createUser(member);
      let contents = collection.get('children');
      let userPerformance = performance.findBy('user', member.id);
      let resultSet = component.parsePerformanceContentAndUserData(
        contents,
        userPerformance
      );

      user.set('userPerformanceData', resultSet.userPerformanceData);
      user.set('hasStarted', resultSet.hasStarted);
      user.set('totalTimeSpent', resultSet.totalTimeSpent);
      user.set('isGraded', resultSet.isGraded);
      user.set('difference', 100 - resultSet.overAllScore);
      user.set('score', resultSet.overAllScore);
      // Reform score value and store in score-use-for-sort field, to handle sort.
      // -2 defines not started, -1 defines not graded.
      if (!resultSet.hasStarted) {
        user.set('score-use-for-sort', -2);
      } else if (!resultSet.isGraded) {
        user.set('score-use-for-sort', -1);
      } else {
        user.set('score-use-for-sort', resultSet.overAllScore);
      }
      users.pushObject(user);
      usersTotaltimeSpent.push(resultSet.totalTimeSpent);
    });
    users = users.sortBy(component.get('defaultSortCriteria'));
    if (component.get('selectedCollection').get('format') === 'assessment') {
      users = users.sortBy('isGraded');
    }
    component.set('sortByLastnameEnabled', true);
    component.set('sortByFirstnameEnabled', false);
    component.set('sortByScoreEnabled', false);
    component.set('sortByTimeSpentEnabled', false);
    component.set('studentsSelectedForSuggest', Ember.A([]));
    component.set('suggestResultCount', 0);
    component.set('defaultSuggestContentType', 'collection');
    component.set('studentReportData', users);
    let maxTimeSpent = Math.max(...usersTotaltimeSpent);
    component.calculateTimeSpentScore(users, maxTimeSpent);
    component.handleCarouselControl();
  },

  parsePerformanceContentAndUserData(contents, userPerformance) {
    let userPerformanceData = Ember.A([]);
    let numberOfCorrectAnswers = 0;
    let totalTimeSpent = 0;
    let hasStarted = false;
    let isGraded = true;
    let numberOfQuestionsStarted = 0;
    contents.forEach((content, index) => {
      let contentId = content.get('id');
      let performanceData = Ember.Object.create({
        id: content.get('id'),
        sequence: index + 1,
        isGraded: true
      });
      if (userPerformance) {
        let resourceResults = userPerformance.get('resourceResults');
        let resourceResult = resourceResults.findBy('resourceId', contentId);
        if (resourceResult) {
          performanceData.set('hasStarted', true);
          hasStarted = true;
          numberOfQuestionsStarted++;
          if (
            resourceResult.get('questionType') === 'OE' &&
            !resourceResult.get('isGraded')
          ) {
            isGraded = false;
            performanceData.set('isGraded', false);
          }
          let reaction = resourceResult.get('reaction');
          performanceData.set('reaction', reaction);
          if (reaction > 0) {
            let selectionEmotion = EMOTION_VALUES.findBy('value', reaction);
            performanceData.set('reaction_unicode', selectionEmotion.unicode);
          }
          if (resourceResult.percentScore) {
            numberOfCorrectAnswers += resourceResult.get('percentScore');
          }
          performanceData.set('score', resourceResult.get('score'));
          totalTimeSpent = totalTimeSpent + resourceResult.get('timeSpent');
          performanceData.set(
            'correct',
            resourceResult.get('correct') === ANSWER_SCORE_TYPE_ENUM.correct
          );
          performanceData.set('timeSpent', resourceResult.get('timeSpent'));
          performanceData.set('isSkipped', !resourceResult.get('userAnswer'));
        } else {
          performanceData.set('hasStarted', false);
        }
      } else {
        performanceData.set('hasStarted', false);
      }
      performanceData.set('format', content.get('format'));

      userPerformanceData.pushObject(performanceData);
    });
    let overAllScore = Math.round(
      (numberOfCorrectAnswers / (numberOfQuestionsStarted * 100)) * 100
    );
    let resultSet = {
      userPerformanceData: userPerformanceData,
      overAllScore: overAllScore,
      hasStarted: hasStarted,
      totalTimeSpent: totalTimeSpent,
      isGraded: isGraded
    };
    return resultSet;
  },

  handleCarouselControl() {
    let component = this;
    let selectedCollection = component.get('selectedCollection');
    let collections = component.get('collections');
    let currentIndex = collections.indexOf(selectedCollection);
    if (collections.length - 1 === 0) {
      component
        .$(
          '.collection-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.collection-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.collection-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === collections.length - 1) {
        component
          .$(
            '.collection-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.collection-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .removeClass('in-active');
      }
    }
  },

  calculateTimeSpentScore(users, maxTimeSpent) {
    users.forEach(data => {
      let timeSpentScore = Math.round(
        (data.get('totalTimeSpent') / maxTimeSpent) * 100
      );
      data.set('timeSpentScore', timeSpentScore);
      data.set('timeSpentDifference', 100 - timeSpentScore);
    });
  },

  createUser(user) {
    return Ember.Object.create({
      id: user.get('id'),
      firstName: user.get('firstName'),
      lastName: user.get('lastName'),
      avatarUrl: user.get('avatarUrl')
    });
  },

  loadSuggestion() {
    let component = this;
    let maxSearchResult = component.get('maxSearchResult');
    let contentType = [
      CONTENT_TYPES.COLLECTION,
      SIGNATURE_CONTENTS.SIGNATURE_COLLECTION
    ];
    let standards = component.get('collection.standards');
    let competencyCode;
    if (standards && standards.length) {
      competencyCode = standards.map(standard => standard.get('id')).toString();
    }
    let params = {
      pageSize: maxSearchResult,
      contentType: contentType,
      competencyCode: competencyCode,
      isCollection: true,
      isSuggestion: true
    };
    let term = '*';
    component
      .get('searchService')
      .searchSignatureContent(term, params)
      .then(collectionData => {
        let assessmentContentType = [
          CONTENT_TYPES.ASSESSMENT,
          SIGNATURE_CONTENTS.SIGNATURE_ASSESSMENT
        ];
        params.contentType = assessmentContentType;
        params.isCollection = false;
        component
          .get('searchService')
          .searchSignatureContent(term, params)
          .then(assessmentData => {
            let suggestCount = assessmentData.length + collectionData.length;
            component.set(
              'suggestResultCount',
              suggestCount >= maxSearchResult ? maxSearchResult : suggestCount
            );
            component.set(
              'defaultSuggestContentType',
              this.get('selectedCollection.format')
            );
          });
      });
  },

  getFilters() {
    let component = this;
    let maxSearchResult = component.get('maxSearchResult');
    let params = {
      pageSize: maxSearchResult,
      filters: {}
    };
    let primaryLanguage = component.get('class.primaryLanguage');
    if (primaryLanguage) {
      params.filters['flt.languageId'] = primaryLanguage;
    }
    return params;
  },

  /**
   * @function getContentDetails
   * Method to active content/collection details
   */
  getContentDetails(format, collectionId) {
    const component = this;
    let isDefaultShowFW = component.get('isDefaultShowFW');
    let classFramework = component.get('classFramework');
    if (format === CONTENT_TYPES.ASSESSMENT) {
      return component
        .get('assessmentService')
        .readAssessment(collectionId, classFramework, isDefaultShowFW);
    } else if (format === CONTENT_TYPES.COLLECTION) {
      return component
        .get('collectionService')
        .readCollection(collectionId, classFramework, isDefaultShowFW);
    } else if (format === CONTENT_TYPES.EXTERNAL_COLLECTION) {
      return component
        .get('collectionService')
        .readExternalCollection(collectionId, classFramework, isDefaultShowFW);
    } else if (format === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
      return component
        .get('assessmentService')
        .readExternalAssessment(collectionId, classFramework, isDefaultShowFW);
    } else if (format === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      return component
        .get('offlineActivityService')
        .readActivity(collectionId, isDefaultShowFW, classFramework);
    } else {
      return Ember.RSVP.resolve({});
    }
  }
});
