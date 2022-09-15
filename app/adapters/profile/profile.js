import Ember from 'ember';
import { DEFAULT_PAGE_SIZE } from 'gooru-web/config/config';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

/**
 * Adapter to support the Profile CRUD operations in the API 3.0
 *
 * @typedef {Object} ProfileAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/profiles',

  namespaceV2: '/api/nucleus/v2/profiles',

  usersNamespace: '/api/nucleus-auth/v1/users',

  authNamespace: '/api/nucleus-auth/v2',

  consentNamespace: '/api/nucleus/v2',

  guardianNamespace: '/api/guardian/v1/nav-users',

  userNamespace: '/api/nucleus-auth/v1/user',

  profileNameSpace: '/api/nucleus/v2/profiles',

  translationNameSpace: '/api/nucleus/v2/lookups',

  /**
   * Posts a request to the API to create a new user account
   *
   * @param data user data to be sent in the request body
   * @returns {Promise}
   */
  createProfile: function(data) {
    const adapter = this;
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const namespace = this.get('authNamespace');
    const url = `${endpointUrl}${namespace}/signup`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Updates the current user Profile data
   *
   * @param data the request body data
   * @returns {Promise}
   */
  updateMyProfile: function(data) {
    const adapter = this;
    const namespace = adapter.get('authNamespace');
    const url = `${namespace}/users`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the profile information of a given user id
   *
   * @param userId the unique profile user id
   * @returns {Promise}
   */
  readUserProfileByUsername: function(text) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/user/search?text=${text}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Follows a user profile
   * @param userId
   * @returns {*|Promise}
   */
  followUserProfile: function(userId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/follow`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        user_id: userId
      })
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Unfollows a user profile
   * @param userId
   * @returns {*|Promise}
   */
  unfollowUserProfile: function(userId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/unfollow`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Gets resources by user id
   *
   * @param {string} userId
   * @returns {Promise}
   */
  readResources: function(userId, params = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/resources`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    var data = {
      limit: pageSize,
      offset: offset
    };
    if (params.searchText) {
      data.searchText = params.searchText;
    }
    if (params.sortOn) {
      data.sortOn = params.sortOn;
    }
    if (params.order) {
      data.order = params.order;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets questions by user id
   *
   * @param {string} userId
   * @param {*} params
   * @returns {Promise}
   */
  readQuestions: function(userId, params = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/questions`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    var data = {
      limit: pageSize,
      offset: offset
    };
    if (params.searchText) {
      data.searchText = params.searchText;
    }
    if (params.sortOn) {
      data.sortOn = params.sortOn;
    }
    if (params.order) {
      data.order = params.order;
    }

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets collections by user id
   *
   * @param {string} userId
   * @param {*} params
   * @returns {Promise}
   */
  readCollections: function(userId, params = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/collections`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    var data = {
      limit: pageSize,
      offset: offset
    };
    if (params.filterBy) {
      data.filterBy = params.filterBy;
    }
    if (params.searchText) {
      data.searchText = params.searchText;
    }
    if (params.sortOn) {
      data.sortOn = params.sortOn;
    }
    if (params.order) {
      data.order = params.order;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets assessments by user id
   *
   * @param {string} userId
   * @param {*} params
   * @returns {Promise}
   */
  readAssessments: function(userId, params = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/assessments`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    var data = {
      limit: pageSize,
      offset: offset
    };
    if (params.filterBy) {
      data.filterBy = params.filterBy;
    }
    if (params.searchText) {
      data.searchText = params.searchText;
    }
    if (params.sortOn) {
      data.sortOn = params.sortOn;
    }
    if (params.order) {
      data.order = params.order;
    }
    if (params.diagnosticAssessment) {
      data.diagnosticAssessment = params.diagnosticAssessment;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Gets Rubrics by user id
   *
   * @param {string} userId
   * @param {*} params
   * @returns {Promise}
   */
  readRubrics: function(userId, params = {}) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/${userId}/rubrics`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    var data = {
      limit: pageSize,
      offset: offset
    };
    if (params.filterBy) {
      data.filterBy = params.filterBy;
    }
    if (params.searchText) {
      data.searchText = params.searchText;
    }
    if (params.sortOn) {
      data.sortOn = params.sortOn;
    }
    if (params.order) {
      data.order = params.order;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets Rubrics by user id
   *
   * @param {string} userId
   * @param {*} params
   * @returns {Promise}
   */
  readOfflineActivities(userId, params = {}) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/${userId}/offline-activities`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    var data = {
      limit: pageSize,
      offset: offset
    };
    if (params.filterBy) {
      data.filterBy = params.filterBy;
    }
    if (params.searchText) {
      data.searchText = params.searchText;
    }
    if (params.sortOn) {
      data.sortOn = params.sortOn;
    }
    if (params.order) {
      data.order = params.order;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Start the forgot password workflow
   * @param username
   * @returns {*|Promise}
   */
  forgotPassword: function(email) {
    const adapter = this;
    const namespace = adapter.get('authNamespace');
    const tenantId = this.get('session.tenantId');
    const url = `${namespace}/users/reset-password`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        email: email,
        tenant_id: tenantId
      })
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Resets the user password
   * @param token
   * @returns {*|Promise}
   */
  resetPassword: function(password, token) {
    const adapter = this;
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const namespace = adapter.get('authNamespace');
    const url = `${endpointUrl}${namespace}/users/reset-password`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        token,
        password: password
      })
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Changes the user password
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Ember.RSVP.Promise}
   */
  changePassword: function(oldPassword, newPassword) {
    const adapter = this;
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const namespace = adapter.get('authNamespace');
    const url = `${endpointUrl}${namespace}/users/change-password`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      })
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Gets network by user id
   *
   * @param {string} userId
   * @param {string} type - followers or following
   * @returns {Promise}
   */
  readNetwork: function(userId, type) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/network`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        details: type
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get basic Profile data for a list of profile IDs
   *
   * @param profileIds the list of profile IDs
   * @returns {Promise}
   */
  readMultipleProfiles: function(profileIds) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/search`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        userids: Ember.isArray(profileIds) ? profileIds.join() : null
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get  Profile preference for current profile
   *  @returns {Promise}
   *  @yields { preference_settings: {"standard_preference": {"K12.MA": "TEKS"}   } }
   *  @example http://nile-dev.gooru.org/api/nucleus/v2/profiles/preference
   */
  getProfilePreference: function() {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/preference`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update Profile preference for current profile
   *  @returns {Promise}
   *  @payload {"standard_preference": {"K12.MA": "TEKS"}   }
   *  @example http://nile-dev.gooru.org/api/nucleus/v2/profiles/preference
   */
  updateProfilePreference: function(data) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/preference`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updateConsentPreference
   * @param {Object} data
   * @return {Promise}
   * Method to update consent preference
   */
  updateConsentPreference: function(data) {
    const adapter = this;
    const namespace = adapter.get('consentNamespace');
    const url = `${namespace}/classes/consent`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updateShareData
   * @param {Object} data {String} classId
   * @return {Promise}
   * Method to update share data
   */
  updateShareData: function(data, classId) {
    const adapter = this;
    const namespace = adapter.get('consentNamespace');
    const url = `${namespace}/classes/consent?classIds=${classId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function searchUserProfiles
   * @param {Object} searchCriteria
   * @return {Promise}
   * Method to do partial search like fetching users based on partial matching user context
   */
  searchUserProfiles(searchCriteria) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/search`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        partial: true
      }
    };
    options.data = Object.assign(options.data, searchCriteria);
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  },

  loadScript: function(lang) {
    const adapter = this;
    const namespace = adapter.get('translationNameSpace');
    let url = `${namespace}/translation/labels`;
    if (lang && lang !== 'null' && lang !== null) {
      url += `?language=${lang}`;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  loadScripts: function(lang, subjectCode, readingLevel) {
    const adapter = this;
    const namespace = adapter.get('translationNameSpace');
    let url = `${namespace}/translation/labels`;
    if (subjectCode && subjectCode !== 'null' && subjectCode !== null) {
      url += `?subject_classification_code=${subjectCode}&language=${lang}`;
    }
    if (readingLevel) {
      url += `&reading_level=${readingLevel}`;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Posts a request API send to email for verification
   *@param {String} email
   *@param token
   *@returns {Promise}
   */
  sendMailVerify: function(email, token) {
    const adapter = this;
    const namespace = adapter.get('usersNamespace');
    const url = `${namespace}/send-email-verify`;
    const options = {
      type: 'POST',
      dataType: 'text',
      contentType: 'application/json; charset=utf-8',
      headers: {
        Authorization: `Token ${token}`
      },
      data: JSON.stringify({
        email
      })
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Update email verification
   * @param token
   * @returns {*|Promise}
   */
  updateMailVerify: function(token) {
    const adapter = this;
    const namespace = adapter.get('usersNamespace');
    const url = `${namespace}/email-verify`;
    const options = {
      type: 'PUT',
      dataType: 'text',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        token
      })
    };
    return Ember.$.ajax(url, options);
  },

  teacherImpersonation: function(userId, classId) {
    const adapter = this;
    let authNamespace = this.get('authNamespace');
    const url = `${authNamespace}/users/impersonate`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        user_id: userId,
        class_id: classId
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Delete a user profile
   * @returns {*|Promise}
   */
  deleteUserProfile: function() {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the guardian role
   *
   * @returns {Promise}
   */
  getGuardianRoles: function() {
    const adapter = this;
    const namespace = adapter.get('guardianNamespace');
    const url = `${namespace}/relationships`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Posts a request to the API to invite a new guardian
   *
   * @param data guardian data to be sent in the request body
   * @returns {Promise}
   */
  inviteGuardian: function(userId, data) {
    const adapter = this;
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const namespace = this.get('guardianNamespace');
    const url = `${endpointUrl}${namespace}/users/${userId}/guardians`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the guardian list
   *
   * @returns {Promise}
   */
  getGuardianList: function() {
    const adapter = this;
    const namespace = adapter.get('guardianNamespace');
    const url = `${namespace}/list/guardians`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Accept the guardian invite request
   * @param guardianId
   * @returns {Promise}
   */
  acceptGuardianRequest: function(guardianId) {
    const adapter = this;
    const namespace = adapter.get('guardianNamespace');
    const url = `${namespace}/accept/guardians`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        guardianId: guardianId
      })
    };
    return Ember.$.ajax(url, options);
  },
  mergeUserProfile: function(userId) {
    const adapter = this;
    const userNamespace = adapter.get('userNamespace');
    const url = `${userNamespace}/verify/init`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        user_ids: userId
      })
    };
    return Ember.$.ajax(url, options);
  },
  consolidateProfile: function(requestParams) {
    const adapter = this;
    const profileNameSpace = adapter.get('profileNameSpace');
    const url = `${profileNameSpace}/user/identities`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: requestParams
    };
    return Ember.$.ajax(url, options);
  },
  resendEmail: function(userId) {
    const adapter = this;
    const userNamespace = adapter.get('userNamespace');
    const url = `${userNamespace}/verify/email/resend`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        user_id: userId
      })
    };
    return Ember.$.ajax(url, options);
  },

  cancelRequest: function(userId) {
    const adapter = this;
    const profileNameSpace = adapter.get('profileNameSpace');
    const url = `${profileNameSpace}/user/universal-profile/cancel`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        user_id: userId,
        mode: 'profile'
      })
    };
    return Ember.$.ajax(url, options);
  },

  verifyCode: function(queryParams) {
    const adapter = this;
    const userNamespace = adapter.get('userNamespace');
    const url = `${userNamespace}/verify?mode=${queryParams.mode}&code=${queryParams.code}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Accept the guardian invite request
   * @param token
   * @returns {Promise}
   */
  approveGuardianInvitees: function(token) {
    const adapter = this;
    const namespace = adapter.get('guardianNamespace');
    const url = `${namespace}/guardians/approve`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        token
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get particular guardian information
   * @param id
   * @returns {Promise}
   */
  getGuardianInformation: function(id) {
    const adapter = this;
    const namespace = adapter.get('guardianNamespace');
    const url = `${namespace}/guardians/details?guardianId=${id}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * get whats new status
   * @param id
   * @returns {Promise}
   */
  getWhatsNewStatus: function(appId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/app-state?app_id=${appId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update whats new status
   * @param token
   * @returns {*|Promise}
   */
  updateWhatsNewStatus: function(appId, status) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/app-state?app_id=${appId}`;
    const options = {
      type: 'PUT',
      dataType: 'text',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        is_whats_new_visited: status
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Changes the user password
   * @param {string} newPassword
   * @returns {Ember.RSVP.Promise}
   */
  forceChangePassword: function(newPassword) {
    const adapter = this;
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const namespace = adapter.get('authNamespace');
    const url = `${endpointUrl}${namespace}/users/change-password`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        new_password: newPassword
      })
    };

    return Ember.$.ajax(url, options);
  }
});
