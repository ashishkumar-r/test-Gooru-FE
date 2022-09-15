import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent(
  'serializer:user/availability',
  'Unit | Serializer | user/availability'
);

test('normalizeSingleResponse', function(assert) {
  assert.expect(2);

  var store = Ember.Object.create({
    push: function() {
      assert.ok(true, 'This should be called once');
    }
  });
  const serializer = this.subject();

  const payload = {
      confirmStatus: 0,
      gooruUId: '1726fb25-2f09-4968-b86b-c170bd58ac4c',
      collaboratorCheck: false,
      availability: true
    },
    response = serializer.normalizeSingleResponse(
      store,
      'user/availability',
      payload
    );

  const expected = {
    data: {
      id: '1726fb25-2f09-4968-b86b-c170bd58ac4c',
      type: 'user/availability',
      attributes: {
        confirmStatus: 0,
        collaboratorCheck: false,
        availability: true
      }
    }
  };

  assert.deepEqual(
    response,
    expected,
    `Wrong response: ${JSON.stringify(response)}\n expected: ${JSON.stringify(
      expected
    )}`
  );
});

test('normalizeSingleResponse on negative response', function(assert) {
  assert.expect(2);

  var store = Ember.Object.create({
    push: function() {
      assert.ok(true, 'This should be called once');
    }
  });
  const serializer = this.subject();

  const payload = {
      confirmStatus: 0,
      collaboratorCheck: false,
      availability: false
    },
    response = serializer.normalizeSingleResponse(
      store,
      'user/availability',
      payload
    );

  const expected = {
    data: {
      id: '_availability_',
      type: 'user/availability',
      attributes: {
        confirmStatus: 0,
        collaboratorCheck: false,
        availability: false
      }
    }
  };

  assert.deepEqual(
    response,
    expected,
    `Wrong response: ${JSON.stringify(response)}\n expected: ${JSON.stringify(
      expected
    )}`
  );
});
