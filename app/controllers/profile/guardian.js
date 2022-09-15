import Ember from 'ember';
import guardianInviteValidations from 'gooru-web/validations/guardian-invite';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Controller.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  parentController: Ember.inject.controller('profile'),

  profileService: Ember.inject.service('api-sdk/profile'),

  session: Ember.inject.service('session'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  isGuestAccount: Ember.computed.alias('session.isGuest'),

  // -------------------------------------------------------------------------
  // Properties

  showInviteGuardian: false,

  didValidate: false,

  /**
   * showRoleErrorMessage
   * @property {Boolean}
   */
  showRoleErrorMessage: false,

  userProfile: Ember.computed('appRootPath', function() {
    return this.get('appRootPath') + DEFAULT_IMAGES.USER_PROFILE;
  }),

  /**
   * @property {userId}
   * @returns {string}
   */
  userId: Ember.computed('profile', 'session', function() {
    return this.get('profile.id') || this.get('session.userId');
  }),
  isShowImpersonate: Ember.computed(function() {
    let impersonate;
    if (window.frameElement) {
      impersonate = window.parent.impersonate;
    }
    return impersonate;
  }),

  /**
   * A link to the parent profile controller
   * @see controllers/profile.js
   * @property {Class}
   */
  profile: Ember.computed.reads('parentController.profile'),

  /**
   * @type {String} Error with email field
   */
  emailError: false,

  /**
   * @type {guardianInfo} guardianInfo
   */
  guardianInfo: null,

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    let information = this.getGuardianInformation();
    this.set('guardianInfo', information);
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    showInviteGuardian: function(show) {
      if (show) {
        this.set('showInviteGuardianFlag', true);
      } else {
        this.set('showInviteGuardianFlag', false);
      }
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.ACCESS_LEARNING_DATA
      );
    },

    roleSelect: function(id) {
      let guardianInfo = this.get('guardianInfo');
      guardianInfo.set('relationshipId', Number(id));
    },

    inviteGuardian: function() {
      const controller = this;
      const information = controller.get('guardianInfo');
      if (controller.get('didValidate') === false) {
        var firstName = Ember.$('.gru-input.firstName input').val(),
          lastName = Ember.$('.gru-input.lastName input').val(),
          email = Ember.$('.gru-input.email input').val();
        information.set('firstName', firstName);
        information.set('lastName', lastName);
        information.set('email', email);
      }
      let relationshipId = information.get('relationshipId');
      let isValid = true;
      let showRoleErrorMessage = false;
      let userId = controller.get('userId');

      if (!relationshipId) {
        showRoleErrorMessage = true;
        isValid = false;
      }
      controller.set('showRoleErrorMessage', showRoleErrorMessage);

      if (isValid) {
        information.validate().then(function({ validations }) {
          if (validations.get('isValid')) {
            controller
              .get('profileService')
              .inviteGuardian(userId, information)
              .then(
                function() {
                  controller.getGuardianList();
                  controller.resetController();
                  controller.set('didValidate', false);
                  controller
                    .get('parseEventService')
                    .postParseEvent(PARSE_EVENTS.INVITE_GUARDIAN);
                },
                function(error) {
                  if (error && error.message) {
                    controller.set('emailError', error.message);
                    controller.keydownEvents();
                  }
                }
              );
          }
        });
      }
    },

    onClosePullUp: function() {
      this.set('showInviteGuardianFlag', false);
      this.resetController();
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLOSE_GUARDIAN_PULLUP
      );
    },

    acceptGuardianRequest: function(guardianInfo) {
      const controller = this;
      let guardianId = Number(guardianInfo.id);
      controller
        .get('profileService')
        .acceptGuardianRequest(guardianId)
        .then(function() {
          controller.getGuardianList();
        });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Method to use create guardian object
   */
  getGuardianInformation: function() {
    let Information = Ember.Object.extend({
        firstName: null,
        lastName: null,
        email: null,
        relationshipId: null
      }),
      extendedInformation = Information.extend(guardianInviteValidations);
    let information = extendedInformation.create(
      Ember.getOwner(this).ownerInjection(),
      {
        firstName: null,
        lastName: null,
        email: null,
        relationshipId: null
      }
    );
    return information;
  },

  /**
   * Method to use get guardians list
   */
  getGuardianList: function() {
    const controller = this;
    controller
      .get('profileService')
      .getGuardianList()
      .then(function(guardianList) {
        controller.set('guardianList', guardianList.guardians);
      });
  },

  /**
   * Add keydown events to clear errors on username and email
   */
  keydownEvents: function() {
    const controller = this;
    var $email = Ember.$('.email input');
    $email.unbind('keydown');
    $email.on('keydown', function() {
      controller.set('emailError', false);
    });
  },

  /**
   * Method to use reset data values
   */
  resetController: function() {
    const controller = this;
    let information = controller.getGuardianInformation();
    controller.set('guardianInfo', information);
    controller.set('showRoleErrorMessage', false);
    controller.set('showInviteGuardianFlag', false);
    controller.set('emailError', false);
  }
});
