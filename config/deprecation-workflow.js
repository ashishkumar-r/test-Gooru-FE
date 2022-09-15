window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-metal.merge' },
    { handler: 'silence', matchId: 'ember-application.app-instance-container' },
    { handler: 'silence', matchId: 'ember-application.injected-container' },
    { handler: 'silence', matchId: 'ember-views.dispatching-modify-property' },
    { handler: 'silence', matchId: 'ember-metal.ember.keys' },
    { handler: 'silence', matchId: 'ember-views.render-double-modify' },
    { handler: 'silence', matchId: 'ember-runtime.enumerable-contains' }
  ]
};
