import Ember from 'ember';
import Class from 'gooru-web/models/content/class';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Class service API SDK
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  /**
   * @property {Service} session service
   */
  session: Ember.inject.service('session'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyProvider: Ember.inject.service('api-sdk/taxonomy'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-create-subject-card'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    createClass: function() {
      const component = this;
      const newClass = this.get('newClass');
      newClass.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          if (
            component.get('taxonomyGrades') &&
            component.get('taxonomyGrades').length > 0
          ) {
            component.set('isSelectGrade', true);
          } else {
            component.fetchTaxonomyGrades();
          }
        }
        component.set('didValidate', true);
      });
    },

    selectGrade: function(grade) {
      this.set('selectedGrade', grade);
    },

    cancel: function() {
      this.set('isSelectGrade', false);
    },

    createSubjectClass: function() {
      let component = this;
      let selectedSubject = component.get('subject.subjectCode');
      let courses = component.get('subject.courses');
      let selectedFramework = component.get('subject.fwCode');
      let newClass = component.get('newClass');
      component
        .get('classService')
        .createClass(newClass)
        .then(newClass => {
          if (selectedSubject) {
            const preferenceSettings = {
              subject: selectedSubject,
              framework: selectedFramework ? selectedFramework : null
            };
            component
              .get('classService')
              .updatePreference(newClass.id, preferenceSettings)
              .then(() => {
                let selectedGrade = component.get('selectedGrade');
                let lowerGrade = component.get('taxonomyGrades').get(0);
                if (selectedGrade) {
                  const settings = {
                    grade_lower_bound: lowerGrade.id,
                    grade_current: component.get('selectedGrade.id'),
                    force_calculate_ilp: true,
                    preference: preferenceSettings
                  };
                  component
                    .get('classService')
                    .classSettings(newClass.id, settings)
                    .then(() => {
                      const courseId = component.getCourseId(courses);

                      if (courseId) {
                        component
                          .get('classService')
                          .associateCourseToClass(courseId, newClass.id)
                          .then(() => {
                            component.gotoClassSettings(newClass);
                          });
                      } else {
                        component.gotoClassSettings(newClass);
                      }
                    });
                } else {
                  component.gotoClassSettings(newClass);
                }
              });
          } else {
            component.gotoClassSettings(newClass);
          }
        });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var newClass = Class.create(Ember.getOwner(this).ownerInjection(), {
      title: null,
      classSharing: 'open'
    });
    this.set('newClass', newClass);
  },

  didRender() {
    const component = this;
    component.$().on('keyup', '.modal-body', function(e) {
      var keyCode = event.keyCode ? event.keyCode : event.which;
      if (keyCode === 13) {
        $(e.target)
          .blur()
          .focus();
        component.$('.get-started-btn').trigger('click');
      }
    });

    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Class} class
   */
  newClass: null,

  /**
   * @property {String} action to send up after creating the class to
   * refresh the list of classes in the top header
   */
  updateUserClasses: null,

  /**
   * @type {String} open or restricted, tells the component which radio is checked.
   */
  currentClassSharing: Ember.computed.alias('newClass.classSharing'),

  /**
   * Indicate if it's waiting for join class callback
   */
  isLoading: false,

  /**
   * Checking is demo account
   */
  isGuestAccount: Ember.computed.alias('session.isGuest'),

  /**
   * @property {Boolean} cardBackgroundImage
   * Property help to maintain card images
   */
  cardBackgroundImage: Ember.computed('subject', function() {
    const appRootPath = this.get('appRootPath');
    let randomNumber = parseInt(Math.random() * 3, 0);
    let thumbnailImage =
      appRootPath + DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`];
    return thumbnailImage;
  }),

  isSelectGrade: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTaxonomyGrades
   * Method to fetch taxonomy grades
   */
  fetchTaxonomyGrades() {
    let component = this;
    let taxonomyService = component.get('taxonomyProvider');
    let subjectCode = component.get('subject.subjectCode');
    let filters = {
      subject: subjectCode,
      fw_code: component.get('subject.fwCode')
    };
    if (subjectCode) {
      return Ember.RSVP.hash({
        taxonomyGrades: taxonomyService.fetchGradesBySubject(filters)
      }).then(({ taxonomyGrades }) => {
        if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
          component.set('isSelectGrade', true);
          component.set('taxonomyGrades', taxonomyGrades.sortBy('sequence'));
        }
      });
    }
  },

  // Method help to go class activities page
  gotoClassActivity(newClass) {
    this.get('router').transitionTo(
      'teacher.class.class-activities',
      newClass.id
    );
  },

  gotoClassSettings(newClass) {
    let component = this;
    component
      .get('router')
      .transitionTo('teacher.class.class-management', newClass.id);
  },

  getCourseId(courses) {
    let component = this;
    let course = Object.entries(courses).find(
      key => key[0] === component.get('selectedGrade.id').toString()
    );
    if (course) {
      return course[1];
    }
  }
});
