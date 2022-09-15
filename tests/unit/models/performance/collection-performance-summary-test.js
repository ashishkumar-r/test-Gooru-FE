import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'model:performance/collection-performance-summary',
  'Unit | Model | performance/collection-performance-summary',
  {
    unit: true
  }
);

test('isCollection', function(assert) {
  var model = this.subject({
    collectionType: 'collection'
  });

  assert.ok(model.get('isCollection'), 'Should be collection');
  assert.ok(!model.get('isAssessment'), 'Should not be assessment');
});

test('isAssessment', function(assert) {
  var model = this.subject({
    collectionType: 'assessment'
  });

  assert.ok(model.get('isAssessment'), 'Should be assessment');
  assert.ok(!model.get('isCollection'), 'Should not be collection');
});
