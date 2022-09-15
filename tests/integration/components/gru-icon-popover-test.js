import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

moduleForComponent(
  'gru-icon-popover',
  'Integration | Component | Gru icon popover',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.register('service:popover', Ember.Service.extend({}));
    }
  }
);

test('layout', function(assert) {
  assert.expect(2); //making sure all asserts are called

  this.render(
    hbs`{{gru-icon-popover name="live_help" key= "settings-visibility"}}`
  );

  var $component = this.$(); //component dom element

  let $icon = $component.find('i.gru-icon-popover');
  T.exists(assert, $icon, 'Root element not found');

  $icon.click();

  return wait().then(function() {
    let $popoverWindow = $component.find('.gru-icon-popover-window');
    T.exists(assert, $popoverWindow, 'Popover window should be visible');
  });
});
