import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import CollectionModel from 'gooru-web/models/content/collection';

moduleForService(
  'service:api-sdk/collection',
  'Unit | Service | api-sdk/collection',
  {
    needs: [
      'serializer:collection/collection',
      'model:collection/collection',
      'model:resource/resource',
      'adapter:collection/collection',
      'service:api-sdk/profile'
    ]
  }
);

test('createCollection', function(assert) {
  const service = this.subject();
  let collectionModel = Ember.Object.create();

  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/collections',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'collection-id' },
          ''
        ];
      },
      false
    );
  });

  service.set(
    'collectionSerializer',
    Ember.Object.create({
      serializeCreateCollection: function(collectionObject) {
        assert.deepEqual(
          collectionObject,
          collectionModel,
          'Wrong collection object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service.createCollection(collectionModel).then(function() {
    assert.equal(
      collectionModel.get('id'),
      'collection-id',
      'Wrong collection id'
    );
    done();
  });
});

test('readCollection', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';
  const expectedProfileId = 'profile-id';
  assert.expect(3);

  service.set(
    'collectionAdapter',
    Ember.Object.create({
      readCollection: function(collectionId) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong Collection id');

        return Ember.RSVP.resolve({
          id: collectionId,
          ownerId: expectedProfileId
        });
      }
    })
  );

  service.set(
    'collectionSerializer',
    Ember.Object.create({
      normalizeReadCollection: function(collectionData) {
        assert.deepEqual(
          collectionData,
          {
            id: expectedCollectionId,
            ownerId: expectedProfileId,
            question_count: 0,
            resource_count: 0
          },
          'Wrong Collection data'
        );
        return Ember.Object.create(collectionData);
      }
    })
  );
  service.set(
    'profileService',
    Ember.Object.create({
      readUserProfile: function(profileId) {
        assert.equal(profileId, expectedProfileId, 'Wrong Profile id');
        return Ember.RSVP.resolve(
          Ember.Object.create({ id: expectedProfileId })
        );
      }
    })
  );
  var done = assert.async();
  service.readCollection(expectedCollectionId).then(function() {
    done();
  });
});

