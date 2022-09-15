/**
 * Initialize router injection
 */
export function initialize(app) {
  // Injects router into all Ember components
  app.inject('component', 'router', 'router:main');
}

export default {
  name: 'router-inject',
  after: 'gooru-configuration',
  initialize: initialize
};
