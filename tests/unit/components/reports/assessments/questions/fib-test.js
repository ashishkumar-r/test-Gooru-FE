import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/questions/gru-fib',
  'Unit | Component | reports/assessment/questions/gru-fib',
  {
    integration: false
  }
);

test('mergeArrays', function(assert) {
  assert.expect(9);

  var component = this.subject();
  let answers = Ember.A([
    Ember.Object.create({ text: 'green', class: 'answer correct' }),
    Ember.Object.create({ text: 'blue', class: 'answer incorrect' })
  ]);

  let sentences = Ember.A([
    Ember.Object.create({ text: 'The mountain is', class: 'sentence' }),
    Ember.Object.create({ text: 'and the sky', class: 'sentence' })
  ]);

  var merge = component.mergeArrays(sentences, answers);
  assert.equal(
    merge.length,
    4,
    'Should have 4 items, empty items are excluded'
  );
  assert.equal(merge[0].get('text'), 'The mountain is', 'Wrong item text');
  assert.equal(merge[0].get('class'), 'sentence', 'Wrong item class');
  assert.equal(merge[1].get('text'), 'green', 'Wrong item text');
  assert.equal(merge[1].get('class'), 'answer correct', 'Wrong item class');
  assert.equal(merge[2].get('text'), 'and the sky', 'Wrong item text');
  assert.equal(merge[2].get('class'), 'sentence', 'Wrong item class');
  assert.equal(merge[3].get('text'), 'blue', 'Wrong item text');
  assert.equal(merge[3].get('class'), 'answer incorrect', 'Wrong item class');
});
