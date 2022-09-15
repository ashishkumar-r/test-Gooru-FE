import Ember from 'ember';
import { EMOTION_VALUES } from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-dca-collection-report'],

  // -------------------------------------------------------------------------
  // Dependencies

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

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose() {
      this.closePullUp();
    },

    onChooseGridView() {
      this.set('isGridView', true);
      this.set('isListView', false);
    },

    onChooseListView() {
      this.set('isGridView', false);
      this.set('isListView', true);
    },

    onToggleTimeSpentFlt() {
      this.toggleProperty('isTimeSpentFltApplied');
    },

    onToggleReactionFlt() {
      this.toggleProperty('isReactionFltApplied');
    },

    onClickPrev() {
      let component = this;
      component
        .$(
          '.dca-collection-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let collections = component.get('collections');
      let selectedElement = component.$(
        '.dca-collection-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = selectedElement.data('item-index') - 1;
      if (currentIndex === 0) {
        selectedIndex = collections.length - 1;
      }
      component.set('selectedCollection', collections.objectAt(selectedIndex));
      component
        .$('.dca-collection-report-container #report-carousel-wrapper')
        .carousel('prev');
      component.loadData();
    },

    onClickNext() {
      let component = this;
      component
        .$(
          '.dca-collection-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
      let collections = component.get('collections');
      let selectedElement = component.$(
        '.dca-collection-report-container #report-carousel-wrapper .item.active'
      );
      let currentIndex = selectedElement.data('item-index');
      let selectedIndex = currentIndex + 1;
      if (collections.length - 1 === currentIndex) {
        selectedIndex = 0;
      }
      component.set('selectedCollection', collections.objectAt(selectedIndex));
      component
        .$('.dca-collection-report-container #report-carousel-wrapper')
        .carousel('next');
      component.loadData();
    },

    studentReport(studentPerformance) {
      let component = this;
      let activityDate = component.get('activityDate');
      let collection = component.get('selectedCollection');
      let params = {
        userId: studentPerformance.get('id'),
        classId: component.get('classId'),
        collectionId: collection.get('id'),
        type: collection.get('format'),
        activityDate: activityDate,
        isStudent: false,
        studentPerformance: studentPerformance,
        collection
      };
      let reportType = params.type;
      if (reportType === 'assessment-external') {
        component.set('isShowStudentExternalAssessmentReport', true);
      } else {
        component.set('isShowStudentReport', true);
      }
      component.set('studentReportContextData', params);
    },

    onClickChart(userId, showReport) {
      if (showReport) {
        let component = this;
        let studentPerformance = component
          .get('studentReportData')
          .findBy('id', userId);
        let activityDate = component.get('activityDate');
        let collection = component.get('selectedCollection');
        let params = {
          userId: userId,
          classId: component.get('classId'),
          collectionId: collection.get('id'),
          type: collection.get('format'),
          activityDate: activityDate,
          studentPerformance: studentPerformance,
          isStudent: false,
          collection
        };
        let reportType = params.type;
        if (reportType === 'assessment-external') {
          component.set('isShowStudentExternalAssessmentReport', true);
        } else {
          component.set('isShowStudentReport', true);
        }
        component.set('studentReportContextData', params);
      }
    },

    openQuestionReport(question, contents) {
      let component = this;
      let params = {
        classId: component.get('classId'),
        collection: component.get('selectedCollection'),
        activityDate: component.get('activityDate'),
        selectedQuestion: question,
        contents: contents,
        classMembers: component.get('classMembers')
      };
      component.set('studentQuestionReportContextData', params);
      this.set('isShowQuestionReport', true);
    },

    onClosePullUp() {
      let component = this;
      component.set('isShowStudentExternalAssessmentReport', false);
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
   * Selected activityDate belongs to this collection report.
   * @type {String}
   */
  activityDate: Ember.computed.alias('context.activityDate'),

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

  /**
   * Maintains context data
   * @type {Object}
   */
  context: null,

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

  /**
   * Maintains the state of student external assessment report pullup
   * @type {Boolean}
   */
  isShowStudentExternalAssessmentReport: false,

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

  closePullUp() {
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
      .$('.dca-collection-report-container .report-content')
      .scroll(function() {
        let scrollTop = component
          .$('.dca-collection-report-container .report-content')
          .scrollTop();
        let scrollFixed = component.$(
          '.dca-collection-report-container .report-content .pull-up-collection-report-listview .on-scroll-fixed'
        );
        let height =
          component
            .$(
              '.dca-collection-report-container .report-content .report-carousel'
            )
            .height() +
          component
            .$(
              '.dca-collection-report-container .report-content .report-header-container'
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
      .$('.dca-collection-report-container #report-carousel-wrapper')
      .carousel(selectedIndex);
  },

  loadData() {
    let component = this;
    let collectionId = component.get('selectedCollection.id');
    let format = component.get('selectedCollection.format');
    let classId = component.get('classId');
    let activityDate = component.get('activityDate');
    let collectionType = format === 'collection' ? 'collection' : 'assessment';
    component.set('collectionType', collectionType);
    component.set('isLoading', true);
    if (collectionType === 'collection') {
      component.set('isTimeSpentFltApplied', true);
    }
    return Ember.RSVP.hash({
      collection:
        format === 'assessment'
          ? component.get('assessmentService').readAssessment(collectionId)
          : format === 'assessment-external'
            ? component
              .get('assessmentService')
              .readExternalAssessment(collectionId)
            : component.get('collectionService').readCollection(collectionId),
      performance: component
        .get('analyticsService')
        .getDCAPerformance(classId, collectionId, collectionType, activityDate)
    }).then(({ collection, performance }) => {
      if (!component.isDestroyed) {
        component.set('collection', collection);
        if (format === 'assessment-external') {
          component.parseClassMemberAndExternalPerformanceData(performance);
        } else {
          component.parseClassMemberAndPerformanceData(collection, performance);
        }
        component.set('isLoading', false);
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
      if (userPerformance) {
        user.set('sessionId', userPerformance.get('sessionId'));
      }
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
          if (resourceResult.get('correct')) {
            numberOfCorrectAnswers++;
          }
          totalTimeSpent = totalTimeSpent + resourceResult.get('timeSpent');
          performanceData.set('correct', resourceResult.get('correct'));
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

    let overAllScore = Math.floor(
      (numberOfCorrectAnswers / numberOfQuestionsStarted) * 100
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
          '.dca-collection-report-container #report-carousel-wrapper .carousel-control'
        )
        .addClass('in-active');
    } else {
      if (currentIndex === 0) {
        component
          .$(
            '.dca-collection-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.dca-collection-report-container #report-carousel-wrapper .carousel-control.left'
          )
          .removeClass('in-active');
      }
      if (currentIndex === collections.length - 1) {
        component
          .$(
            '.dca-collection-report-container #report-carousel-wrapper .carousel-control.right'
          )
          .addClass('in-active');
      } else {
        component
          .$(
            '.dca-collection-report-container #report-carousel-wrapper .carousel-control.right'
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
  }
});
