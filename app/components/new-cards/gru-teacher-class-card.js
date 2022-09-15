import Ember from 'ember';
import { isNumeric } from 'gooru-web/utils/math';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['new-cards gru-teacher-class-cards'],

  classNameBindings: ['isPendingSetup:pending-setup'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    selectItem: function(item) {
      const classData = this.get('class');
      const classId = classData.id;
      let localStorage = window.localStorage;

      const userId = this.get('session.userId');

      let lastAccessedClassIdList = JSON.parse(
        localStorage.getItem(`lastAccessedClassId_${userId}`)
      );

      if (!lastAccessedClassIdList || lastAccessedClassIdList === null) {
        let lastSelectedClassIdList = [];
        lastSelectedClassIdList.push(classId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastSelectedClassIdList)
        );
      } else {
        lastAccessedClassIdList.push(classId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastAccessedClassIdList)
        );
      }

      if (this.get('isPendingSetup')) {
        this.sendAction('onShowCompleteSetup', classData);
      } else if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', item, classId);
      }
    },

    /**
     * Clicking on card panel will take to CA
     */
    launchCA() {
      const classData = this.get('class');
      const classId = classData.id;
      let localStorage = window.localStorage;
      const userId = this.get('session.userId');

      let lastAccessedClassIdList = JSON.parse(
        localStorage.getItem(`lastAccessedClassId_${userId}`)
      );

      if (!lastAccessedClassIdList || lastAccessedClassIdList === null) {
        let lastSelectedClassIdList = [];
        lastSelectedClassIdList.push(classId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastSelectedClassIdList)
        );
      } else {
        lastAccessedClassIdList.push(classId);
        localStorage.setItem(
          `lastAccessedClassId_${userId}`,
          JSON.stringify(lastAccessedClassIdList)
        );
      }

      this.send('selectItem', 'class-activities');
    },

    selectSingleBox: function(item) {
      this.sendAction('selectSingle', item);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  init: function() {
    const component = this;
    component._super(...arguments);
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Class} class information
   */
  class: null,

  /**
   * @property {Course} course information
   */
  course: null,

  isDeepLinks: Ember.computed(function() {
    return this.get('isDeepLink') === 'true';
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class  CM is started or not
   */
  hasCMStarted: Ember.computed('class.performanceSummary', function() {
    const scorePercentage = this.get('class.performanceSummary.score');
    return scorePercentage !== null && isNumeric(scorePercentage);
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class CA is started or not
   */
  hasCAStarted: Ember.computed('class.performanceSummaryForDCA', function() {
    const scorePercentage = this.get(
      'class.performanceSummaryForDCA.scoreInPercentage'
    );
    return scorePercentage !== null && isNumeric(scorePercentage);
  }),

  /**
   * The class is premium
   * @property {String}
   */
  isPremiumClass: Ember.computed('class', function() {
    const controller = this;
    let currentClass = controller.get('class');
    let classSetting = currentClass.get('setting');
    return classSetting ? classSetting['course.premium'] : false;
  }),

  /**
   * @property {Boolean} isPendingSetup
   * Property for to determine the class setup is completed or not
   */
  isPendingSetup: Ember.computed(
    'class.setting',
    'class.isPendingSetup',
    function() {
      const classSetting = this.get('class.setting');
      return classSetting
        ? classSetting['class.setup.complete'] === false
        : false;
    }
  ),

  /**
   * @property {Boolean} cardBackgroundImage
   * Property help to maintain card images
   */
  cardBackgroundImage: Ember.computed('course', function() {
    const appRootPath = this.get('appRootPath');
    const coverImage = this.get('class.coverImage');
    const thumbnail = coverImage ? coverImage : this.get('course.thumbnailUrl');
    let randomNumber = parseInt(Math.random() * 3, 0);
    let thumbnailImage =
      appRootPath + DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`];
    if (thumbnail) {
      thumbnailImage =
        thumbnail === `/${DEFAULT_IMAGES.COURSE}`
          ? appRootPath + DEFAULT_IMAGES[`CLASS_DEFAULT_${randomNumber}`]
          : thumbnail;
    }
    return thumbnailImage;
  })
});
