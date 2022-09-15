import Ember from 'ember';
import ProfileSerializer from 'gooru-web/serializers/profile/profile';
import CourseSerializer from 'gooru-web/serializers/content/course';
import AuthenticationSerializer from 'gooru-web/serializers/authentication/authentication';
import ProfileAdapter from 'gooru-web/adapters/profile/profile';
import ProfileCoursesAdapter from 'gooru-web/adapters/profile/courses';
import AvailabilityAdapter from 'gooru-web/adapters/profile/availability';
import { NETWORK_TYPE } from 'gooru-web/config/config';
import AppUserAdapter from 'gooru-web/adapters/profile/about-detail';
import { getTaxonomyIdsBySearchContent } from 'gooru-web/utils/utils';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
/**
 * Service to support the Profile CRUD operations
 *
 * @typedef {Object} ProfileService
 */
export default Ember.Service.extend({
  session: Ember.inject.service(),

  store: Ember.inject.service(),

  profileSerializer: null,

  courseSerializer: null,

  authenticationSerializer: null,

  profileAdapter: null,

  appUserAdapter: null,

  i18n: Ember.inject.service(),

  init: function() {
    this._super(...arguments);
    this.set(
      'profileSerializer',
      ProfileSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'courseSerializer',
      CourseSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'authenticationSerializer',
      AuthenticationSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'profileAdapter',
      ProfileAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'profileCoursesAdapter',
      ProfileCoursesAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'availabilityAdapter',
      AvailabilityAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'appUserAdapter',
      AppUserAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates a new user account
   *
   * @param profileData object with the profile data
   * @returns {Promise}
   */
  createProfile: function(profileData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      profileData.set('tenantId', service.get('session.tenantId'));
      let serializedProfileData = service
        .get('profileSerializer')
        .serializeCreateProfile(profileData);
      service
        .get('profileAdapter')
        .createProfile({
          body: serializedProfileData
        })
        .then(
          function(response) {
            resolve(
              service
                .get('authenticationSerializer')
                .normalizeResponse(response, false, undefined)
            );
          },
          function(error) {
            reject(
              error && error.responseText
                ? JSON.parse(error.responseText)
                : error
            );
          }
        );
    });
  },

  /**
   * Updates the current user Profile information
   *
   * @param profile
   * @returns {Ember.RSVP.Promise}
   */
  updateMyProfile: function(profile) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedProfile = service
        .get('profileSerializer')
        .serializeUpdateProfile(profile);
      service
        .get('profileAdapter')
        .updateMyProfile({
          body: serializedProfile
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(
              error && error.responseText
                ? JSON.parse(error.responseText)
                : error
            );
          }
        );
    });
  },

  /**
   * Gets the user Profile information of a given user id
   *
   * @returns {Promise}
   */
  readUserProfile: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      // const userStore = service
      //   .get('store')
      //   .peekRecord('profile/profile-data', userId);
      // if (!userStore) {
      service.readMultipleProfiles([userId]).then(function(profiles) {
        resolve(profiles.length ? profiles[0] : undefined);
      }, reject);
      // }
      // else {
      //   resolve(
      //     service.get('profileSerializer').normalizeReadProfile(userStore)
      //   );
      // }
    });
  },

  /**
   * Gets the user Profile information of a given username
   *
   * @returns {Promise}
   */
  readUserProfileByUsername: function(username) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readUserProfileByUsername(username)
        .then(
          function(response) {
            resolve(
              service.get('profileSerializer').normalizeReadProfile(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the user Profile information of a given username
   *
   * @returns {Promise}
   */
  readUsersProfileByUsername: function(text) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readUserProfileByUsername(text)
        .then(
          function(response) {
            resolve(
              service.get('profileSerializer').normalizeUserProfile(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Follows a user profile
   * @param userId
   * @returns {Ember.RSVP.Promise}
   */
  followUserProfile: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .followUserProfile(userId)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Unfollows a user profile
   * @param userId
   * @returns {Ember.RSVP.Promise}
   */
  unfollowUserProfile: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .unfollowUserProfile(userId)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Checks if the username was already taken
   * @param username
   * @returns {Promise}
   */
  checkUsernameAvailability: function(username) {
    const service = this;
    const i18n = service.get('i18n');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('availabilityAdapter')
        .verifyUsername(username)
        .then(
          function() {
            reject(i18n.t('sign-up.error-username-taken').string);
          },
          function(error) {
            if (
              error.status === 404 ||
              error.status === 500 ||
              error.status === 200
            ) {
              resolve();
            } else {
              reject(error);
            }
          }
        );
    });
  },

  /**
   * Checks if the email was already taken
   * @param email
   * @returns {Promise}
   */
  checkEmailAvailability: function(email) {
    const service = this;
    const i18n = service.get('i18n');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('availabilityAdapter')
        .verifyEmail(email)
        .then(
          function() {
            reject(i18n.t('sign-up.error-email-taken').string);
          },
          function(error) {
            if (
              error.status === 404 ||
              error.status === 500 ||
              error.status === 200
            ) {
              resolve();
            } else {
              reject(error);
            }
          }
        );
    });
  },

  /**
   * Checks if the email exists
   * @param email
   * @returns {Promise}
   */
  checkEmailExists: function(email) {
    const service = this;
    const i18n = service.get('i18n');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('availabilityAdapter')
        .verifyEmail(email)
        .then(
          function(response) {
            resolve(
              service.get('profileSerializer').normalizeReadProfile(response)
            );
          },
          function() {
            reject(i18n.t('forgot-password.error-email-not-exists').string);
          }
        );
    });
  },

  /**
   * Checks if the email was already taken by a google account
   * @param email
   * @returns {Promise}
   */
  checkGoogleEmail: function(email) {
    const service = this;
    const i18n = service.get('i18n');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('availabilityAdapter')
        .verifyEmail(email)
        .then(
          function(user) {
            if (user.login_type === 'google') {
              reject(
                i18n.t('common.errors.reset-google-account-exists').string
              );
            } else {
              resolve();
            }
          },
          function(error) {
            if (error.status === 404 || error.status === 200) {
              resolve();
            } else {
              reject(error);
            }
          }
        );
    });
  },

  /**
   * Checks if the username was already taken by a google account
   * @param username
   * @returns {Promise}
   */
  checkGoogleUsername: function(username) {
    const service = this;
    const i18n = service.get('i18n');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('availabilityAdapter')
        .verifyUsername(username)
        .then(
          function(user) {
            if (user.login_type === 'google') {
              reject(
                i18n.t('common.errors.sign-in-google-account-exists').string
              );
            } else {
              resolve();
            }
          },
          function(error) {
            if (error.status === 404 || error.status === 200) {
              resolve();
            } else {
              reject(error);
            }
          }
        );
    });
  },

  /**
   * Gets the list of courses created by the profile and filter by subject
   *
   * @param profile the Profile object
   * @param subject the subject to filter the courses
   * @returns {Promise}
   */
  getCourses: function(profile, subject, params = {}, filter = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileCoursesAdapter')
        .getCourses(profile.get('id'), subject, params, filter)
        .then(
          function(response) {
            let courses = service
              .get('courseSerializer')
              .normalizeGetCourses(response);
            resolve(courses);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Returns the current logged user information
   * @returns {*}
   */
  findByCurrentUser: function() {
    if (!this.get('session.isAnonymous')) {
      var currentProfileId = this.get('session.userId');
      return this.readUserProfile(currentProfileId);
    }
    return null;
  },

  /**
   * Return the list of resources related to a user
   * @param {string} userId
   * @param {*} params
   * @returns {RSVP.Promise.<Resource>}
   */
  readResources: function(userId, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readResources(userId, params)
        .then(function(response) {
          let resource = service
            .get('profileSerializer')
            .normalizeReadResources(response);
          let taxonomyIds = getTaxonomyIdsBySearchContent(resource, false);
          if (params.isCrosswalkApplicable && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                resource,
                params.userPreferenceFreamwork,
                taxonomyIds
              )
              .then(function() {
                resolve(resource);
              });
          } else {
            resolve(resource);
          }
        }, reject);
    });
  },

  /**
   * Return the list of questions related to a user
   * @param {string} userId
   * @param {*} params
   * @returns {RSVP.Promise.<Question>}
   */
  readQuestions: function(userId, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readQuestions(userId, params)
        .then(function(response) {
          let question = service
            .get('profileSerializer')
            .normalizeReadQuestions(response);
          let taxonomyIds = getTaxonomyIdsBySearchContent(question, false);
          if (params.isCrosswalkApplicable && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                question,
                params.userPreferenceFreamwork,
                taxonomyIds
              )
              .then(function() {
                resolve(question);
              });
          } else {
            resolve(question);
          }
        }, reject);
    });
  },

  /**
   * Return the list of collections related to a user
   * @param {string} userId
   * @param {*} params
   * @returns {RSVP.Promise.<Collection>}
   */
  readCollections: function(userId, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readCollections(userId, params)
        .then(function(response) {
          let collection = service
            .get('profileSerializer')
            .normalizeReadCollections(response);
          let taxonomyIds = getTaxonomyIdsBySearchContent(collection, false);
          if (params.isCrosswalkApplicable && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                collection,
                params.userPreferenceFreamwork,
                taxonomyIds
              )
              .then(function() {
                resolve(collection);
              });
          } else {
            resolve(collection);
          }
        }, reject);
    });
  },

  /**
   * Return the list of assessments related to a user
   * @param {string} userId
   * @param {*} params
   * @returns {RSVP.Promise.<Assessment>}
   */
  readAssessments: function(userId, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readAssessments(userId, params)
        .then(function(response) {
          let assessment = service
            .get('profileSerializer')
            .normalizeReadAssessments(response);
          let taxonomyIds = getTaxonomyIdsBySearchContent(assessment, false);
          if (params.isCrosswalkApplicable && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                assessment,
                params.userPreferenceFreamwork,
                taxonomyIds
              )
              .then(function() {
                resolve(assessment);
              });
          } else {
            resolve(assessment);
          }
        }, reject);
    });
  },
  /**
   * Return the list of rubrics related to a user
   * @param {string} userId
   * @param {*} params
   * @returns {RSVP.Promise.<Rubric>}
   */
  readRubrics: function(userId, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readRubrics(userId, params)
        .then(function(response) {
          let rubric = service
            .get('profileSerializer')
            .normalizeReadRubrics(response);
          let taxonomyIds = getTaxonomyIdsBySearchContent(rubric, false);
          if (params.isCrosswalkApplicable && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                rubric,
                params.userPreferenceFreamwork,
                taxonomyIds
              )
              .then(function() {
                resolve(rubric);
              });
          } else {
            resolve(rubric);
          }
        }, reject);
    });
  },

  /**
   * Return the list of rubrics related to a user
   * @param {string} userId
   * @param {*} params
   * @returns {RSVP.Promise.<Rubric>}
   */
  readOfflineActivities: function(userId, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readOfflineActivities(userId, params)
        .then(function(response) {
          let offlineActivity = service
            .get('profileSerializer')
            .normalizeReadOfflineActivities(response);
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            offlineActivity,
            false
          );
          if (params.isCrosswalkApplicable && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                offlineActivity,
                params.userPreferenceFreamwork,
                taxonomyIds
              )
              .then(function() {
                resolve(offlineActivity);
              });
          } else {
            resolve(offlineActivity);
          }
        }, reject);
    });
  },

  /**
   * Starts the forgot password workflow
   * @param {string} username - account's username or email
   * @returns {Ember.RSVP.Promise}
   */
  forgotPassword: function(email) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .forgotPassword(email)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(
              error && error.responseText
                ? JSON.parse(error.responseText)
                : error
            );
          }
        );
    });
  },

  /**
   * Resets the user password
   * @param {string} password
   * @param {string} token
   * @returns {Ember.RSVP.Promise}
   */
  resetPassword: function(password, token) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .resetPassword(password, token)
        .then(
          function() {
            resolve(token);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Changes the user password
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Ember.RSVP.Promise}
   */
  changePassword: function(oldPassword, newPassword) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .changePassword(oldPassword, newPassword)
        .then(
          function() {
            resolve(true);
          },
          function(error) {
            reject(
              error && error.responseText
                ? JSON.parse(error.responseText)
                : error
            );
          }
        );
    });
  },

  /**
   * Return the list of profiles the user is following
   * @param userId
   * @returns {Ember.RSVP.Promise}
   */
  readFollowing: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readNetwork(userId, NETWORK_TYPE.FOLLOWING)
        .then(
          function(response) {
            resolve(
              service
                .get('profileSerializer')
                .normalizeReadNetwork(response, NETWORK_TYPE.FOLLOWING)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Return the list of profiles that are following the user
   * @param userId
   * @returns {Ember.RSVP.Promise}
   */
  readFollowers: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .readNetwork(userId, NETWORK_TYPE.FOLLOWERS)
        .then(
          function(response) {
            resolve(
              service
                .get('profileSerializer')
                .normalizeReadNetwork(response, NETWORK_TYPE.FOLLOWERS)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  readMultipleProfiles: function(profileIds, max = 30) {
    const service = this;
    var chunk = profileIds.length > max ? max : profileIds.length;
    const promises = [];
    var usersProfile = Ember.A([]);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      for (let i = 0, j = profileIds.length; i < j; i += chunk) {
        let temparray = profileIds.slice(i, i + chunk);
        const promise = service
          .get('profileAdapter')
          .readMultipleProfiles(temparray);
        promises.push(promise);
      }
      Ember.RSVP.all(promises).then(
        function(values) {
          if (profileIds.length === 1) {
            let userId = values[0].users[0].id;
            const userStore = service
              .get('store')
              .peekRecord('profile/profile-data', userId);
            if (!userStore) {
              if (values[0].users[0].country_id) {
                service
                  .get('store')
                  .createRecord('profile/profile-data', values[0].users[0]);
              }
            }
          }
          values.forEach(function(value) {
            usersProfile.addObjects(
              service
                .get('profileSerializer')
                .normalizeReadMultipleProfiles(value)
            );
          });

          resolve(usersProfile);
        },

        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * Get  Profile preference for current profile
   *  @returns {Promise}
   *  @yields { preference_settings: {"standard_preference": {"K12.MA": "TEKS"}   } }
   */
  getProfilePreference: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .getProfilePreference()
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Update Profile preference for current profile
   *  @returns {Promise}
   *  @payload {"standard_preference": {"K12.MA": "TEKS"}   }
   */
  updateProfilePreference: function(data) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .updateProfilePreference(data)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function updateConsentPreference
   * @param {Object} data
   * @return {Promise}
   * Method to update consent preference
   */
  updateConsentPreference: function(data) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .updateConsentPreference(data)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function updateShareData
   * @param {Object} data {String} classId
   * @return {Promise}
   * Method to update share data
   */
  updateShareData: function(data, classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .updateShareData(data, classId)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function searchUserProfiles
   * @param {Object} searchCriteria
   * @return {Promise}
   * Method to search users by given pattern
   */
  searchUserProfiles(searchCriteria) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .searchUserProfiles(searchCriteria)
        .then(
          function(userProfiles) {
            resolve(
              service
                .get('profileSerializer')
                .normalizeReadMultipleProfiles(userProfiles)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Creates a new empty user model
   * @returns {User}
   */
  newUser: function() {
    return this.get('store').createRecord('user/user');
  },

  loadScript: function(script) {
    return Ember.RSVP.hash({
      getLanguages: this.get('profileAdapter').loadScript(script)
    }).then(getLanguages => {
      Object.assign(getLanguages.getLanguages.translationLabels); //dummy liner fix
      Ember.RSVP.resolve(
        Object.assign(getLanguages.getLanguages.translationLabels)
      );
      return getLanguages.getLanguages.translationLabels;
    });
  },

  loadScripts: function(lang, subjectCode, readingLevel) {
    return Ember.RSVP.hash({
      getLanguages: this.get('profileAdapter').loadScripts(
        lang,
        subjectCode,
        readingLevel
      )
    }).then(getLanguages => {
      Object.assign(getLanguages.getLanguages.translationLabels); //dummy liner fix
      Ember.RSVP.resolve(
        Object.assign(getLanguages.getLanguages.translationLabels)
      );
      return getLanguages.getLanguages.translationLabels;
    });
  },

  /**
   * Send Mail verify
   * @param {string} token
   * @param {email} token
   */
  sendMailVerify: function(email, token) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      return service
        .get('profileAdapter')
        .sendMailVerify(email, token)
        .then(
          function() {
            resolve(true);
          },
          function(error) {
            let statusCode = error.status;
            if (statusCode === 404) {
              reject(true);
            } else {
              reject(false);
            }
          }
        );
    });
  },
  /**
   * Update Mail verify
   * @param {string} token
   */
  updateMailVerify: function(token) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .updateMailVerify(token)
        .then(
          function() {
            resolve();
          },
          function(error) {
            let statusCode = error.status;
            if (statusCode === 410) {
              reject();
            }
          }
        );
    });
  },
  appUser: function() {
    const service = this;
    return service
      .get('appUserAdapter')
      .getAboutDetail()
      .then(response => {
        return response.apps;
      });
  },

  teacherImpersonation: function(userId, classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      return service
        .get('profileAdapter')
        .teacherImpersonation(userId, classId)
        .then(function(data) {
          return resolve(data);
        }, reject);
    });
  },

  /**
   * Delete a user profile
   * @returns {Ember.RSVP.Promise}
   */
  deleteUserProfile: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .deleteUserProfile()
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the list of guardian role
   *
   * @returns {Promise}
   */
  getGuardianRoles: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .getGuardianRoles()
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * invite guardian
   *
   * @param userId
   * @param guardianInfoData object with the guardian information data
   * @returns {Promise}
   */
  inviteGuardian: function(userId, guardianInfoData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedGuardiyanData = service
        .get('profileSerializer')
        .serializeGuardianData(guardianInfoData);
      service
        .get('profileAdapter')
        .inviteGuardian(userId, {
          body: serializedGuardiyanData
        })
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(
              error && error.responseText
                ? JSON.parse(error.responseText)
                : error
            );
          }
        );
    });
  },

  /**
   * Gets the list of guardian
   *
   * @returns {Promise}
   */
  getGuardianList: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .getGuardianList()
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Accept the guardian invite request
   *
   * @param guardianId
   * @returns {Promise}
   */
  acceptGuardianRequest: function(guardianId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .acceptGuardianRequest(guardianId)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  mergeUserProfile: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .mergeUserProfile(userId)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  consolidateProfile: function(userId) {
    const service = this;
    const params = userId ? { userId: userId } : {};
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .consolidateProfile(params)
        .then(
          function(response) {
            resolve(
              service.get('profileSerializer').consolidateProfile(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  resendEmail: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .resendEmail(userId)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  cancelRequest: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .cancelRequest(userId)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  verifyCode: function(queryParams) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .verifyCode(queryParams)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  approveGuardianInvitees: function(token) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .approveGuardianInvitees(token)
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getGuardianInformation: function(id) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .getGuardianInformation(id)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * get whats new status
   * @param userId
   * @returns {Ember.RSVP.Promise}
   */
  getWhatsNewStatus: function(appId) {
    const service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('profileAdapter')
        .getWhatsNewStatus(appId)
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

  updateWhatsNewStatus: function(appId, status) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .updateWhatsNewStatus(appId, status)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Changes the user password
   * @param {string} newPassword
   * @returns {Ember.RSVP.Promise}
   */
  forceChangePassword: function(newPassword) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('profileAdapter')
        .forceChangePassword(newPassword)
        .then(
          function() {
            resolve(true);
          },
          function(error) {
            reject(
              error && error.responseText
                ? JSON.parse(error.responseText)
                : error
            );
          }
        );
    });
  },

  getcrosswalkCompetency: function(
    searchResponse,
    classFramework,
    taxonomyIds
  ) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        searchResponse.map(searchData => {
          let standards = searchData.standards || searchData.taxonomy;
          standards.map(data => {
            let taxonomyData = frameworkCrossWalkComp.findBy(
              'sourceDisplayCode',
              data.code
            );
            if (taxonomyData) {
              data.code = taxonomyData.targetDisplayCode;
              data.frameworkCode = taxonomyData.targetFrameworkId;
            }
          });
        });
      });
  }
});
