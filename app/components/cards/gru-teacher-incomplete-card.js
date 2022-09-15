import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  /**
   * Question of this FRQ grade item.
   * @type {Object}
   */
  class: Ember.computed.alias('incompleteClass'),

  /**
   * class dependency injection
   * @requires service:api-sdk/class
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {JSON}
   * Property to store last accessed class data
   */
  course: null,

  /**
   * @property {Boolean}
   * property to checked/unchecked to view part
   */
  checked: false,

  /**
   * @property {Boolean} isBottomPanelExpanded
   * Property to check whether the bottom panel is in expanded state or not
   */
  isBottomPanelExpanded: false,

  /**
   * @property {Array} levelsList Holding level names
   */

  /**
   * Dynamic random images for thumbnail
   */
  DynamicImage: [
    'assets/gooru/bg-image.png',
    'assets/gooru/bg-image1.png',
    'assets/gooru/bg-image2.png',
    'assets/gooru/bg-image3.png',
    'assets/gooru/bg-image4.png'
  ],

  didInsertElement() {
    this.get('incompleteClass.rosterData').map(data => {
      this.set('lower_roster_grade', data.lower_roster_grade);
      if (data.subjects) {
        data.subjects.map(gradeData => {
          if (gradeData) {
            this.set('gradename', gradeData.grade_name);
            this.set('fw_code', gradeData.fw_code);
            this.set('code', gradeData.code);
            this.set('label', gradeData.label);
            this.set('subjects', gradeData);
            this.set('grade_id', gradeData.grade_id);
          }
        });
      }
    });
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when subject option clicked
     */
    handleClick() {
      this.set('checked', !this.get('checked'));
      this.toggleProperty('isBottomPanelExpanded');
    },

    /**
     * Action triggered when delete classroom option clicked
     */
    deleteClick() {
      this.toggleProperty('isBottomPanelExpanded');
    },

    updatePerference(classId, subject, framework) {
      let selectedGrade = this.get('grade_id');
      if (selectedGrade) {
        const classData = {
          grade_id: selectedGrade,
          fw: framework,
          subject: subject,
          class_id: classId
        };
        let classDataArr = Ember.A([]);
        classDataArr.push(classData);
        const data = {
          data: classDataArr
        };
        this.get('classService')
          .triggerAutoClassSetup(data)
          .then(() => {
            this.sendAction('onDeleteClass', this.get('class'));
          });
      }
    },

    /*** Triggered when a delete class option is selected */
    deleteClasses: function() {
      let controller = this;
      let classId = controller.get('class.id');
      controller.get('classService').deleteClass(classId);
      const context = {
        classId: controller.get('class.id')
      };
      controller.sendAction('onDeleteClass', controller.get('class'));
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.DELETE_CLASS_ROOM,
        context
      );
    }
  },

  /**
   * @property {Boolean} cardBackgroundImage
   * Property help to maintain card images
   */
  cardBackgroundImage: Ember.computed('course', function() {
    const RandomImgArray = this.get('DynamicImage');
    const appRootPath = this.get('appRootPath');
    const coverImage = this.get('class.coverImage');
    const thumbnail = coverImage ? coverImage : this.get('course.thumbnailUrl');
    const item = Math.floor(Math.random() * RandomImgArray.length);
    let thumbnailImage = appRootPath + RandomImgArray[item];
    if (thumbnail) {
      thumbnailImage =
        thumbnail === `/${DEFAULT_IMAGES.COURSE}`
          ? appRootPath + RandomImgArray[item]
          : thumbnail;
    }
    return thumbnailImage;
  })
});
