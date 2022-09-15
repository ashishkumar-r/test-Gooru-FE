import Ember from 'ember';

/**
 * Adapter to support the Class CRUD operations in the API 3.0
 *
 * @typedef {Object} ClassAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/classes',

  namespaceV2: '/api/nucleus/v2/classes',

  reportNamespace: '/api/nucleus-download-reports/v1',

  demoNamespace: '/api/demo/v1',

  classroomNameSpace: '/api/google-classroom/v1',

  profileNameSpace: '/api/nucleus/v1/profiles',

  shortenerUrlNamespace: '/api/url-shortener/v1',

  sendMailNamespace: '/api/nucleus-utils/v1',

  /**
   * Archive class
   *
   * @param classId Identifier of the class to be archive
   * @returns {Promise}
   */
  archiveClass: function(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/archive`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Posts a new class
   *
   * @param data class data to be sent in the request body
   * @returns {Promise}
   */
  createClass: function(data) {
    const adapter = this;
    const url = adapter.get('namespace');
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
   * Updates an existing class
   *
   * @param data class data to be sent in the request body
   * @returns {Promise}
   */
  updateClass: function(data) {
    const adapter = this;
    const classId = data.classId;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.class)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Updates an existing class
   *
   * @param value class data to be sent in the request body
   * @returns {Promise}
   */
  updateCommunityCollaboration: function(value, classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/community/collaboration/settings`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        enableCommunityCollaboration: value
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes a class by id
   *
   * @param classId class id to be sent
   * @returns {Promise}
   */
  deleteClass: function(classId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${classId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Remove Student from a specific class
   *
   * @param classId class id to be sent
   * @param userId user id to be deleted
   * @returns {Promise}
   */
  removeStudentFromClass: function(classId, userId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${classId}/members/${userId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Join class
   *
   * @param {string} code class code
   * @returns {Promise}
   */
  joinClass: function(code) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${code}/members`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({}) //empty body is required by the BE
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the list of classes for a user
   * @returns {Promise}
   */
  getMyClasses: function(param) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: param
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the class information of a given class id
   * @param classId the class ID to be read
   * @returns {Promise}
   */
  readClassInfo: function(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get the list of members, invitees, collaborators and owner of the class
   * @param classId the class ID to be read
   * @returns {Promise}
   */
  readClassMembers: function(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/members`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the class content visibility
   * @param classId the class ID to be read
   * @returns {Promise}
   */
  readClassContentVisibility: function(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/courses`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Update content visibility
   * @param []
   * @returns {Promise}
   */
  updateContentVisibility: function(classId, content, type = false) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/courses`;
    let data;
    if (type === 'unit') {
      data = { units: content.units };
    } else if (type === 'lesson') {
      data = { lessons: content.lessons };
    } else if (
      type === 'assessment' ||
      type === 'collection' ||
      type === 'offline-activity'
    ) {
      let contentData;
      if (type === 'assessment') {
        contentData = content.assessments;
      } else if (type === 'collection') {
        contentData = content.collections;
      } else {
        contentData = content.offline_activity;
      }
      data = { assessments: contentData };
    } else {
      data = content;
    }

    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Associates a Course with a Class
   *
   * @param classId the class id
   * @param courseId the course id
   * @returns {Promise}
   */
  associateCourseToClass: function(courseId, classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/courses/${courseId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the class report status for an archived class
   * @param {string} classId the class id
   * @param {string} courseId the course id
   * @param {string} userId the user id
   * @returns {Promise.<string>} available|queued|in-progress
   */
  readClassReportStatus: function(classId, courseId, userId) {
    const adapter = this;
    const namespace = adapter.get('reportNamespace');
    const sessionToken = encodeURIComponent(this.get('session.token-api3'));
    const url = `${namespace}/class/${classId}/course/${courseId}/download/request?sessionToken=${sessionToken}&userId=${userId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Creates the headers required by API 3.0
   * @returns {{Authorization: string}}
   */
  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  },

  /**
   * apply co-teacher From Class
   * @param classId
   * @param userId the user id to apply owner
   * @returns {Promise}
   */
  applyOwnerSettings: function(classId, collaboratorId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${classId}/owner/transfer`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        user_id: collaboratorId
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Remove co-teacher From Class
   * @param classId
   * @param userId the user id to delete
   * @returns {Promise}
   */
  removeCoTeacherFromClass: function(classId, collaborator) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${classId}/collaborators`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        collaborator: collaborator
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function joinCoTeacherIntoClass
   * Method to join as a co-teacher into a class
   */
  joinCoTeacherIntoClass(classCode) {
    const adapter = this;
    const namespace = this.get('demoNamespace');
    const url = `${namespace}/coteacher`;
    const options = {
      type: 'POST',
      contentType: 'application/json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        code: classCode
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * profileBaseLine class
   * @param classId Identifier of the class to be baseLine
   * @param users Array of profileids which needs to be baselined, a empty array is for whole class
   * @returns {Promise}
   */
  profileBaseLine: function(classId, users) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/profilebaseline`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        users: users ? [users] : []
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Updates class settings
   * @param classId Identifier of the class to update
   * @param settings {"grade_lower_bound" : 1, "grade_upper_bound" : 3, "grade_current" : 2, "route0: true}
   * @returns {Promise}
   */
  classSettings: function(classId, settings) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/settings/reroute`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(settings)
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Updates grade settings, Grade Settings for Student
   * @param classId Identifier of the class to update
   * @param settings {"grade_lower_bound" : 1, "grade_upper_bound" : 3, "grade_current" : 2, "route0: true}
   * @example
   * <pre>PUT /api/nucleus/{version}/classes/{class-id}/members/settings/reroute
   { "grade_lower_bound" : 1, "grade_upper_bound" : 3, "users" : ["68492039-3713-42de-90ad-94d5945cd482", "a71fc3aa-38b4-41bd-b7ef-6be7b509d3d7"] }
   * @returns {Promise}
   */
  classMembersSettings: function(classId, settings) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/members/settings/reroute`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(settings)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Updates grade settings, Grade Settings for Student
   * @param classId Identifier of the class to update
   * @param users {"grade_lower_bound" : 1, "grade_upper_bound" : 3, "grade_current" : 2, "route0: true}
   * @example
   *  PUT /api/nucleus/{version}/classes/{class-id}/members/deactivate
   { "users" : ["68492039-3713-42de-90ad-94d5945cd482", "a71fc3aa-38b4-41bd-b7ef-6be7b509d3d7"] }
   * @returns {Promise}
   */
  classMembersDeactivate: function(classId, users) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/members/deactivate`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(users)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Updates grade settings, Grade Settings for Student
   * @param classId Identifier of the class to update
   * @param users
   * @example
   *  PUT /api/nucleus/{version}/classes/{class-id}/members/activate
   { "users" : ["68492039-3713-42de-90ad-94d5945cd482", "a71fc3aa-38b4-41bd-b7ef-6be7b509d3d7"] }
   * @returns {Promise}
   */
  classMembersActivate: function(classId, users) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/members/activate`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(users)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updatePreference
   * Method to update class preference
   */
  updatePreference(classid, preference) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classid}/preference`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        preference: preference
      })
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * @function updateLanguage
   * Method to update class language
   */
  updateLanguage(classid, language) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classid}/language/${language}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updateProfileBaseline
   * Method to update profile baseline
   */
  updateProfileBaseline(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/profilebaseline/student`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function addStudentsToClass
   * @param {UUID} classId
   * @param {Object} dataParam
   * Method to add students into a class
   */
  addStudentsToClass(classId, dataParam) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/students`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(dataParam)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updateClassSetupFlag
   * @param {UUID} classId
   * @param {Object} setting
   * Method to update class complete setup setting
   */
  updateClassSetupFlag(classId, setting) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(setting)
    };
    return Ember.$.ajax(url, options);
  },

  readBulkClassDetails(classIds = []) {
    const adapter = this;
    const namespace = this.get('namespaceV2');
    const url = `${namespace}/details`;
    const options = {
      type: 'POST',
      contentType: 'application/json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        classIds: classIds
      })
    };
    return Ember.$.ajax(url, options);
  },

  googleClassroomAuth(redirectUrl) {
    const adapter = this;
    const namespace = this.get('classroomNameSpace');
    const url = `${namespace}/auth/google/classroom/authorize`;
    const options = {
      type: 'POST',
      contentType: 'application/json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        redirectUrl: redirectUrl
      })
    };
    return Ember.$.ajax(url, options);
  },

  fetchAccessToken() {
    const namespace = this.get('classroomNameSpace');
    const url = `${namespace}/auth/google/classroom/token`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  fetchClassRoomList() {
    const adapter = this;
    const namespace = this.get('classroomNameSpace');
    const url = `${namespace}/google/classroom/class`;
    const options = {
      type: 'GET',
      contentType: 'application/json',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updateClassRoomList
   * @param {UUID} classId
   * @param {userId} userId
   * @param {googleUserId} googleUserId
   * Method to update class room settings
   */
  updateClassRoomList(classId, listStudent) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/google/classroom/users`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        class_members: listStudent
      })
    };
    return Ember.$.ajax(url, options);
  },

  updateGoogleClassSettings(classId, googleUserId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/google/classroom/settings`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        googleClassroomId: googleUserId
      })
    };
    return Ember.$.ajax(url, options);
  },

  fetchStudentList(googleUserId) {
    const adapter = this;
    const namespace = this.get('classroomNameSpace');
    const url = `${namespace}/google/classroom/class/${googleUserId}/students`;
    const options = {
      type: 'GET',
      contentType: 'application/json',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Delete Google Classroom
   * @returns {Promise}
   */
  deleteGoogleClassroom: function() {
    const adapter = this;
    const namespace = this.get('classroomNameSpace');
    const url = `${namespace}/auth/google/classroom/authorize/revoke`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Triggers auto Class setup
   *
   * @param data class data to be sent in the request body
   * @returns {Promise}
   */
  triggerAutoClassSetup: function(data) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/setup`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getStudentAvailability
   * @param {Object} dataParam
   *  Method to check student available status
   */
  getStudentAvailability(dataParam) {
    const adapter = this;
    const namespace = adapter.get('profileNameSpace');
    const url = `${namespace}/users/details`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(dataParam)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @param data classroom -d data to be sent in the request body
   * @returns {Promise}
   */
  createClassroomAssignments: function(classroomId, data) {
    const adapter = this;
    const namespace = this.get('classroomNameSpace');
    const url = `${namespace}/google/classroom/class/${classroomId}/assignments`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  getShortenerUrl(fullUrl) {
    const adapter = this;
    const namespace = this.get('shortenerUrlNamespace');
    const url = `${namespace}/url`;
    const options = {
      type: 'POST',
      contentType: 'application/json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        url: fullUrl
      })
    };
    return Ember.$.ajax(url, options);
  },

  sendWelcomeMail(params) {
    const adapter = this;
    const namespace = this.get('sendMailNamespace');
    const url = `${namespace}/emails`;
    const options = {
      type: 'POST',
      contentType: 'application/json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        mail_template_name: params.templateName,
        to_addresses: params.emailIds,
        mail_template_context: {
          teacher_name: params.teacherName,
          class_name: params.className,
          class_code: params.classCode,
          signup_url: params.signupURL
        }
      })
    };
    return Ember.$.ajax(url, options);
  }
});
