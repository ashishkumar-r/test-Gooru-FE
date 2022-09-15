import Ember from 'ember';
import { ROLES, KEY_CODES } from 'gooru-web/config/config';
import { isValidEmailId } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-add-collaborator'],

  // -------------------------------------------------------------------------
  // Dependencies
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.inputTypeHandler();
  },

  init() {
    const component = this;
    component._super(...arguments);
    component.set('users', Ember.A([]));
  },

  // -------------------------------------------------------------------------
  // Events
  actions: {
    //Action triggered when remove an user
    onRemoveUser(user) {
      this.get('users').removeObject(user);
    },

    //Action triggered when add collaborators into a class
    onAddCollaborators() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_TEACHER_DONE);
      const selectedUsers = component.get('users');
      const context = {
        classId: selectedUsers.id ? selectedUsers.id : null,
        email: selectedUsers.email ? selectedUsers.email : null
      };
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.ADD_COLLABATOR_CLASS_SETTING,
        context
      );
      component.sendAction('onAddCollaborators', selectedUsers);
      component.set('users', Ember.A([]));
    },

    //Action triggered when click on cancel
    onToggleAddCollaborator() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CS_TEACHER_CANCEL
      );
      this.sendAction('onToggleAddCollaborator');
    },

    //Action triggered when click on tick icon which is next to input box
    onValidateEmail() {
      const component = this;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CS_TEACHER_ADD
      );
      const enteredUserEmail = component.get('userEmail');
      const isEnteredValidEmailId = isValidEmailId(enteredUserEmail);

      if (isEnteredValidEmailId) {
        if (!component.isDuplicate()) {
          component.doValidateTeacherUser(enteredUserEmail);
        } else {
          component.set('isDuplicateEmail', true);
        }
      }
      component.set('inValidEmail', !isEnteredValidEmailId);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  isDuplicate() {
    const component = this;
    let isDuplicate = false;
    const enteredUserEmail = component.get('userEmail');

    const selectedUsers = component.get('users');
    let doesExists = selectedUsers.findBy('email', enteredUserEmail);
    let existsAsOwner = component.get('class').get('owner')
      ? component.get('class').get('owner').email === enteredUserEmail
      : false;
    let collaborator =
      component.get('class').get('collaborators') ||
      component.get('class').get('collaborator');
    let existsAsCoTeacher = collaborator.findBy('email', enteredUserEmail);

    if (
      (!doesExists || (doesExists && doesExists.length === 0)) &&
      (!existsAsOwner || (existsAsOwner && existsAsOwner.length === 0)) &&
      (!existsAsCoTeacher ||
        (existsAsCoTeacher && existsAsCoTeacher.length === 0))
    ) {
      isDuplicate = false;
    } else {
      isDuplicate = true;
    }
    return isDuplicate;
  },

  /**
   * @property {Boolean} isEnableDone
   */
  isEnableDone: Ember.computed('users', 'userEmail', function() {
    const component = this;
    const isAddedUsers = component.get('users.length');
    const enteredUserEmail = component.get('userEmail');
    const enteredValidEmail = enteredUserEmail
      ? isValidEmailId(enteredUserEmail)
      : true;
    return isAddedUsers && enteredValidEmail;
  }),

  /**
   * @property {Array} users
   * Property for list of selected users
   */
  users: Ember.A([]),

  /**
   * @property {Boolean} inValidEmail
   * Property to evaluate whether the entered email id is valid or not
   */
  inValidEmail: false,

  /**
   * @property {Boolean} isDuplicate
   * Property to evaluate whether the entered email id already exits or not
   */
  isDuplicateEmail: false,

  /**
   * @property {String} userEmail
   * Property for entered user email
   */
  userEmail: null,

  /**
   * @property {Boolean} isEnableValidateIcon
   * Property to enable validation icon which is next to input box
   */
  isEnableValidateIcon: Ember.computed('userEmail', function() {
    const component = this;
    const userEmail = component.get('userEmail');
    return userEmail !== null && userEmail !== '';
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function inputTypeHandler
   * Method to handle the input key event
   */
  inputTypeHandler() {
    const component = this;
    component.$('.email-value-container .email-value').keyup(function(event) {
      let userEmail = component.get('userEmail');
      if (event.keyCode === KEY_CODES.ENTER && isValidEmailId(userEmail)) {
        if (!component.isDuplicate()) {
          component.doValidateTeacherUser(userEmail);
        } else {
          component.set('isDuplicateEmail', true);
        }
      } else {
        component.set('inValidEmail', false);
        component.set('isDuplicateEmail', false);
      }
    });
  },

  /**
   * @function doValidateTeacherUser
   * Method to validate whether the entered email id is valid to add as a collaborator or not
   */
  doValidateTeacherUser(userEmail) {
    const component = this;
    let users = component.get('users');
    let userData = users.findBy('email', userEmail) || Ember.Object.create({});
    return Ember.RSVP.hash({
      userDetails: component.fetchMatchingUserProfiles(userEmail)
    }).then(
      ({ userDetails }) => {
        if (userDetails.get('role') === ROLES.TEACHER) {
          userData.set('id', userDetails.get('id'));
          userData.set('firstName', userDetails.get('firstName'));
          userData.set('lastName', userDetails.get('lastName'));
          userData.set('fullName', userDetails.get('fullName'));
          userData.set('avatarUrl', userDetails.get('avatarUrl'));
          userData.set('email', userEmail);
          users.pushObject(userData);
          component.set('inValidEmail', false);
          component.set('isDuplicateEmail', false);
          component.set('userEmail', null);
        } else {
          component.set('inValidEmail', true);
        }
      },
      function() {
        component.set('inValidEmail', true);
      }
    );
  },

  /**
   * @function fetchMatchingUserProfiles
   * Method to fetch user profile details for given emailId
   */
  fetchMatchingUserProfiles(userEmail) {
    const controller = this;
    const profileService = controller.get('profileService');
    return profileService.checkEmailExists(userEmail);
  }
});
