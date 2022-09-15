import DS from 'ember-data';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default DS.JSONAPISerializer.extend(ConfigurationMixin, {
  serialize: function(snapshot) {
    var signUpObject = snapshot.record.toJSON();
    var data = {
      user: {
        firstName: signUpObject.firstName,
        lastName: signUpObject.lastName,
        username: signUpObject.username,
        emailId: signUpObject.email,
        organization: {
          organizationCode: 'gooru'
        }
      },
      gender: 'male',
      dateOfBirth: signUpObject.dateOfBirth,
      role: signUpObject.role,
      password: signUpObject.password
    };
    return data;
  },

  /**
   * Normalizes a single user object returned by the endpoint.
   * @param store
   * @param primaryModelClass
   * @param payload
   * @returns {Object}
   */
  normalizeSingleResponse: function(store, primaryModelClass, payload) {
    return {
      data: this.normalizeUser(payload)
    };
  },

  /**
   * Normalizes the response for an array of users.
   * @param store
   * @param primaryModelClass
   * @param payload
   * @returns {Object}
   */
  normalizeQueryRecordResponse: function(store, primaryModelClass, payload) {
    var serializer = this;
    var classModel = { data: [] };
    var results = payload.searchResult;
    var hasResults = results && results.length > 0;

    if (hasResults) {
      results.forEach(function(result) {
        this.push(serializer.normalizeUser(result));
      }, classModel.data);
    }
    return classModel;
  },

  /**
   * Normalizes the info of a user passed as payload.
   * @param payload
   * @returns {Object}
   */
  normalizeUser: function(payload) {
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    return {
      id: payload.gooruUId,
      type: 'user/user',
      attributes: {
        accountCreatedType: payload.accountCreatedType,
        accountTypeId: payload.accountTypeId,
        active: payload.active,
        confirmStatus: payload.confirmStatus,
        createdOn: payload.createdOn,
        email: payload.emailId,
        firstName: payload.firstName ? payload.firstName : payload.firstname,
        gooruUId: payload.gooruUId,
        lastName: payload.lastName ? payload.lastName : payload.lastname,
        organizationName: payload.organizationName,
        partyUid: payload.partyUid,
        avatarUrl: payload.profileImageUrl
          ? payload.profileImageUrl
          : appRootPath + DEFAULT_IMAGES.USER_PROFILE,
        userRoleSetString: payload.userRoleSetString,
        username: payload.username,
        usernameDisplay: payload.usernameDisplay,
        viewFlag: payload.viewFlag
      }
    };
  }
});
