import Ember from 'ember';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

/**
 * Profile model with the user account information
 *
 * @typedef {Object} ProfileModel
 */
export default Ember.Object.extend({
  /**
   * @property {string} id - The profile id
   */
  id: null,

  /**
   * @property {string} firstName - The profile first name
   */
  firstName: null,

  /**
   * @property {string} lastName - The profile last name
   */
  lastName: null,

  /**
   * @property {string} username - The profile username
   */
  username: null,

  /**
   * @property {string} code - The profile code
   */
  code: Ember.computed('studentId', function() {
    const studentId = this.get('studentId');
    if (studentId) {
      return studentId;
    } else {
      const uuid = this.get('id').split('-');
      return uuid.length >= 3 ? uuid[3] : uuid;
    }
  }),

  /**
   * @property {string} password  - The profile password
   */
  password: null,

  /**
   * @property {string} email - The profile email
   */
  email: null,
  /**
   * @property {string} gender - Profile gender
   */
  gender: null,

  /**
   * @property {string[]} grades - An arrays of string with the grades of the profile
   */
  grades: [],

  /**
   * @property {date} dateOfBirth - The profile date of birth
   */
  dateOfBirth: null,

  /**
   * @property {string} role - The profile role (teacher, student, etc)
   */
  role: null,

  /**
   * @property {date} createdAt - The profile creation date
   */
  createdAt: null,

  /**
   * @property {date} lastUpdate - The last profile modification date
   */
  lastUpdate: null,

  /**
   * @property {string} countryId - The profile country id
   */
  countryId: null,

  /**
   * @property {string} country - The profile country
   */
  country: null,

  /**
   * @property {string} stateId - The profile state id
   */
  stateId: null,

  /**
   * @property {string} state - The profile state
   */
  state: null,

  /**
   * @property {string} schoolId - The profile school id
   */
  schoolId: null,

  /**
   * @property {string} school - The profile school
   */
  school: null,

  /**
   * @property {string} schoolDistrictId - The profile school district id
   */
  schoolDistrictId: null,

  /**
   * @property {string} schoolDistrict - The profile school district
   */
  schoolDistrict: null,

  /**
   * @property {string} aboutMe - The profile biography
   */
  aboutMe: null,

  /**
   * @property {string} avatarUrl - The avatar image url
   */
  avatarUrl: null,

  /**
   * @property {string} rosterId - Profile roster id
   */
  rosterId: null,

  /**
   * @property {string} displayName
   */
  displayName: Ember.computed('username', 'fullName', function() {
    return this.get('username') ? this.get('username') : this.get('fullName');
  }),

  /**
   * @property {string}
   */
  fullName: Ember.computed('firstName', 'lastName', function() {
    return `${this.get('lastName')}, ${this.get('firstName')}`;
  }),

  /**
   * @property {String} fullName - The user lastname, firstname
   */
  lastFirstName: Ember.computed('firstName', 'lastName', function() {
    const firstName = this.get('firstName');
    const lastName = this.get('lastName');
    return `${lastName}, ${firstName}`.trim();
  }),

  /**
   * @property {string}
   */
  fullNameInformal: Ember.computed('firstName', 'lastName', function() {
    return `${this.get('firstName')} ${this.get('lastName')}`;
  }),

  /**
   * @property {number} followers - The followers count of the profile
   */
  followers: 0,

  /**
   * @property {number} followings - The followings count of the profile
   */
  followings: 0,

  /**
   * @property {boolean} isFollowing - Indicates if current user is following the profile
   */
  isFollowing: false,

  /**
   * @property {object} network - The network information object
   */
  network: null,

  /**
   * @property {string}studentID
   */
  studentId: null,

  /**
   * @property {string} tenant id
   */
  tenantId: null,
  /**
   * @property {boolean} use_learning_data
   */
  use_learning_data: true,
  /**
   * @property {boolean} - Indicates if current user is a student
   */
  isStudent: Ember.computed.equal('role', 'student'),

  /**
   * @property {boolean} - Indicates if current user is a teacher
   */
  isTeacher: Ember.computed.equal('role', 'teacher'),

  /**
   * @property {boolean} - Indicates if current user is a researcher
   */
  isResearcher: Ember.computed(function() {
    const userId = this.get('id');
    let researcher = EndPointsConfig.getResearcher();
    if (
      userId &&
      researcher &&
      researcher.userIds &&
      researcher.userIds.contains(userId)
    ) {
      return true;
    }
    return false;
  }),

  /**
   * @property {boolean} - Indicates if current user is a provider
   */
  isProvider: Ember.computed('isTeacher', 'isStudent', function() {
    return !this.get('isTeacher') && !this.get('isStudent');
  }),

  /**
   * Return a copy of the collection
   *
   * @function
   * @return {Profile}
   */
  copy: function() {
    var properties = this.getProperties(this.modelProperties());
    return this.get('constructor').create(
      Ember.getOwner(this).ownerInjection(),
      properties
    );
  },

  /**
   * Copy a list of property values from another model to override the current ones
   *
   * @function
   * @param {Collection|Assessment} model
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(model, propertyList = []) {
    var properties = model.getProperties(propertyList);
    this.setProperties(properties);
  },
  /**
   * Return a list of properties
   *
   * @function
   * @return {Array}
   */
  modelProperties: function() {
    var properties = [];
    const enumerableKeys = Object.keys(this);
    for (let i = 0; i < enumerableKeys.length; i++) {
      let key = enumerableKeys[i];
      let value = Ember.typeOf(this.get(key));
      if (value === 'string' || value === 'number' || value === 'boolean') {
        properties.push(key);
      }
    }
    return properties;
  },

  /**
   * @property {string} state - The universal profile status
   */
  universalProfileStatus: null,

  googleClassUserId: null,

  enableForcePasswordChange: false
});
