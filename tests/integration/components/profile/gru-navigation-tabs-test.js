import { moduleForComponent } from 'ember-qunit';

moduleForComponent(
  'profile/gru-navigation-tabs',
  'Integration | Component | profile/gru navigation tabs',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);
