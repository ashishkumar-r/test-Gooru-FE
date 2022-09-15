import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'content/modals/gru-assessment-confirmation',
  'Integration | Component | content/modals/gru assessment confirmation',
  {
    integration: true
  }
);

test('Layout and forward only with limited attempts', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('model', {
    bidirectional: false,
    attempts: 5,
    title: 'any-title'
  });

  this.render(hbs`{{content/modals/gru-assessment-confirmation model=model}}`);

  const $component = this.$('.content.modals.gru-assessment-confirmation');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');

  assert.equal(
    $body.find('.setting i').hasClass('trending_flat'),
    true,
    'Wrong icon'
  );
  assert.equal(
    $body
      .find('.setting p')
      .text()
      .trim(),
    'You can navigate forward only',
    'Wrong setting description'
  );

  assert.equal(
    $body
      .find('.attempts p')
      .text()
      .trim(),
    'You have 5 attempts',
    'Wrong attempts description'
  );

  assert.equal(
    $body.find('.actions button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($body.find('.actions .cancel').length, 'Cancel button');
  assert.ok($body.find('.actions .continue').length, 'Start button');
});

test('Navigate both ways with unlimited attempts', function(assert) {
  this.set('model', {
    bidirectional: true,
    attempts: -1,
    title: 'any-title'
  });

  this.render(hbs`{{content/modals/gru-assessment-confirmation model=model}}`);
  const $body = this.$(
    '.content.modals.gru-assessment-confirmation .modal-body'
  );

  assert.ok($body.length, 'Body');

  assert.equal(
    $body.find('.setting i').hasClass('swap_horiz'),
    true,
    'Wrong icon'
  );
  assert.equal(
    $body
      .find('.setting p')
      .text()
      .trim(),
    'You can navigate forward and backwards to answer questions',
    'Wrong setting description'
  );

  assert.equal(
    $body
      .find('.attempts p')
      .text()
      .trim(),
    'You have unlimited attempts',
    'Wrong attempts description'
  );
});

test('Negative ammount of attempts', function(assert) {
  this.set('model', {
    bidirectional: true,
    attempts: 0,
    title: 'any-title'
  });

  this.render(hbs`{{content/modals/gru-assessment-confirmation model=model}}`);
  const $body = this.$(
    '.content.modals.gru-assessment-confirmation .modal-body'
  );
  assert.equal(
    $body
      .find('.attempts p')
      .text()
      .trim(),
    'You have 0 attempts',
    'Wrong attempts description'
  );
  assert.equal(
    $body.find('.actions .continue').prop('disabled'),
    true,
    'Button should be disabled'
  );
});

test('Layout with a started assessment', function(assert) {
  this.set('model', {
    bidirectional: true,
    attempts: -1,
    isAssessmentStarted: true
  });

  this.render(hbs`{{content/modals/gru-assessment-confirmation model=model}}`);

  const $body = this.$(
    '.content.modals.gru-assessment-confirmation .modal-body'
  );
  assert.ok($body.length, 'Body');

  assert.equal(
    $body.find('.actions button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($body.find('.actions .cancel').length, 'Cancel button');
  assert.ok($body.find('.actions .continue').length, 'Continue button');
});
