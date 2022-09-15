import Ember from 'ember';
import Bookmark from 'gooru-web/models/content/bookmark';
import {
  CONTENT_TYPES,
  ROLES,
  PLAYER_EVENT_SOURCE,
  SEARCH_CONTEXT
} from 'gooru-web/config/config';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/bookmark
   */
  bookmarkService: Ember.inject.service('api-sdk/bookmark'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['library-content-result-grid'],

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Array} searchResults
   */
  searchResults: null,

  /**
   * @property {Boolean} isRemixableContent
   */
  isRemixableContent: Ember.computed('type', function() {
    return (
      this.get('type') === SEARCH_CONTEXT.GOORU_CATALOG ||
      this.get('type') === SEARCH_CONTEXT.LIBRARY
    );
  }),

  /**
   * @property {Array} classroomWithoutCourse
   * Propety to get list of classrooms which doesn't associated with a course
   */
  classroomWithoutCourse: Ember.computed('activeClasses.[]', function() {
    const component = this;
    return component.get('activeClasses').filterBy('courseId', null) || [];
  }),

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    let component = this;
    component.handleShowMoreData();
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
    component.set('isDeepLink', component.get('isDeepLink') === 'true');
  },
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on the play icon
    openContentPlayer: function(assessment) {
      const component = this;
      let previewContentType = assessment.get('isExternalAssessment')
        ? 'assessment-external'
        : 'assessment';
      component.set('previewContent', assessment);
      component.set('previewContentType', previewContentType);
      component.set('isShowContentPreview', true);
    },

    //Action triggered when click play icon
    openCollectionContentPlayer: function(collection) {
      const component = this;
      let type = collection.get('format') || 'collection';
      component.set('previewContent', collection);
      component.set('previewContentType', type);
      component.set('isShowContentPreview', true);
    },

    /**
     * On card edit collection button click
     * @param {Collection} collection
     */
    editCollection: function(collection) {
      this.get('router').transitionTo(
        collection && collection.format === 'collection-external'
          ? 'content.external-collections.edit'
          : 'content.collections.edit',
        collection.get('id'),
        {
          queryParams: {
            isLibraryContent: true,
            isPreviewReferrer: false,
            editing: false
          }
        }
      );
    },

    /**
     * Remix course action, when clicking remix at the course card
     * @param {Content/Course}
     */
    remixCourse: function(course) {
      var remixModel = {
        content: course
      };
      this.sendAction('onRemixCourse', remixModel);
    },

    /**
     * Triggers the refresh of user classes
     */
    updateClass: function() {
      this.sendAction('updateUserClasses');
    },

    /**
     * Action triggered to bookmark a course
     * @param {Course} course
     */
    onBookmarkCourse: function({ title, id }, showType) {
      let bookmark = Bookmark.create(Ember.getOwner(this).ownerInjection(), {
        title,
        contentId: id,
        contentType: CONTENT_TYPES.COURSE
      });
      this.createBookmark(bookmark).then(() =>
        this.notifyBookmarkSuccess(bookmark, showType)
      );
    },

    /**
     * Edit course action, when clicking Play at the course card
     * @param {Content/Course}
     */
    playIndependentContent: function({ title, id, collectionType }) {
      let isCourse = !collectionType;
      let bookmark = Bookmark.create(Ember.getOwner(this).ownerInjection(), {
        title,
        contentId: id,
        contentType: isCourse ? CONTENT_TYPES.COURSE : collectionType
      });
      return this.createBookmark(bookmark).then(() => {
        if (isCourse) {
          this.get('router').transitionTo('student.independent', id);
        } else {
          let queryParams = {
            role: ROLES.STUDENT,
            source: PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY,
            isIframeMode: true
          };
          this.get('router').transitionTo('player', id, {
            queryParams
          });
        }
      });
    },

    /**
     * Action triggered to bookmark a collection or assessment
     * @param {Collection/Assessment} content
     */
    onBookmarkContent: function({ title, id, collectionType }, showType) {
      let bookmark = Bookmark.create(Ember.getOwner(this).ownerInjection(), {
        title,
        contentId: id,
        contentType: collectionType
      });
      this.createBookmark(bookmark).then(() =>
        this.notifyBookmarkSuccess(bookmark, showType)
      );
    },

    /**
     * Edit course action, when clicking Edit at the course card
     * @param {Content/Course}
     */
    editCourse: function(course) {
      let queryParams = {
        userId: course.get('ownerId'),
        isLibraryContent: true,
        editing: false
      };
      this.get('router').transitionTo(
        'content.courses.edit',
        course.get('id'),
        {
          queryParams
        }
      );
    },

    /**
     * Edit course action, when clicking Play at the course card
     * @param {Content/Course}
     */
    playCourse(course) {
      this.get('router').transitionTo('content.courses.play', course.get('id'));
    },

    selectSingleBox(content) {
      this.sendAction('selectSingleBox', content);
    },

    /**
     * On card edit assessment button click
     * @param {Assessment} assessment
     */
    editAssessment: function(assessment) {
      this.get('router').transitionTo(
        assessment && assessment.format === 'assessment-external'
          ? 'content.external-assessments.edit'
          : 'content.assessments.edit',
        assessment.get('id'),
        {
          queryParams: {
            editingContent: true,
            isLibraryContent: true,
            isPreviewReferrer: false,
            editing: false
          }
        }
      );
    },

    /**
     * Action triggered when click preview button
     */
    onPreviewContent(previewContent, previewContentType) {
      const component = this;
      component.set('previewContent', previewContent);
      component.set('previewContentType', previewContentType);
      component.set('isShowContentPreview', true);
    },

    /**
     * On card play question button click
     * @param {Question} question
     */
    playQuestion: function(question) {
      this.get('router').transitionTo(
        'content.questions.play',
        question.get('id')
      );
    },

    /**
     * On card edit question button click
     * @param {Question} question
     */
    editQuestion: function(question) {
      this.get('router').transitionTo(
        'content.questions.edit',
        question.get('id'),
        {
          queryParams: {
            isLibraryContent: true,
            editing: false
          }
        }
      );
    },

    /**
     * On card remix question button click
     * @param {Question} question
     */
    remixQuestion: function(question) {
      this.sendAction('onRemixQuestion', question);
    },

    /**
     * Edit rubric
     */
    editRubric: function(resource) {
      this.get('router').transitionTo(
        'content.rubric.edit',
        resource.get('id')
      );
    },

    /**
     * On card edit resource button click
     * @param {Resource} resource
     */
    editResource: function(resource) {
      this.get('router').transitionTo(
        'content.resources.edit',
        resource.get('id'),
        {
          queryParams: {
            isLibraryContent: true
          }
        }
      );
    },

    /**
     * On card play resource button click
     * @param {Resource} resource
     */
    playResource: function(resource) {
      this.get('router').transitionTo(
        'content.resources.play',
        resource.get('id')
      );
    },

    showModal(type) {
      this.sendAction('onShowCreateModal', type);
    },

    //Action triggered when click on OA preview
    onShowOfflineActivityPreview(offlineActivity) {
      const component = this;
      component.set('previewContent', offlineActivity);
      component.set('isShowOfflineActivityPreview', true);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  handleShowMoreData() {
    let component = this;
    let loading = false;
    let container = Ember.$('.library-content-result-grid');
    component.$(container).scroll(function() {
      if (!loading) {
        let scrollTop = Ember.$(container).scrollTop();
        let listContainerHeight = Ember.$(container).height() + 500;
        let isScrollReachedBottom =
          scrollTop >=
          component.$(container).prop('scrollHeight') - listContainerHeight;
        if (isScrollReachedBottom) {
          loading = true;
          component.sendAction('paginateNext');
          loading = false;
        }
      }
    });
  },

  /**
   * Send bookmark info to BE for creation
   * @param bookmark
   */
  createBookmark: function(bookmark) {
    return this.get('bookmarkService').createBookmark(bookmark);
  },

  /**
   * Show notification on bookmark success
   * @param bookmark
   * @param showType
   */
  notifyBookmarkSuccess: function(bookmark, showType) {
    this.get('notifications').setOptions({
      positionClass: 'toast-top-full-width',
      toastClass: 'gooru-toast',
      timeOut: 10000
    });
    const successMsg = showType
      ? this.get('i18n').t('common.bookmarked-content-success', {
        contentType: bookmark.get('contentType')
      })
      : this.get('i18n').t('common.bookmarked-success');
    const independentLearningURL = this.get('router').generate(
      'student-independent-learning'
    );
    const buttonText = this.get('i18n').t('common.take-me-there');
    this.get('notifications').success(
      `${successMsg} <a class="btn btn-success" href="${independentLearningURL}">${buttonText}</a>`
    );
  }
});
