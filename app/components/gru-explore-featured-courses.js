import Ember from 'ember';
import Bookmark from 'gooru-web/models/content/bookmark';
import { CONTENT_TYPES } from 'gooru-web/config/config';

/**
 * explore featured courses component
 *
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/bookmark
   */
  bookmarkService: Ember.inject.service('api-sdk/bookmark'),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  /**
   * Create a bookmark
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
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
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
     *Action triggered when select play the course
     */
    playCourse: function({ id, title }) {
      let bookmark = Bookmark.create(Ember.getOwner(this).ownerInjection(), {
        title,
        contentId: id,
        contentType: CONTENT_TYPES.COURSE
      });
      return this.createBookmark(bookmark).then(() =>
        this.get('router').transitionTo('student.independent', id)
      );
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Array[]} - courses
   */
  courses: null,

  /**
   * @property {Profile} user profile
   */
  profile: null
});
