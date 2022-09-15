import Ember from 'ember';
import { getSubjectIdFromSubjectBucket } from 'gooru-web/utils/utils';
import { CLASS_SKYLINE_INITIAL_DESTINATION } from 'gooru-web/config/config';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Route.extend(UIHelperMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  /**
   * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
   */
  featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

  /**
   * The session service.
   * @property session
   * @readOnly
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Subject associated with the course
   * @type {String}
   */
  subject: Ember.computed.alias('course.subject'),

  /**
   * Extract subject code from subject
   * @return {String}
   */
  subjectCode: Ember.computed('subject', function() {
    if (this.get('subject')) {
      return getSubjectIdFromSubjectBucket(this.get('subject'));
    }
  }),

  /**
   * Property used to identify destination.
   * @type {String}
   */
  destination: Ember.computed.alias('skylineInitialState.destination'),

  // -------------------------------------------------------------------------
  // Methods

  beforeModel(transition) {
    const route = this;
    const queryParams = transition.queryParams;
    let defaultGradeLevel =
      queryParams.defaultGradeLevel && queryParams.defaultGradeLevel !== 'null'
        ? queryParams.defaultGradeLevel
        : null;

    route.set('defaultGradeLevel', defaultGradeLevel);
    const currentClass = route.modelFor('student.class').class;
    let userId = route.get('session.userId');
    let memberGradeBounds = currentClass.get('memberGradeBounds');
    let memberGradebound = memberGradeBounds.findBy(userId);
    let studentGradeBound = Ember.Object.create(memberGradebound.get(userId));

    if (
      !currentClass.get('isPublic') ||
      (currentClass.get('isPublic') &&
        studentGradeBound.get('grade_lower_bound') &&
        studentGradeBound.get('grade_upper_bound'))
    ) {
      const classId = currentClass.get('id');
      const skylineInitialState = route.modelFor('student.class')
        .skylineInitialState;
      return route
        .get('skylineInitialService')
        .fetchState(classId)
        .then(skylineInitialStateRes => {
          skylineInitialState.set(
            'destination',
            skylineInitialStateRes.get('destination')
          );
          skylineInitialState.set(
            'context',
            skylineInitialStateRes.get('context')
          );
          route.set('skylineInitialState', skylineInitialState);
          let destination = skylineInitialState.get('destination');
          if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
            return route.transitionTo('student.class.course-map');
          } else if (
            destination ===
            CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete
          ) {
            return route.transitionTo('student.class.setup-in-complete');
          } else if (
            destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
          ) {
            return route.transitionTo('student.class.diagnosis-of-knowledge');
          }
        });
    }
  },

  model(params) {
    const route = this;
    const currentClass = route.modelFor('student.class').class;
    const navigatorSubProgram = route.modelFor('student.class')
      .navigatorSubProgram;
    const subProgramId = route.modelFor('student.class').subProgramId;

    const contentVisibility = route.modelFor('student.class').contentVisibility;
    route.setTitle('Proficiency', currentClass.title);
    const course = route.modelFor('student.class').course;
    const tenantSetting = route.modelFor('student.class').tenantSetting;
    route.set('course', course);
    const subjectCode = route.get('subjectCode');

    const taxonomyService = route.get('taxonomyService');
    const fwCode = currentClass.get('preference.framework');
    const featuredCourseService = route.get('featuredCourseService');
    const filters = {
      subject: currentClass.get('preference.subject')
    };
    let userId = route.get('session.userId');
    if (fwCode) {
      if (
        tenantSetting &&
        tenantSetting.tx_fw_prefs &&
        currentClass.get('isPublic') &&
        route.get('isEnableNavigatorPrograms')
      ) {
        let isFound = tenantSetting.tx_fw_prefs[subjectCode];
        filters.fw_code = isFound ? isFound.default_fw_id : fwCode;
      } else {
        filters.fw_code = fwCode;
      }
    }

    return Ember.RSVP.hash({
      course: course,
      taxonomyGrades: taxonomyService.fetchGradesBySubject(filters),
      subject: route.get('taxonomyService').fetchSubject(subjectCode),
      class: currentClass,
      tenantSetting: tenantSetting,
      independentCourses: currentClass.get('isPublic')
        ? featuredCourseService.getIndependentCourseList({
          filterOutJoinedCourses: false
        })
        : Ember.A([]),
      proficiencyType:
        currentClass.get('isPublic') && params ? params.proficiencyType : null,
      contentVisibility,
      profileDetails: this.get('profileService').readMultipleProfiles([userId]),
      navigatorSubProgram: navigatorSubProgram,
      subProgramId: subProgramId
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController(controller, model) {
    controller.set('class', model.class);
    controller.set('course', model.course);
    controller.set('subject', model.subject);
    let skylineInitialState = this.get('skylineInitialState');
    controller.set('skylineInitialState', skylineInitialState);
    controller.set('independentCourses', model.independentCourses);
    controller.set('tenantSetting', model.tenantSetting);
    controller.set('proficiencyType', model.proficiencyType);
    let defaultGradeLevel = this.get('defaultGradeLevel');
    controller.set('defaultGradeLevel', defaultGradeLevel);
    let taxonomyGrades = model.taxonomyGrades;
    if (taxonomyGrades) {
      controller.set(
        'taxonomyGrades',
        taxonomyGrades.sortBy('sequence').reverse()
      );
    }
    if (model.navigatorSubProgram) {
      let activeSubPrograme = model.navigatorSubProgram.find(
        item => item.id === parseInt(model.subProgramId, 0)
      );
      controller.set('activeSubPrograme', activeSubPrograme);
    }
    controller.set('contentVisibility', model.contentVisibility);
    controller.set('profileDetails', model.profileDetails);
    controller.initialize();
  },

  /**
   * Method will take cares of reset properties values on destroy
   * @param {Controller} controller
   */
  resetController(controller) {
    let stateCheckInterval = controller.get('stateCheckInterval');
    if (stateCheckInterval) {
      Ember.run.cancel(stateCheckInterval);
    }
  }
});
