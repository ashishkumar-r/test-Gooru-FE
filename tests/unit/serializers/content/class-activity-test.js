import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:content/class-activity',
  'Unit | Serializer | content/class activity'
);

test('normalizeClassActivityContent for collection', function(assert) {
  const serializer = this.subject();
  const data = {
    id: 10,
    content_id: 123,
    title: 'Any title',
    content_type: 'collection',
    resource_count: 10,
    question_count: 5
  };
  const modelObject = serializer.normalizeClassActivityContent(data);
  assert.equal(modelObject.get('id'), 123, 'Wrong id');
  assert.equal(modelObject.get('title'), 'Any title', 'Wrong title');
  assert.equal(modelObject.get('resourceCount'), 10, 'Wrong resource count');
  assert.equal(modelObject.get('questionCount'), 5, 'Wrong question count');
  assert.equal(modelObject.get('isCollection'), true, 'Wrong type');
});

test('normalizeClassActivityContent for assessment', function(assert) {
  const serializer = this.subject();
  const data = {
    id: 10,
    content_id: 123,
    title: 'Any title',
    content_type: 'assessment',
    resource_count: 10,
    question_count: 5
  };
  const modelObject = serializer.normalizeClassActivityContent(data);
  assert.equal(modelObject.get('id'), 123, 'Wrong id');
  assert.equal(modelObject.get('title'), 'Any title', 'Wrong title');
  assert.equal(modelObject.get('resourceCount'), 10, 'Wrong resource count');
  assert.equal(modelObject.get('questionCount'), 5, 'Wrong question count');
  assert.equal(modelObject.get('isAssessment'), true, 'Wrong type');
});

test('normalizeClassActivity with context and activation date', function(assert) {
  const serializer = this.subject();
  const data = {
    id: 10,
    content_id: 123,
    title: 'Any title',
    content_type: 'assessment',
    resource_count: 10,
    question_count: 5,
    activation_date: '2012-11-13'
  };
  const modelObject = serializer.normalizeClassActivity(data);
  assert.equal(modelObject.get('id'), 10, 'Wrong id');
  assert.ok(modelObject.get('date'), 'Missing date');
  assert.ok(modelObject.get('collection'), 'Missing collection');
  assert.ok(
    modelObject.get('collection.isAssessment'),
    'Missing collection type'
  );
});
