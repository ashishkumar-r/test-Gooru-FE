import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import { ENTITY_TYPE } from 'gooru-web/config/config';

moduleForService('service:api-sdk/media', 'Unit | Service | api-sdk/media', {
  needs: ['adapter:media']
});

test('Upload content file', function(assert) {
  const service = this.subject();
  let file = Ember.Object.create();
  let expected = {
    filename: 'image-id.png'
  };
  service.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  let entityType = ENTITY_TYPE.CONTENT;

  assert.expect(3);

  service.set(
    'mediaAdapter',
    Ember.Object.create({
      uploadFile: function(fileData, type) {
        assert.deepEqual(type, entityType, 'Wrong type');
        assert.deepEqual(fileData, file, 'Wrong file object');
        return Ember.RSVP.resolve(expected);
      }
    })
  );

  var done = assert.async();
  service.uploadContentFile(file).then(function(response) {
    assert.equal(
      response,
      'http://test-bucket01.s3.amazonaws.com/image-id.png',
      'Wrong image id'
    );
    done();
  });
});

test('Upload user file', function(assert) {
  const service = this.subject();
  let file = Ember.Object.create();
  let expected = {
    filename: 'image-id.png'
  };
  service.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        user: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  let entityType = ENTITY_TYPE.USER;

  assert.expect(3);

  service.set(
    'mediaAdapter',
    Ember.Object.create({
      uploadFile: function(fileData, type) {
        assert.deepEqual(type, entityType, 'Wrong type');
        assert.deepEqual(fileData, file, 'Wrong file object');
        return Ember.RSVP.resolve(expected);
      }
    })
  );

  var done = assert.async();
  service.uploadUserFile(file).then(function(response) {
    assert.equal(
      response,
      'http://test-bucket01.s3.amazonaws.com/image-id.png',
      'Wrong image id'
    );
    done();
  });
});
