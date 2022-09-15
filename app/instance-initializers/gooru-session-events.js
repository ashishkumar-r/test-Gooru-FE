/**
 * Initialize session events
 */
export function initialize(instance) {
  const applicationRoute = instance.container.lookup('route:application');
  const session = instance.container.lookup('service:session');

  session.on('authenticationSucceeded', function() {
    // It does nothing because the event is triggered when authenticating as anonymous
    // ans sign-in is already transitioning by itself
  });
  session.on('invalidationSucceeded', function() {
    // Transition only when it comes from logout
    if (window.location.pathname === '/logout') {
      applicationRoute.transitionTo('index');
    } else {
      window.location.reload();
    }
  });
}

export default {
  initialize,
  name: 'gooru-session-events',
  after: 'ember-simple-auth'
};