test('updateCollection', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';
  const expectedCollectionModel = CollectionModel.create({
    title: 'Collection title'
  });

  assert.expect(3);

  service.set(
    'collectionSerializer',
    Ember.Object.create({
      serializeUpdateCollection: function(collectionModel) {
        assert.deepEqual(
          collectionModel,
          expectedCollectionModel,
          'Wrong collection model'
        );
        return {};
      }
    })
  );
  service.set(
    'collectionAdapter',
    Ember.Object.create({
      updateCollection: function(collectionId) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collectionId) {
    assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .updateCollection(expectedCollectionId, expectedCollectionModel)
    .then(function() {
      done();
    });
});

test('updateCollectionTitle', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';

  assert.expect(3);

  service.set(
    'collectionSerializer',
    Ember.Object.create({
      serializeUpdateCollectionTitle: function(title) {
        assert.equal(title, 'title', 'Wrong title');
        return {};
      }
    })
  );
  service.set(
    'collectionAdapter',
    Ember.Object.create({
      updateCollection: function(collectionId) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collectionId) {
    assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service.updateCollectionTitle(expectedCollectionId, 'title').then(function() {
    done();
  });
});

test('reorderCollection', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';

  assert.expect(5);

  service.set(
    'collectionSerializer',
    Ember.Object.create({
      serializeReorderCollection: function(resourceIds) {
        assert.equal(resourceIds.length, 2, 'Wrong total resources');
        assert.equal(resourceIds[0], 'a', 'Wrong id at index 0');
        return 'fake-data';
      }
    })
  );
  service.set(
    'collectionAdapter',
    Ember.Object.create({
      reorderCollection: function(collectionId, data) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        assert.equal(
          data,
          'fake-data',
          'Wrong data parameter coming from serializer'
        );
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collectionId) {
    assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service.reorderCollection(expectedCollectionId, ['a', 'b']).then(function() {
    done();
  });
});

/*test('findByClassAndCourseAndUnitAndLesson', function (assert) {
  const service = this.subject();
  const response = [
      {
        "collectionType": "assessment",
        "title": "Creating properties assessment",
        "gooruOid": "5028ac7f-82da-4f09-998b-ecf480d4b984",
        "collectionId": 24413362,
        "visibility": false
      },
      {
        "collectionType": "collection",
        "title": "Properties resource collection",
        "gooruOid": "363d3cc2-f2ac-490d-a870-42167f204c97",
        "collectionId": 24413363,
        "visibility": false
      }
    ];
  const routes = function () {
      this.get('/gooruapi/rest/v3/class/123/course/456/unit/789/lesson/abc', function () {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(response)];
      }, 0);
    };

  this.pretender.map(routes);

  var done = assert.async();

  const promise = service.findByClassAndCourseAndUnitAndLesson('123','456','789','abc');
  promise.then(function(collections){
    assert.equal(collections.get('length'), 2, 'Missing classes');
    const firstCollection = collections.get('firstObject');
    assert.equal(firstCollection.get('id'), '5028ac7f-82da-4f09-998b-ecf480d4b984', 'Wrong id');
    assert.equal(firstCollection.get('collectionType'), 'assessment', 'Wrong collection type');
    assert.equal(firstCollection.get('title'), 'Creating properties assessment', 'Wrong title');
    assert.equal(firstCollection.get('visibility'), false, 'Wrong visibility');
    const otherCollection = collections.objectAt(1);
    assert.equal(otherCollection.get('id'), '363d3cc2-f2ac-490d-a870-42167f204c97', 'Wrong id');
    assert.equal(otherCollection.get('collectionType'), 'collection', 'Wrong collection type');
    assert.equal(otherCollection.get('title'), 'Properties resource collection', 'Wrong title');
    assert.equal(otherCollection.get('visibility'), false, 'Wrong visibility');
    done();
  });
});

test('findById', function (assert) {
  const service = this.subject();

  const
    response = {
      "summary": {
        "resourceCount": 0,
        "questionCount": 0
      },
      "collectionType": "collection",
      "isCollaborator": false,
      "collectionId": 24413363,
      "settings": {
        "comment": "turn-on"
      },
      "parentGooruOid": "first-lesson-id",
      "itemSequence": 2,
      "type": "collection",
      "title": "Properties resource collection",
      "sharing": "anyonewithlink",
      "description": "Any description",
      "collectionItems": [],
      "permissions": [],
      "audience": [
        {
          "id": 195,
          "name": "All Students"
        }
      ],
      "collectionItemId": "27c1bca1-3608-4a5e-9558-6642dc74bcb5",
      "lastModified": 1448917633000,
      "languageObjective": "",
      "gooruOid": "363d3cc2-f2ac-490d-a870-42167f204c97",
      "views": 0,
      "user": {
        "username": "perezedify",
        "showProfilePage": true,
        "gooruUId": "ff90e7e2-7788-48fb-9ce2-7b6d7a828840",
        "profileImageUrl": "http://profile-qa.s3.amazonaws.com/ff90e7e2-7788-48fb-9ce2-7b6d7a828840.png"
      }
    },
    routes = function () {
      this.get('/gooruapi/rest/v3/collection/123', function () {
        return [200, {'Content-Type': 'application/json'}, JSON.stringify(response)];
      }, 0);
    };

  this.pretender.map(routes);

  var done = assert.async();
  Ember.run(function () {
    const promise = service.findById('123');
    promise.then(function (collectionItem) {
      assert.equal(collectionItem.get('id'), '363d3cc2-f2ac-490d-a870-42167f204c97', 'Wrong id');
      assert.equal(collectionItem.get('collectionType'), 'collection', 'Wrong collection type');
      assert.equal(collectionItem.get('title'), 'Properties resource collection', 'Wrong title');
      assert.equal(collectionItem.get('description'), 'Any description', 'Wrong description');
      assert.equal(collectionItem.get('imageUrl'), '', 'wrong imageUrl');
      assert.equal(collectionItem.get('resourceCount'), '0', 'Wrong resource count');
      assert.equal(collectionItem.get('questionCount'), '0', 'Wrong question count');
      done();
    });
  });
});*/

test('addResource', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';
  const expectedResourceId = 'resource-id';

  assert.expect(3);

  service.set(
    'collectionAdapter',
    Ember.Object.create({
      addResource: function(collectionId, resourceId) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        assert.equal(resourceId, expectedResourceId, 'Wrong resource id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collectionId) {
    assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .addResource(expectedCollectionId, expectedResourceId)
    .then(function() {
      done();
    });
});

test('addQuestion', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';
  const expectedQuestionId = 'question-id';

  assert.expect(3);

  service.set(
    'collectionAdapter',
    Ember.Object.create({
      addQuestion: function(collectionId, questionId) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collectionId) {
    assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .addQuestion(expectedCollectionId, expectedQuestionId)
    .then(function() {
      done();
    });
});

test('deleteCollection', function(assert) {
  const expectedCollectionId = 'collection-id';
  const service = this.subject();

  assert.expect(2);

  service.set(
    'collectionAdapter',
    Ember.Object.create({
      deleteCollection: function(collectionId) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collectionId) {
    assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service.deleteCollection('collection-id').then(function() {
    done();
  });
});

test('copyCollection', function(assert) {
  const service = this.subject();

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/collections/collection-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-collection-id' },
          ''
        ];
      },
      false
    );
  });

  var done = assert.async();
  service.copyCollection('collection-id').then(function(response) {
    assert.equal(response, 'copy-collection-id', 'Wrong collection id');
    done();
  });
});

test('notifyQuizzesCollectionChange', function(assert) {
  const service = this.subject();
  const expectedCollectionId = 'collection-id';

  assert.expect(2);

  service.set(
    'quizzesCollectionService',
    Ember.Object.create({
      notifyCollectionChange: function(collectionId, type) {
        assert.equal(collectionId, expectedCollectionId, 'Wrong collection id');
        assert.equal(type, 'collection', 'Wrong type');
        return Ember.RSVP.resolve();
      }
    })
  );
  var done = assert.async();
  service.notifyQuizzesCollectionChange(expectedCollectionId).then(function() {
    done();
  });
});
