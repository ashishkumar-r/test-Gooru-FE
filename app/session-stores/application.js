import AdaptiveStore from 'ember-simple-auth/session-stores/adaptive';

const authKey = function() {
  let key = 'ember_simple_auth-session';
  if (window.frameElement) {
    key = window.parent.impersonate
      ? 'ember_simple_auth-impersonate-session'
      : 'ember_simple_auth-session';
  }
  return key;
};

export default AdaptiveStore.extend({
  localStorageKey: authKey()
});
