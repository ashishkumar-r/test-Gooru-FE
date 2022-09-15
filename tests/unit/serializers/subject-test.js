import { moduleForModel, test } from 'ember-qunit';

moduleForModel('subject', 'Unit | Serializer | subject', {
  // Specify the other units that are required for this test.
  needs: ['serializer:subject']
});

// Replace this with your real tests.
test('it normalize findAll response', function(assert) {
  var record = this.subject();

  var serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
