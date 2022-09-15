import Ember from 'ember';
import Env from 'gooru-web/config/environment';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Adapter for the Authentication (Login) with API 3.0
 *
 * @typedef {Object} AuthenticationAdapter
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-auth/v2',

  tokenNamespace: '/api/nucleus-auth/v1/token',

  /**
   * Read the authentication basic credentials details
   * @type {Object}
   */
  auth: Ember.computed.alias('configuration.AUTH'),

  /**
   * Post a request to authenticate a normal user or anonymous user.
   * @param data values required to build the post body
   * @returns {Promise}
   */
  postAuthentication: function(data) {
    const adapter = this;
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const namespace = this.get('namespace');
    const url = `${endpointUrl}${namespace}/signin`;
    const reqBody = {
      grant_type: data.isAnonymous ? 'anonymous' : 'credential'
    };
    let useGooruClient = false;
    let userDemoClient = false;
    if (data.isAnonymous) {
      if (!data.nonce) {
        useGooruClient = true;
      }
    } else {
      if (
        !adapter.get('session.isGooruClientId') &&
        !adapter.get('session.isDemoTenant')
      ) {
        reqBody.anonymous_token = adapter.get('session.token-api3');
      } else {
        if (adapter.get('session.isDemoTenant')) {
          userDemoClient = true;
        } else {
          useGooruClient = true;
        }
      }
    }
    const auth = adapter.get('auth');
    const demoTenantAuth = adapter.get('configuration.DEMO_TENANT_AUTH');
    if (useGooruClient) {
      reqBody.client_key = auth ? auth.clientKey : Env['API-3.0'].clientKey;
      reqBody.client_id = auth ? auth.clientId : Env['API-3.0'].clientId;
    }
    if (userDemoClient) {
      reqBody.client_key = demoTenantAuth
        ? demoTenantAuth.clientKey
        : auth.clientKey;
      reqBody.client_id = demoTenantAuth
        ? demoTenantAuth.clientId
        : auth.clientKey;
    }

    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(data),
      data: JSON.stringify(reqBody),
      global: false /* Stop global ajaxError event from triggering */
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function(data) {
    if (data.isAnonymous) {
      return data.nonce
        ? {
          Authorization: `Nonce ${data.nonce}`
        }
        : {};
    } else {
      return {
        Authorization: `Basic ${btoa(`${data.username}:${data.password}`)}`
      };
    }
  },

  /**
   * Post a request to authenticate a google user
   * @param access token required to build the get headers
   * @returns {Promise}
   */
  postAuthenticationWithToken: function(data) {
    const url = this.get('tokenNamespace');
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: {
        Authorization: `Token ${data.accessToken}`
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get request to check if the token is valid
   * @param access token required to build the get headers
   * @returns {Promise}
   */
  checkToken: function(data) {
    const url = this.get('tokenNamespace');
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: {
        Authorization: `Token ${data.accessToken}`
      },
      global: false /* Stop global ajaxError event from triggering */
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Invalidates the current token
   * @returns {Promise}
   */
  signOut: function() {
    const namespace = this.get('namespace');
    const url = `${namespace}/signout`;
    const token = this.get('session.token-api3');
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      headers: {
        Authorization: `Token ${token}`
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Post a request to find the domain name have any directions for authentication.
   * @param data values required to build the post body
   * @returns {Promise}
   */
  domainBasedRedirection: function(data) {
    const namespace = this.get('namespace');
    const url = `${namespace}/redirect`;
    const token = this.get('session.token-api3');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: {
        Authorization: `Token ${token}`
      },
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  }
});
