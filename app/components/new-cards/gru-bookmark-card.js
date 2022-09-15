import Ember from 'ember';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import ModalMixin from 'gooru-web/mixins/modal';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
export default Ember.Component.extend(ModalMixin, tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {courseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {collectionService} Service to retrieve collection information
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @type {assessmentService} Service to retrieve assessment information
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @type {BookmarkService} Service to retrieve bookmark information
   */
  bookmarkService: Ember.inject.service('api-sdk/bookmark'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: [
    'new-cards',
    'new-gru-bookmark-card',
    'col-sm-4',
    'col-xs-12',
    'col-md-3',
    'col-lg-3'
  ],

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  init: function() {
    const component = this;
    component._super(...arguments);
    let isCourse = component.get('isCourse');
    let isCollection = component.get('isCollection');
    if (isCourse) {
      const courseId = component.get('bookmark.contentId');
      if (courseId) {
        component
          .get('courseService')
          .fetchById(courseId)
          .then(function(course) {
            if (!component.isDestroyed) {
              component.set('content', course);
            }
          });
      }
    } else if (isCollection) {
      const collectionId = component.get('bookmark.contentId');
      if (collectionId) {
        component
          .get('collectionService')
          .readCollection(collectionId)
          .then(function(collection) {
            if (!component.isDestroyed) {
              component.set('content', collection);
            }
          });
      }
    } else {
      const assessmentId = component.get('bookmark.contentId');
      if (assessmentId) {
        component
          .get('assessmentService')
          .readAssessment(assessmentId)
          .then(function(assessment) {
            if (!component.isDestroyed) {
              component.set('content', assessment);
            }
          });
      }
    }
  },

  actions: {
    removeBookmark: function() {
      let component = this;
      var model = {
        content: component.get('bookmark'),
        deleteMethod: function() {
          return component
            .get('bookmarkService')
            .deleteBookmark(component.get('bookmark.id'));
        },
        type: component.get('bookmark.contentType'),
        callback: {
          success: function() {
            component.get('onDeleteBookmark')(component.get('bookmark'));
          }
        }
      };
      this.actions.showModal.call(
        this,
        'content.modals.gru-delete-bookmark',
        model
      );
    },

    openPlayerContent: function() {
      const component = this;
      const bookmark = component.get('bookmark');
      let id = bookmark.get('contentId');
      let type = bookmark.get('contentType');
      let queryParams = {
        type: type,
        role: 'student',
        source: component.get('source'),
        isIframeMode: true
      };
      component.set(
        'playerUrl',
        component.get('router').generate('player', id, { queryParams })
      );
      let playerContent = Ember.Object.create({
        title: bookmark.get('title'),
        format: bookmark.get('contentType')
      });
      component.set('isOpenPlayer', true);
      component.set('playerContent', playerContent);
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
    }
  },

  /**
   * @property {Boolean} if the bookmark is of type course
   */
  isCourse: Ember.computed.equal('bookmark.contentType', CONTENT_TYPES.COURSE),

  /**
   * @property {Boolean} if the bookmark is of type assessment
   */
  isAssessment: Ember.computed.equal(
    'bookmark.contentType',
    CONTENT_TYPES.ASSESSMENT
  ),

  /**
   * @property {Boolean} if the bookmark is of type collection
   */
  isCollection: Ember.computed.equal(
    'bookmark.contentType',
    CONTENT_TYPES.COLLECTION
  ),

  /**
   * @property {Bookmark} bookmark information
   */
  bookmark: null,

  /**
   * @property {Content} content information
   */
  content: null,

  /**
   * @property {Source} source information for study player
   */
  source: PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY
});
