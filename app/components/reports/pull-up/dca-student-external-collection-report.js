import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import Context from 'gooru-web/models/result/context';

export default Ember.Component.extend({
  classNames: [
    'reports',
    'backdrop-pull-ups',
    'dca-student-external-collection-report'
  ],

  /**
   * @requires {Ember.Service} session management
   */
  session: Ember.inject.service('session'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @requires {CollectionService} Service to retrieve an collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  isLoading: false,

  showPullUp: false,

  /**
   * defaultSuggestContentType
   * @type {String}
   */
  defaultSuggestContentType: 'assessment',

  /**
   * suggest count
   * @type {Number}
   */
  suggestResultCount: 0,

  /**
   * Maintains maximum number of search results
   * @type {Number}
   */
  maxSearchResult: 6,

  /**
   * @property {externalCollection} List
   * @type {Number}
   */

  externalCollection: Ember.computed('reportData', function() {
    let component = this;
    let reportData = component.get('reportData');
    return reportData.collection;
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('externalCollectionContent.standards.[]', function() {
    let component = this;
    let standards = component.get('externalCollectionContent.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * @property {Number} performanceScore
   */
  timeSpent: Ember.computed('reportData', function() {
    let component = this;
    let reportData = component.get('reportData');
    return reportData.studentPerformance
      ? reportData.studentPerformance.timeSpent
      : reportData.collection.get('performance.timeSpent');
  }),

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
    this.openPullUp();
    this.loadExternalCollectionReportData();
  },

  actions: {
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onCloseSuggest() {
      // on close suggest callback
      return true;
    },

    /**
     * Trigger when suggestion button got clicked
     */
    onOpenSuggestionPullup() {
      let component = this;
      let studentsSelectedForSuggest = Ember.A([]);
      let context = component.getContext(component.get('reportData'));
      let suggestContextParams = Ember.Object.create({
        classId: context.get('classId'),
        courseId: context.get('courseId'),
        unitId: context.get('unitId'),
        lessonId: context.get('lessonId'),
        collectionId: context.get('collectionId')
      });
      studentsSelectedForSuggest.pushObject(component.get('profile'));
      component.set('suggestContextParams', suggestContextParams);
      component.set('studentsSelectedForSuggest', studentsSelectedForSuggest);
      component.set('showSuggestionPullup', true);
    },

    onClosePullUp() {
      let component = this;
      component.set('showSuggestionPullup', false);
      component.closePullUp(true);
    }
  },

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
    component.$().animate({
      top: '100%'
    },
    400,
    function() {
      component.set('showPullUp', false);
      if (closeAll) {
        component.sendAction('onClosePullUp', closeAll);
      }
    });
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

  loadExternalCollectionReportData() {
    let component = this;
    let context = component.get('reportData');
    let profilePromise = new Ember.RSVP.resolve(
      component.get('profileService').readUserProfile(context.userId)
    );
    let collectionContentPromise = new Ember.RSVP.resolve(
      component
        .get('collectionService')
        .readExternalCollection(context.collectionId)
    );

    return Ember.RSVP
      .hash({
        profile: profilePromise,
        externalCollection: collectionContentPromise
      })
      .then(function(hash) {
        component.set('profile', hash.profile);
        component.set('externalCollectionContent', hash.externalCollection);
        component.loadTeacherSuggestions();
      });
  },

  loadTeacherSuggestions() {
    let component = this;
    let context = component.getContext(component.get('reportData'));
    if (!component.get('isStudent')) {
      component
        .get('courseMapService')
        .getLessonInfo(
          context.get('classId'),
          context.get('courseId'),
          context.get('unitId'),
          context.get('lessonId'),
          true,
          context.get('userId')
        )
        .then(lesson => {
          let collections = lesson.get('children');
          let collection = collections.findBy(
            'id',
            context.get('collectionId')
          );
          if (!collection.get('isSuggestedContent')) {
            component.set('showSuggestion', true);
            component.loadSuggestion();
          }
        });
    }
  },

  loadSuggestion: function() {
    let component = this;
    component.set('isSuggestionLoading', true);
    let collection = this.get('externalCollectionContent');
    let taxonomies = null;
    let tags = component.get('tags');
    if (tags) {
      taxonomies = tags.map(tag => {
        return tag.data.id;
      });
    }
    let maxSearchResult = component.get('maxSearchResult');
    let filters = {
      pageSize: maxSearchResult,
      taxonomies: taxonomies
    };
    let term =
      taxonomies != null && taxonomies.length > 0
        ? '*'
        : collection.get('title');
    component
      .get('searchService')
      .searchAssessments(term, filters)
      .then(assessmentSuggestResults => {
        if (!component.isDestroyed) {
          // To show appropriate suggest count, check is their any suggest found in assessment type if count is less than.
          let assessmentSuggestCount = assessmentSuggestResults.length;
          if (assessmentSuggestCount >= maxSearchResult) {
            component.set('isSuggestionLoading', false);
            component.set('suggestResultCount', maxSearchResult);
          } else {
            component
              .get('searchService')
              .searchCollections(term, filters)
              .then(collectionSuggestResult => {
                if (!component.isDestroyed) {
                  let collectionSuggestCount = collectionSuggestResult.length;
                  let suggestCount =
                    collectionSuggestCount + assessmentSuggestCount;
                  if (
                    assessmentSuggestCount === 0 &&
                    collectionSuggestCount > 0
                  ) {
                    component.set('defaultSuggestContentType', 'collection');
                  }
                  component.set('isSuggestionLoading', false);
                  component.set(
                    'suggestResultCount',
                    suggestCount >= maxSearchResult
                      ? maxSearchResult
                      : suggestCount
                  );
                }
              });
          }
        }
      });
  },

  /**
   * Get the player context
   * @param params
   * @returns {Context}
   */
  getContext: function(params) {
    let userId = params.userId;
    const collectionId = params.collectionId;
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;

    return Context.create({
      collectionType: params.type,
      userId: userId,
      collectionId: collectionId,
      courseId: courseId,
      classId: params.classId,
      unitId: unitId,
      lessonId: lessonId
    });
  }
});
