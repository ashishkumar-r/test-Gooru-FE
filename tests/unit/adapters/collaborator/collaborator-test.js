import { test } from 'ember-qunit';
import Ember from 'ember';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:collaborator/collaborator',
  'Unit | Adapter | collaborator/collaborator',
  {
    // needs: []
  }
);

test('updateCollaborators', function(assert) {
  const adapter = this.subject();
  assert.expect(3);

  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/10/collaborators',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.equal(
          requestBodyJson.collaborators.length,
          2,
          'Wrong number of collaborators'
        );
        assert.equal(
          requestBodyJson.collaborators[0],
          '1',
          'Wrong collaborator at index 0'
        );
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  var done = assert.async();
  adapter.updateCollaborators(10, 'collections', ['1', '2']).then(function() {
    assert.ok(true, 'Promise.then should be called');
    done();
  });
});
