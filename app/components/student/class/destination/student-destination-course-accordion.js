import Ember from 'ember';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-destination-course-accordion'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * Session service to retrieve session content
   */
  session: Ember.inject.service('session'),

  /**
   * Unit service
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * Lesson service
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * Rescope Service to perform rescope data operations
   */
  rescopeService: Ember.inject.service('api-sdk/rescope'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    if (component.get('isRoute0')) {
      component.getSkippedContents();
    }
  },

  didRender() {
    let component = this;
    if (component.get('isRoute0')) {
      component.processSkippedContents();
    }
  },

  // -------------------------------------------------------------------------
  // Observers

  rescopeObserver: Ember.observer('skippedContents', function() {
    let component = this;
    component.processSkippedContents();
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when select an unit
     */
    onSelectUnit(selectedUnit) {
      let component = this;
      let isUnitHasChildren = selectedUnit.get('children').length > 0;
      if (!isUnitHasChildren) {
        component.loadUnitData(selectedUnit);
      }
      component.toggleAccordion('u', selectedUnit.id);
    },

    /**
     * Action triggered when select a lesson
     */
    onSelectLesson(selectedUnit, selectedLesson) {
      let component = this;
      let isLessonHasChildren = selectedLesson.get('children').length > 0;
      if (!isLessonHasChildren) {
        component.loadLessonData(selectedUnit, selectedLesson);
      }
      component.toggleAccordion('l', selectedLesson.id);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} units
   */
  units: Ember.computed('courseData', function() {
    let component = this;
    let courseData = component.get('courseData');
    let units = courseData.get('children');
    units = [...(courseData.unit0Content || []), ...units];
    return units;
  }),

  /**
   * @property {Array} skippedContents
   */
  skippedContents: null,

  /**
   * @property {Boolean} isRoute0
   */
  isRoute0: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadUnitData
   * Method to load unit data
   */
  loadUnitData(unit) {
    let component = this;
    let unitId = unit.get('id');
    let unitService = component.get('unitService');
    let courseId = component.get('courseId');
    return Ember.RSVP.hash({
      unitData: Ember.RSVP.resolve(unitService.fetchById(courseId, unitId))
    }).then(({ unitData }) => {
      unit.set('children', unitData.get('children'));
    });
  },

  /**
   * @function loadLessonData
   * Method to load lesson data
   */
  loadLessonData(unit, lesson) {
    let component = this;
    let lessonId = lesson.get('id');
    let courseId = component.get('courseId');
    let unitId = unit.get('id');
    let lessons = unit.get('children');
    let lessonService = component.get('lessonService');
    return Ember.RSVP.hash({
      lessonData: Ember.RSVP.resolve(
        lessonService.fetchById(courseId, unitId, lessonId)
      )
    }).then(({ lessonData }) => {
      let lessonSeq = lesson.get('sequence');
      lesson.set('children', lessonData.get('children'));
      lessons[lessonSeq - 1] = lesson;
      unit.set('children', lessons);
    });
  },

  /**
   * @function toggleAccordion
   * Method to toggle accordion
   */
  toggleAccordion(type, id) {
    let component = this;
    if (component.$(`#${type}-${id}`).hasClass('collapsed')) {
      component
        .$(`.${type}-container`)
        .removeClass('expanded')
        .addClass('collapsed');
      component
        .$(`#${type}-${id}`)
        .addClass('expanded')
        .removeClass('collapsed');
    } else {
      component
        .$(`#${type}-${id}`)
        .toggleClass('expanded')
        .addClass('collapsed');
    }
  },

  /**
   * @function processSkippedContents
   * Method to hide/show skipped contents
   */
  processSkippedContents() {
    let component = this;
    let skippedContents = component.get('skippedContents');
    let isSkippedContentAvailable = skippedContents
      ? component.isSkippedContentsEmpty(skippedContents)
      : false;
    if (isSkippedContentAvailable) {
      component.toggleSkippedContents(skippedContents);
    }
  },

  /**
   * @function getSkippedContents
   * Method to get skipped contents
   */
  getSkippedContents() {
    let component = this;
    let filters = {
      classId: component.get('classId'),
      courseId: component.get('courseId')
    };
    let skippedContentsPromise = Ember.RSVP.resolve(
      component.get('rescopeService').getSkippedContents(filters)
    );
    return Ember.RSVP.hash({
      skippedContents: skippedContentsPromise
    })
      .then(function(hash) {
        component.set('skippedContents', hash.skippedContents);
        return hash.skippedContents;
      })
      .catch(function() {
        component.set('skippedContents', null);
      });
  },

  /**
   * @function isSkippedContentsEmpty
   * Method to toggle rescoped content visibility
   */
  isSkippedContentsEmpty(skippedContents) {
    let keys = Object.keys(skippedContents);
    let isContentAvailable = false;
    keys.some(key => {
      isContentAvailable = skippedContents[`${key}`].length > 0;
      return isContentAvailable;
    });
    return isContentAvailable;
  },

  /**
   * @function toggleSkippedContents
   * Method to toggle skippedContents
   */
  toggleSkippedContents(skippedContents) {
    let component = this;
    let contentTypes = Object.keys(skippedContents);
    let formattedContents = component.getFormattedContentsByType(
      skippedContents,
      contentTypes
    );
    component.toggleContentVisibility(formattedContents);
  },

  /**
   * @function toggleContentVisibility
   * Method to toggle content visibility
   */
  toggleContentVisibility(contentClassnames) {
    let component = this;
    let isChecked = component.get('isChecked');
    const $contentComponent = Ember.$(contentClassnames.join());
    if (isChecked) {
      $contentComponent.show().addClass('rescoped-content');
    } else {
      $contentComponent.hide();
    }
  },

  /**
   * @function getFormattedContentsByType
   * Method to get formatted content type
   */
  getFormattedContentsByType(contents, types) {
    let component = this;
    let formattedContents = Ember.A([]);
    types.map(type => {
      let flag = type.charAt(0);
      formattedContents = formattedContents.concat(
        component.parseSkippedContents(contents[`${type}`], flag)
      );
    });
    return formattedContents;
  },

  /**
   * @function parseSkippedContents
   * Method to parse fetched rescoped contents
   */
  parseSkippedContents(contentIds, flag) {
    let parsedContentIds = Ember.A([]);
    contentIds.map(id => {
      parsedContentIds.push(`#${flag}-${id}`);
    });
    return parsedContentIds;
  }
});
