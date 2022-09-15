import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'content/modals/gru-login-prompt',
  'Integration | Component | content/modals/gru login prompt',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  this.render(hbs`{{content/modals/gru-login-prompt}}`);

  const $component = this.$('.content.modals.gru-login-prompt');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');

  assert.ok($header.find('div.img-container').length, 'Header title');
  assert.ok($header.find('.modal-title').length, 'Header title');
  assert.ok($header.find('p').length, 'Header message');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');

  const $existingUser = $component.find('.existing-user');
  assert.ok($existingUser.length, 'Existing user container missing');
  assert.ok(
    $existingUser.find('.action-container').length,
    'Action container for existing user missing'
  );
  assert.ok(
    $existingUser.find('.action-container').length,
    'Action container for existing user missing'
  );
  assert.ok(
    $existingUser.find('.action-container button').length,
    'Action container for existing user missing'
  );

  const $newUser = $component.find('.new-user');
  assert.ok($newUser.length, 'Existing user container missing');
  assert.ok(
    $existingUser.find('.action-container').length,
    'Action container for existing user missing'
  );
  assert.ok(
    $existingUser.find('.action-container').length,
    'Action container for existing user missing'
  );
  assert.ok(
    $existingUser.find('.action-container button').length,
    'Action container for existing user missing'
  );

  const $footer = $component.find('.modal-footer');

  assert.equal($footer.find('button').length, 1, 'Number of action buttons');
});
