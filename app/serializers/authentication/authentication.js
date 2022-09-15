import Ember from 'ember';
import Env from 'gooru-web/config/environment';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer for the Authentication (Login) with API 3.0
 *
 * @typedef {Object} AuthenticationSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  /**
   *
   * @param payload is the response coming from the endpoint
   * @param isAnonymous indicates if normalization is for an anonymous account
   * @param accessToken access token to use when it comes from google sign-in
   * @returns {{token, token-api3: *, user: {username: (string|string|string), gooruUId: *, isNew: *},
   *            cdnUrls:{content: *, user: *}, isAnonymous: *}}
   */
  normalizeResponse: function(payload, isAnonymous, accessToken) {
    const basePath = payload.cdn_urls.user_cdn_url;
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    return {
      token: isAnonymous
        ? Env['API-3.0']['anonymous-token-api-2.0']
        : Env['API-3.0']['user-token-api-2.0'],
      'token-api3': accessToken ? accessToken : payload.access_token,
      user: {
        username: payload.username,
        userDisplayName: this.getUserDisplayName(payload),
        gooruUId: payload.user_id,
        avatarUrl: payload.thumbnail
          ? basePath + payload.thumbnail
          : appRootPath + DEFAULT_IMAGES.USER_PROFILE,
        isNew: !payload.user_category,
        providedAt: payload.provided_at,
        role: payload.user_category
      },
      isGuest: payload.permissions
        ? payload.permissions.indexOf('GUEST') !== -1
        : false,
      cdnUrls: {
        user: basePath,
        content: payload.cdn_urls.content_cdn_url
      },
      isAnonymous: isAnonymous,
      tenant: {
        tenantId: payload.tenant ? payload.tenant.tenant_id : undefined,
        settings: payload.tenant.settings
          ? this.normalizeTenantSettings(payload.tenant.settings)
          : null,
        imageUrl: payload.tenant ? payload.tenant.image_url : null,
        tenantName: payload.tenant ? payload.tenant.name : null,
        tenantShortName: payload.tenant ? payload.tenant.short_name : null
      },
      partnerId: payload.partner_id,
      permissions: payload.permissions
    };
  },

  /**
   * @param payload is the input for logic...Internal function
   * @returns {user display name}
   */
  getUserDisplayName: function(payload) {
    let userDisplayName;

    if (payload.first_name) {
      userDisplayName = payload.first_name;

      if (payload.last_name) {
        userDisplayName += ` ${payload.last_name}`;
      }
    } else if (payload.username) {
      userDisplayName = payload.username;
    } else if (payload.email) {
      userDisplayName = payload.email.split('@')[0];
    }

    return userDisplayName;
  },

  /**
   * @param payload is the response coming from the endpoint
   * @returns {statusCode: *, redirectUrl: *}
   */
  normalizeDomainRedirectResponse: function(payload) {
    return {
      statusCode: payload.status_code,
      redirectUrl: payload.redirect_url
    };
  },

  /**
   * @param payload tenant settings from the response
   * @function normalizeTenantSettings
   */
  normalizeTenantSettings(payload) {
    return {
      allowMultiGradeClass: payload.allow_multi_grade_class
        ? payload.allow_multi_grade_class.toLowerCase()
        : 'off',
      enabledVideoConference: payload.enable_cls_video_conf_setup
        ? payload.enable_cls_video_conf_setup
        : false
    };
  }
});
