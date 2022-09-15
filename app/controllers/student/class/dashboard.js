import Ember from 'ember';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(tenantSettingsMixin, {
  // ----------------------------------------------------------------------
  // Dependencies

  studentClassController: Ember.inject.controller('student.class'),

  session: Ember.inject.service(),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * Rescope Service to perform rescope data operations
   */
  rescopeService: Ember.inject.service('api-sdk/rescope'),

  // ----------------------------------------------------------------------
  // Properties

  /**
   * A link to the content visibility from class controller
   * @see controllers/class.js
   * @property {ClassContentVisibility}
   */
  contentVisibility: Ember.computed.alias(
    'studentClassController.contentVisibility'
  ),

  playerContent: null,

  isOpenPlayer: false,

  isShowStudentProgressReport: false,

  userId: Ember.computed.alias('session.userId'),

  resetPerformance: false,

  /**
   * @type {Boolean}
   * Property to check whether a class is rescoped
   */
  isPremiumClass: Ember.computed('currentClass', function() {
    let controller = this;
    const currentClass = controller.get('currentClass');
    let setting = currentClass.get('setting');
    return setting ? setting['course.premium'] : false;
  }),

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observer current class
   */
  observeCurrentClass: Ember.observer(
    'currentClass',
    'isPremiumClass',
    function() {
      let controller = this;
      //Initially load rescope data
      if (controller.get('isPremiumClass')) {
        controller.processSkippedContents();
      }
    }
  ),

  // -----------------------------------------------------------------------
  // Hooks
  // ----------------------------------------------------------------------
  // Actions
  actions: {
    playContent(playerUrl, content) {
      const controller = this;
      controller.set('playerUrl', playerUrl);
      controller.set('isOpenPlayer', true);
      controller.set('playerContent', content);
    },

    closePullUp() {
      const component = this;
      component.set('refreshData', true);
      component.set('isOpenPlayer', false);
      component.set('resetPerformance', true);
      component.getUserCurrentLocation();
      component.get('studentClassController').send('reloadData');
    },

    openProgressReport() {
      this.set('isShowStudentProgressReport', true);
    },

    /**
     * Action triggered when the user click an accordion item
     */
    onSelectItem() {
      let controller = this;
      if (controller.get('isPremiumClass')) {
        let skippedContents = controller.get('skippedContents');
        let isSkippedContentsAvailable = skippedContents
          ? controller.isSkippedContentsEmpty(skippedContents)
          : false;
        if (isSkippedContentsAvailable) {
          controller.toggleSkippedContents(skippedContents);
        }
      }
    }
  },

  // ----------------------------------------------------------------------
  // Methods

  /**
   * @function processSkippedContents
   * Method to fetch and process the skipped contents
   */
  processSkippedContents() {
    let controller = this;
    controller.getSkippedContents().then(function(skippedContents) {
      let isContentAvailable = !!skippedContents;
      let isSkippedContentAvailable = skippedContents
        ? controller.isSkippedContentsEmpty(skippedContents)
        : false;
      controller.set('isContentAvailable', isContentAvailable);
      if (isSkippedContentAvailable) {
        controller.set('isChecked', false);
        controller.toggleSkippedContents(skippedContents);
      }
      if (!skippedContents) {
        controller.set('isChecked', true);
      }
    });
  },

  /**
   * @function getSkippedContents
   * Method to get skipped contents
   */
  getSkippedContents() {
    let controller = this;
    let currentClass = controller.get('currentClass');
    let filter = {
      classId: currentClass.get('id'),
      courseId: currentClass.get('courseId')
    };
    let skippedContentsPromise = Ember.RSVP.resolve(
      controller.get('rescopeService').getSkippedContents(filter)
    );
    return Ember.RSVP.hash({
      skippedContents: skippedContentsPromise
    })
      .then(function(hash) {
        controller.set('skippedContents', hash.skippedContents);
        return hash.skippedContents;
      })
      .catch(function() {
        controller.set('skippedContents', null);
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
    let controller = this;
    let skippedUnitContents = controller.get('skippedContents.units');
    let units = controller.get('units');
    let isSkippedAllUnits = units.length === skippedUnitContents.length;
    if (isSkippedAllUnits) {
      let skippedUnits = Ember.A([]);
      skippedUnitContents.map(unitId => {
        let skippedUnit = units.findBy('id', unitId);
        skippedUnits.pushObject(skippedUnit);
      });
      isSkippedAllUnits = units.length === skippedUnits.length;
    } else {
      units.map(unit => {
        skippedUnitContents.map(unitId => {
          let isSkipped = unit.get('id') === unitId;
          unit.set('isSkipped', isSkipped);
        });
      });
    }
    controller.set('isSkippedAllUnits', isSkippedAllUnits);
    let contentTypes = Object.keys(skippedContents);
    let formattedContents = controller.getFormattedContentsByType(
      skippedContents,
      contentTypes
    );
    controller.toggleContentVisibility(formattedContents);
  },

  /**
   * @function getFormattedContentsByType
   * Method to get formatted content type
   */
  getFormattedContentsByType(contents, types) {
    let controller = this;
    let formattedContents = Ember.A([]);
    types.map(type => {
      let flag = type.charAt(0);
      formattedContents = formattedContents.concat(
        controller.parseSkippedContents(contents[`${type}`], flag)
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
      parsedContentIds.push(`.${flag}-${id}`);
    });
    return parsedContentIds;
  },

  /**
   * @function toggleContentVisibility
   * Method to toggle content visibility
   */
  toggleContentVisibility(contentClassnames) {
    let controller = this;
    let isChecked = controller.get('isChecked');
    const $contentComponent = Ember.$(contentClassnames.join());
    if (isChecked) {
      $contentComponent.show().addClass('rescoped-content');
    } else {
      $contentComponent.hide();
    }
  },

  getUserCurrentLocation() {
    const component = this;
    let currentClass = component.get('currentClass');
    let classId = currentClass.get('id');
    let userId = component.get('userId');
    let courseId = component.get('course.id');
    let locationQueryParam = {
      courseId
    };
    if (
      currentClass.milestoneViewApplicable &&
      currentClass.milestoneViewApplicable === true &&
      currentClass.preference &&
      currentClass.preference.framework
    ) {
      locationQueryParam.fwCode = currentClass.preference.framework;
    }

    component
      .get('analyticsService')
      .getUserCurrentLocation(classId, userId, locationQueryParam)
      .then(userLocationObj => {
        component.set('userLocation', userLocationObj);
      });
  }
});
