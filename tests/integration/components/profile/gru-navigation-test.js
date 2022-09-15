import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'profile/gru-navigation',
  'Integration | Component | profile/gru navigation',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('it renders', function(assert) {
  this.render(hbs`{{profile/gru-navigation}}`);

  const $component = this.$('.profile.gru-navigation');
  assert.ok($component.length, 'Component does not have the component classes');

  const $actions = $component.find('.profile-info .actions');
  assert.ok($actions.find('button').length, 'Action button is missing');

  const $menuOptions = $component.find('.profile-menu');
  assert.ok(
    $menuOptions.find('li:eq(0)').hasClass('content'),
    'Content should be the first option in the menu'
  );
  assert.ok(
    $menuOptions.find('li:eq(1)').hasClass('about'),
    'About should be the second option in the menu'
  );
  assert.ok(
    $menuOptions.find('li:eq(2)').hasClass('network'),
    'Network should be the third option in the menu'
  );
});
