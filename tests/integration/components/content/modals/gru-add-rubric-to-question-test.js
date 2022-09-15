import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent(
  'content/modals/gru-add-rubric-to-question',
  'Integration | Component | content/modals/gru add rubric to question',
  {
    integration: true
  }
);

test('Layout with rubrics', function(assert) {
  let rubrics = Ember.A([
    Ember.Object.create({
      id: 'rubric-id-1',
      title: 'Rubric 1',
      thumbnail: 'assets/gooru/rubric-default.png'
    }),
    Ember.Object.create({
      id: 'rubric-id-2',
      title: 'Rubric 2',
      thumbnail: 'assets/gooru/rubric-default.png'
    }),
    Ember.Object.create({
      id: 'rubric-id-3',
      title: 'Rubric 3',
      thumbnail: 'assets/gooru/rubric-default.png'
    })
  ]);

  let model = {
    questionId: 'question-1',
    rubrics: rubrics
  };

  this.set('model', model);

  this.render(hbs`{{content/modals/gru-add-rubric-to-question model=model}}`);
  var $container = this.$('.content.modals.gru-add-rubric-to-question');

  assert.ok($container.length, 'Missing add rubric to question component');
  assert.ok(
    $container.find('.modal-header .modal-title').length,
    'Missing title'
  );
  assert.ok($container.find('.modal-body .lead').length, 'Missing lead');
  assert.equal(
    $container.find('.modal-body .lead').text().trim(),
    'Select a rubric to add to this question.',
    'Wrong lead'
  );
  assert.equal(
    $container.find('.list .panel').length,
    3,
    'Wrong number of rubric cards'
  );
  assert.ok(
    $container.find('.modal-footer .cancel').length,
    'Missing cancel button'
  );
  assert.ok(
    $container.find('.modal-footer .add-to').length,
    'Missing add to button'
  );
  assert.notOk(
    $container.find('.modal-footer .go-to').length,
    'Go to My Content button should not be displayed'
  );
});

test('Layout without rubrics', function(assert) {
  let rubrics = Ember.A([]);

  let model = {
    questionId: 'question-1',
    rubrics: rubrics
  };

  this.set('model', model);

  this.render(hbs`{{content/modals/gru-add-rubric-to-question model=model}}`);
  var $container = this.$('.content.modals.gru-add-rubric-to-question');

  assert.ok($container.length, 'Missing add rubric to question component');
  assert.ok(
    $container.find('.modal-header .modal-title').length,
    'Missing title'
  );
  assert.ok($container.find('.modal-body .lead').length, 'Missing lead');

  assert.equal(
    $container.find('.list .panel').length,
    0,
    'No rubrics cards should be displayed'
  );
  assert.ok(
    $container.find('.modal-footer .cancel').length,
    'Missing cancel button'
  );
  assert.notOk(
    $container.find('.modal-footer .add-to').length,
    'Add to button should not be displayed'
  );
  assert.ok(
    $container.find('.modal-footer .go-to').length,
    'Missing go to button'
  );
});
