import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'gru-grade-items',
  'Integration | Component | gru grade items',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  const gradeableItems = Ember.A([
    {
      unitPrefix: 'U1',
      lessonPrefix: 'L1',
      collection: Ember.Object.create({
        title: 'First Assessment'
      }),
      content: Ember.Object.create({
        title: 'Rubric OP Question'
      }),
      studentCount: 10
    },
    {
      unitPrefix: 'U2',
      lessonPrefix: 'L2',
      collectionName: 'First Collection',
      questionName: 'Collection OP Question',
      studentCount: 20
    }
  ]);

  this.set('gradeableItems', gradeableItems);
  this.render(hbs`{{gru-grade-items gradeableItems=gradeableItems}}`);

  const $component = this.$();

  assert.ok($component.find('.item').length, 2, 'Missing grade items');
  assert.ok(
    $component.find('.item:first-child .grade-item').length,
    'Missing question or activity Items'
  );

  assert.equal(
    T.text($component.find('.item:eq(0) .grade-item .question-name')),
    'Rubric OP Question',
    'Wrong question name'
  );
});
