import Ember from 'ember';
import { ROLES } from 'gooru-web/config/config';
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @property {CourseMapService}
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  actions: {
    /**
     * Action triggered when the user accept a suggestion
     */
    onAcceptSuggestion() {
      let controller = this;
      let suggestedContent = controller.get('suggestedContent');
      controller.playSuggestedContent(suggestedContent);
      controller.set('isShowSuggestion', false);
    },

    /**
     * Action triggered when the user ignore a suggestion
     */
    onIgnoreSuggestion() {
      let controller = this;
      controller.playNextContent();
      controller.set('isShowSuggestion', false);
    },

    /**
     * Action triggered when toggle screen mode
     */
    onToggleScreen() {
      let controller = this;
      let studyPlayerController = controller.get('studyPlayerController');
      let isFullScreen = studyPlayerController.get('isFullScreen');
      studyPlayerController.set('isFullScreen', !isFullScreen);
      controller.set('isFullScreen', !isFullScreen);
      if (isFullScreen) {
        Ember.$('body')
          .removeClass('fullscreen')
          .addClass('fullscreen-exit');
      } else {
        Ember.$('body')
          .removeClass('fullscreen-exit')
          .addClass('fullscreen');
      }
    }
  },

  /**
   * Removing dependency on local storage and  bypassing next call when dont have a suggestion
   */
  checknPlayNext: function() {
    if (this.get('hasAnySuggestion')) {
      this.playNextContent();
    } else {
      const context = this.get('mapLocation.context'); //Already having contex
      this.playGivenContent(context);
    }
  },

  playNextContent: function() {
    const component = this;
    const navigateMapService = this.get('navigateMapService');
    const context = this.get('mapLocation.context');
    navigateMapService.next(context).then(nextContext => {
      component.set('mapLocation', nextContext);
      component.playGivenContent(nextContext.context);
    });
  },

  playGivenContent: function(context) {
    let status = (context.get('status') || '').toLowerCase();
    if (status !== 'done') {
      this.toPlayer();
    } else {
      this.set('mapLocation.context.status', 'done');
      this.set('hasSignatureCollectionSuggestions', false);
      this.set('hasSignatureCollectionSuggestions', false);
      this.set('isStatusDone', true);
    }
  },

  playSuggestedContent: function(suggestion) {
    const navigateMapService = this.get('navigateMapService');
    const courseMapService = this.get('courseMapService');
    navigateMapService
      .getStoredNext()
      .then(mapstoredloc => {
        let mapContext = mapstoredloc.get('context');
        var mapcontextloc = mapstoredloc.get('context');
        mapContext.ctx_user_id = this.get('session.userId');
        mapContext.ctx_class_id = mapContext.classId;
        mapContext.ctx_course_id = mapContext.courseId;
        mapContext.ctx_lesson_id = mapContext.lessonId;
        mapContext.ctx_collection_id = mapContext.collectionId;
        mapContext.ctx_milestone_id = mapContext.milestoneId;
        mapContext.ctx_unit_id = mapContext.unitId;
        mapContext.milestone_id = mapContext.milestoneId;
        mapContext.suggested_content_type = suggestion.type;
        mapContext.suggested_content_id = suggestion.id;
        mapContext.source = mapContext.source || null;
        mapContext.suggested_content_subtype =
          suggestion.subType === 'signature_collection'
            ? 'signature-collection'
            : 'signature-assessment';
        mapContext.ctx_path_id = mapContext.ctxPathId;
        mapContext.ctx_path_type = mapContext.ctxPathType;
        return Ember.RSVP.hash({
          context: mapcontextloc,
          pathId: courseMapService.addSuggestedPath(mapContext)
        });
      })
      .then(({ context, pathId }) => {
        context.collectionId = suggestion.id; // Setting new collection id
        context.pathId = pathId;
        //context.pathtype = "system"; //set system path only if required
        suggestion.pathId = pathId;
        suggestion.ctxPathId = context.ctx_path_id;
        suggestion.ctxPathType = context.ctx_path_type;
        return navigateMapService.startAlternatePathSuggestion(context);
      })
      .then(() => this.toPlayer(suggestion));
  },

  /**
   * Navigate to study player to play next collection/assessment
   */
  toPlayer: function(suggestion) {
    const context = this.get('mapLocation.context');
    let queryParams = {
      role: ROLES.STUDENT,
      source: this.get('source'),
      isIframeMode: this.get('isIframeMode')
    };
    let classId = context.get('classId');
    if (classId) {
      queryParams.classId = classId;
    }
    let milestoneId = context.get('milestoneId');
    if (milestoneId) {
      queryParams.milestoneId = milestoneId;
    }
    if (suggestion) {
      queryParams.courseId = context.courseId;
      queryParams.milestoneId = context.get('milestoneId');
      queryParams.unitId = context.get('unitId');
      queryParams.lessonId = context.lessonId;
      queryParams.collectionId = suggestion.get('id');
      queryParams.pathId = suggestion.pathId;
      queryParams.subtype =
        suggestion.subType === 'signature_collection'
          ? 'signature-collection'
          : 'signature-assessment';
      queryParams.pathType = 'system';
      queryParams.ctxPathType = suggestion.ctxPathType;
      queryParams.ctxPathId = suggestion.ctxPathId;
    } else {
      queryParams.type = context.itemType || null; //Type is important to decide whether next item is external or normal
      queryParams.pathId = context.pathId || 0;
      queryParams.pathType = context.pathType || null;
      queryParams.collectionId = context.collectionId;
      queryParams.ctxPathId = context.ctxPathId || 0;
      queryParams.ctxPathType = context.ctxPathType || null;
    }
    this.set('isShowActivityFeedback', false);
    if (this.get('isDiagnosticPlayer')) {
      this.setProperties({ ...queryParams });
      this.send('onRefreshModel');
    }
    this.transitionToRoute('study-player', context.get('courseId'), {
      queryParams
    });
  }
});
