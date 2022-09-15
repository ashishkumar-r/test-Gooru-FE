import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * @property {Service} session
   */
  session: Ember.inject.service(),

  beforeModel: function(transition) {
    this._super(...arguments);
    const router = this;
    const userId = router.get('session.userId');
    if (userId === 'anonymous') {
      const queryParam = {
        queryParams: { redirectURL: transition.intent.url }
      };
      this.transitionTo('sign-in', queryParam);
    }
  }
});
