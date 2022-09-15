import Ember from 'ember';
import ClassSerializer from 'gooru-web/serializers/content/class';
import ClassAdapter from 'gooru-web/adapters/content/class';

/**
 * @typedef {Object} ClassService
 */
export default Ember.Service.extend({
  store: Ember.inject.service(),

  session: Ember.inject.service('session'),

  classSerializer: null,

  classAdapter: null,

  classContainer: {},

  classMembersContainer: {},

  init: function() {
    this._super(...arguments);
    this.set(
      'classSerializer',
      ClassSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'classAdapter',
      ClassAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Update existing class
   *
   * @param classId The Class id to archive
   * @returns {Promise}
   */
  archiveClass: function(classId) {
    var service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .archiveClass(classId)
        .then(
          function() {
            resolve(classId);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Creates a new class
   *
   * @param classData object with the class data
   * @returns {Promise}
   */
  createClass: function(classData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedClassData = service
        .get('classSerializer')
        .serializeCreateClass(classData);
      service
        .get('classAdapter')
        .createClass({
          body: serializedClassData
        })
        .then(
          function(responseData, textStatus, request) {
            let classId = request.getResponseHeader('location');
            classData.set('id', classId);
            resolve(classData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Update existing class
   *
   * @param classModel The Class model to update
   * @returns {Promise|Content/Class} Class model updated
   */
  updateClass: function(classModel) {
    var service = this;
    var classData = service
      .get('classSerializer')
      .serializeUpdateClass(classModel);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateClass({
          classId: classModel.get('id'),
          class: classData
        })
        .then(
          function() {
            resolve(classModel);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @param value The community collaboration to update
   * @returns {Promise} community collaboration updated
   */
  updateCommunityCollaboration: function(value, classId) {
    var service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateCommunityCollaboration(value, classId)
        .then(resolve, reject);
    });
  },

  /**
   * Update existing class
   *
   * @param classModel The Class model to update
   * @returns {Promise|Content/Class} Class model updated
   */
  updateClassCoverImage: function(classModel) {
    var service = this;
    var classData = service
      .get('classSerializer')
      .serializeUpdateClassCoverImage(classModel);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateClass({
          classId: classModel.get('id'),
          class: classData
        })
        .then(
          function() {
            resolve(classModel);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Delete class
   *
   * @param classId The class id to delete
   * @returns {Promise}
   */
  deleteClass: function(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .deleteClass(classId)
        .then(resolve, reject);
    });
  },
  /**
   * Remove Student From Class
   * @param classId
   * @param userId the user id to delete
   * @returns {Promise}
   */
  removeStudentFromClass: function(classId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .removeStudentFromClass(classId, userId)
        .then(resolve, reject);
    });
  },

  /**
   * Join class
   *
   * @param {string} code class code
   * @returns {Promise}
   */
  joinClass: function(code) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .joinClass(code)
        .then(
          function(responseData, textStatus, request) {
            let classId = request.getResponseHeader('location');
            resolve(classId);
          },
          function(error) {
            //handling server errors
            const status = error.status;
            if (status === 400) {
              reject({
                status: status,
                code: 'restricted'
              });
            } else if (status === 404) {
              reject({
                status: status,
                code: 'not-found'
              });
            } else {
              reject(error);
            }
          }
        );
    });
  },

  /**
   * Return the list of classes related to a user
   * @property {Profile} profile the owner of classes
   * @returns {RSVP.Promise}
   */
  findMyClasses: function(profile) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var userRole = service.get('session.role');
      let excludeNotstarted = {
        excludeNotStartedPublicClass: true,
        excludeInCompleteClass: true
      };
      if (userRole !== 'student') {
        excludeNotstarted = {};
      }
      service
        .get('classAdapter')
        .getMyClasses(excludeNotstarted)
        .then(
          function(response) {
            var classesModel = service
              .get('classSerializer')
              .normalizeClasses(response);
            if (profile) {
              Ember.$.each(classesModel.get('classes'), function(
                index,
                aClass
              ) {
                //when it has no owner we asume is the provided profile
                if (!aClass.get('owner')) {
                  aClass.set('owner', profile);
                }
              });
              if (profile.get('isTeacher')) {
                classesModel.set(
                  'classes',
                  service.sortClasses(
                    classesModel.get('classes'),
                    classesModel.get('ownerList')
                  )
                );
              } else {
                classesModel.set(
                  'classes',
                  service.sortClasses(
                    classesModel.get('classes'),
                    classesModel.get('memberList')
                  )
                );
              }
            }
            resolve(classesModel);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Reads class information for a specified class ID
   * @param classId the class id to read
   * @returns {Promise}
   */
  readClassInfo: function(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .readClassInfo(classId)
        .then(
          function(response) {
            resolve(
              service.get('classSerializer').normalizeReadClassInfo(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the members, collaborators, invitees and owner for a specified class ID
   * @param classId the class id to read
   * @returns {Promise}
   */
  readClassMembers: function(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .readClassMembers(classId)
        .then(
          function(response) {
            resolve(
              service.get('classSerializer').normalizeReadClassMembers(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets class content visibility
   * @param classId the class id
   * @returns {Promise}
   */
  readClassContentVisibility: function(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .readClassContentVisibility(classId)
        .then(function(response) {
          resolve(
            service
              .get('classSerializer')
              .normalizeReadClassContentVisibility(response)
          );
        }, reject);
    });
  },

  /**
   * Update content visibility
   * @param classId the class id
   * @returns {Promise}
   */
  updateContentVisibility: function(classId, id, visibility, type) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedUpdateContentVisibility;
      if (type) {
        serializedUpdateContentVisibility = service
          .get('classSerializer')
          .serializeUpdateContentVisibility(id, visibility, type);
      } else {
        serializedUpdateContentVisibility = {
          default_visibility_lessons: visibility,
          default_visibility_collections: visibility,
          default_visibility_assessments: visibility
        };
      }

      service
        .get('classAdapter')
        .updateContentVisibility(
          classId,
          serializedUpdateContentVisibility,
          type
        )
        .then(
          function() {
            resolve(serializedUpdateContentVisibility);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the class report status for an archived class
   * @param {string} classId the class id
   * @param {string} courseId the course id
   * @returns {Promise.<string>} available|queued|in-progress
   */
  readClassReportStatus: function(classId, courseId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .readClassReportStatus(classId, courseId, userId)
        .then(
          function(response) {
            resolve(response.status);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Requests a class report
   * @param {string} classId the class id
   * @param {string} courseId the course id
   * @param {string} userId the user id
   * @returns {Promise.<string>} available|queued|in-progress
   */
  requestClassReport: function(classId, courseId, userId) {
    const service = this;
    return service
      .readClassReportStatus(classId, courseId, userId)
      .then(function(response) {
        service.storeClassReportStatus(classId, response);
        return response;
      }); //same end point as reading the status
  },

  /**
   * Save the request report status in storage
   * @param {string} classId the class id
   * @param {string} status status for the class
   */
  storeClassReportStatus: function(classId, status) {
    const localStorage = this.getLocalStorage();
    const userId = this.get('session.userId');
    if (localStorage) {
      const reportInfo = JSON.parse(
        localStorage.getItem('report-info') || '{}'
      );
      const userInfo = reportInfo[userId] || {
        classes: {}
      };
      userInfo.classes[classId] = status;

      reportInfo[userId] = userInfo;
      localStorage.setItem('report-info', JSON.stringify(reportInfo));
    }
  },

  /**
   * Gets the class report status info from storage
   * @param userId
   * @returns { * } { 'abcd-1234' : 'available', 'adfc-1223': 'queued' }
   */
  getReportClassesStatusFromStore: function(userId) {
    const localStorage = this.getLocalStorage();
    if (localStorage) {
      const reportInfo = JSON.parse(
        localStorage.getItem('report-info') || '{}'
      );
      const userInfo = reportInfo[userId] || {
        classes: {}
      };
      return userInfo.classes;
    }
    return null;
  },

  /**
   * Returns the local storage
   * @returns {Storage}
   */
  getLocalStorage: function() {
    return window.localStorage;
  },

  /**
   * Associates a Course with a Class
   *
   * @param classId the class id
   * @param courseId the course id
   * @returns {Promise}
   */
  associateCourseToClass: function(courseId, classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .associateCourseToClass(courseId, classId)
        .then(resolve, function(error) {
          //handling server errors
          const status = error.status;
          if (status === 400) {
            resolve({
              status: status,
              code: 'restricted'
            });
          } else {
            reject(error);
          }
        });
    });
  },

  // TODO These method will be removed once we have full integration with API 3.0

  /**
   * Returns the list of the classes the user is joined (as student).
   * @param {Object} options request options, like limit, offset, etc
   * @returns {Promise.<Class[]>}
   */
  findClassesIJoined: function(options = {}) {
    return this.get('store').query('class/class', {
      isStudent: true,
      limit: options.limit ? options.limit : -1,
      offset: options.offset ? options.offset : 0
    });
  },

  /**
   * Returns the list of classes the user teach (as teacher)
   * @param {Object} options request options, like limit, offset, etc
   * @returns {Promise.<Class[]>}
   */
  findClassesITeach: function(options = {}) {
    return this.get('store').query('class/class', {
      limit: options.limit ? options.limit : -1,
      offset: options.offset ? options.offset : 0,
      'flt.exclude.empty.course': options['flt.exclude.empty.course']
        ? options['flt.exclude.empty.course']
        : false
    });
  },

  /**
   * Returns a class by id
   * @param {string} id
   * @returns {Promise.<Class>}
   */
  findById: function(id) {
    return this.get('store').findRecord('class/class', id);
  },
  /**
   * Returns sorted array of classess
   * @param {[Classes]} classes
   * @param {[String]} orderArray
   * @returns {[Classes]}
   */
  sortClasses: function(classes, orderArray) {
    return classes.sort(function(class1, class2) {
      return orderArray.indexOf(class1.id) - orderArray.indexOf(class2.id);
    });
  },

  /**
   * Remove co-teacher From Class
   * @param classId
   * @param userId the user id to delete
   * @returns {Promise}
   */
  removeCoTeacherFromClass: function(classId, collaborator) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .removeCoTeacherFromClass(classId, collaborator)
        .then(resolve, reject);
    });
  },

  applyOwnerSettings: function(classId, collaboratorId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .applyOwnerSettings(classId, collaboratorId)
        .then(resolve, reject);
    });
  },

  /**
   * @function joinCoTeacherIntoClass
   * Method to join as co-teacher into a class
   */
  joinCoTeacherIntoClass(classCode) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .joinCoTeacherIntoClass(classCode)
        .then(resolve, reject);
    });
  },
  /**
   * @function profileBaseLine
   * Method to baseline users of a class
   */
  profileBaseLine(classCode, users) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .profileBaseLine(classCode, users)
        .then(resolve, reject);
    });
  },
  /**
   * @function classSettings
   * Method to update class settings  users of a class
   */
  classSettings(classid, settings) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .classSettings(classid, settings)
        .then(resolve, reject);
    });
  },
  /**
   * @function classSettings
   * Method to update class members settings  users of a class
   */
  classMembersSettings(classid, settings) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .classMembersSettings(classid, settings)
        .then(resolve, reject);
    });
  },
  /**
   * @function classSettings
   * Method to deactivate class members
   */
  classMembersDeactivate(classid, filter) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .classMembersDeactivate(classid, filter)
        .then(resolve, reject);
    });
  },
  /**
   * @function classSettings
   * Method to activate class members
   */
  classMembersActivate(classid, filter) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .classMembersActivate(classid, filter)
        .then(resolve, reject);
    });
  },

  /**
   * @function updatePreference
   * Method to update class preference
   */
  updatePreference(classid, preference) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updatePreference(classid, preference)
        .then(resolve, reject);
    });
  },

  /**
   * @function updatePreference
   * Method to update class preference
   */
  updateLanguage(classid, language) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateLanguage(classid, language)
        .then(resolve, reject);
    });
  },

  /**
   * @function updateProfileBaseline
   * Method to update profile baseline
   */
  updateProfileBaseline(classid) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateProfileBaseline(classid)
        .then(resolve, reject);
    });
  },

  /**
   * @function addStudentsToClass
   * @param {UUID} classId
   * @param {Object} dataParam
   * Method to add students into a class
   */
  addStudentsToClass(classId, dataParam) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .addStudentsToClass(classId, dataParam)
        .then(resolve, reject);
    });
  },

  /**
   * @function updateClassSetupFlag
   * @param {UUID} classId
   * @param {Object} setting
   * Method to update class complete setup setting
   */
  updateClassSetupFlag(classId, setting) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateClassSetupFlag(classId, setting)
        .then(resolve, reject);
    });
  },

  readBulkClassDetails(classIds) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('classAdapter')
        .readBulkClassDetails(classIds)
        .then(classDetails => {
          resolve(
            service
              .get('classSerializer')
              .normalizeReadBulkClassDetails(classDetails)
          );
        }, reject);
    });
  },

  googleClassroomAuth(redirectionUrl) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('classAdapter')
        .googleClassroomAuth(redirectionUrl)
        .then(
          () => {
            return;
          },
          xhr => {
            return resolve(xhr.getResponseHeader('Location'));
          },
          reject
        );
    });
  },

  fetchAccessToken() {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('classAdapter')
        .fetchAccessToken()
        .then(
          token => {
            resolve(token);
          },
          () => {
            resolve();
          },
          reject
        );
    });
  },

  fetchClassRoomList() {
    const service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('classAdapter')
        .fetchClassRoomList()
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            if (error.status === 404) {
              resolve([]);
            } else {
              resolve(error);
            }
          }
        );
    });
  },

  updateClassRoomList(classId, listStudent) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateClassRoomList(classId, listStudent)
        .then(resolve, reject);
    });
  },

  updateGoogleClassSettings(classId, googleUserId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .updateGoogleClassSettings(classId, googleUserId)
        .then(resolve, reject);
    });
  },

  fetchStudentList(googleUserId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .fetchStudentList(googleUserId)
        .then(studentList => {
          resolve(
            service.get('classSerializer').normalizeStudentList(studentList)
          );
        }, reject);
    });
  },

  /**
   * Delete Google Classroom
   * @returns {Promise}
   */
  deleteGoogleClassroom: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .deleteGoogleClassroom()
        .then(resolve, reject);
    });
  },

  /**
   * @function triggerAutoClassSetup
   * Method to update class preference
   */
  triggerAutoClassSetup(classData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .triggerAutoClassSetup(classData)
        .then(resolve, reject);
    });
  },

  /**
   * @function getStudentAvailability
   * @param {Object} dataParam
   * Method to check student available status
   */
  getStudentAvailability(dataParam) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .getStudentAvailability(dataParam)
        .then(studentList => {
          resolve(
            service
              .get('classSerializer')
              .normalizeStudentStatusList(studentList)
          );
        }, reject);
    });
  },

  /**
   * create Classroom assessments
   * @returns {Promise}
   */
  createClassroomAssignments: function(classroomId, data) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classAdapter')
        .createClassroomAssignments(classroomId, data)
        .then(resolve, reject);
    });
  },

  /**
   * Get Shortener Url
   * @returns {Promise}
   */
  getShortenerUrl: function(url) {
    const service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('classAdapter')
        .getShortenerUrl(url)
        .then(
          function(responseData, textStatus, request) {
            resolve(request.getResponseHeader('location'));
          },
          function(error) {
            resolve(error.getResponseHeader('location'));
          }
        );
    });
  },

  /**
   * @function sendWelcomeMail
   * @param {Object} dataParam
   * Method to to send mail to students
   */
  sendWelcomeMail: function(params) {
    const service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('classAdapter')
        .sendWelcomeMail(params)
        .then(resolve);
    });
  }
});
