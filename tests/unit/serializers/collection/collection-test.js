import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:collection/collection',
  'Unit | Serializer | collection/collection'
);

test('normalizeSingleResponse for findById', function(assert) {
  const serializer = this.subject();

  const payload = {
      summary: {
        resourceCount: 5,
        questionCount: 0
      },
      collectionType: 'collection',
      isCollaborator: false,
      collectionId: 24413363,
      settings: {
        comment: 'turn-on'
      },
      parentGooruOid: 'first-lesson-id',
      itemSequence: 2,
      type: 'collection',
      title: 'any-expected-title 1B',
      sharing: 'anyonewithlink',
      description: 'some description A1',
      collectionItems: [],
      permissions: [],
      audience: [
        {
          id: 195,
          name: 'All Students'
        }
      ],
      collectionItemId: '27c1bca1-3608-4a5e-9558-6642dc74bcb5',
      lastModified: 1448917633000,
      languageObjective: '',
      gooruOid: 'any-expected-1D',
      views: 0,
      user: {
        username: 'perezedify',
        showProfilePage: true,
        gooruUId: 'ff90e7e2-7788-48fb-9ce2-7b6d7a828840',
        profileImageUrl:
          'http://profile-qa.s3.amazonaws.com/ff90e7e2-7788-48fb-9ce2-7b6d7a828840.png'
      }
    },
    response = serializer.normalizeSingleResponse(
      'any store',
      'collection/collection',
      payload
    );

  const expected = {
    data: {
      type: 'collection/collection',
      id: 'any-expected-1D',
      attributes: {
        collectionType: 'collection',
        title: 'any-expected-title 1B',
        description: 'some description A1',
        imageUrl: '',
        resourceCount: 5,
        questionCount: 0,
        visibility: false
      },
      relationships: {
        resources: { data: [] }
      }
    },
    included: []
  };

  assert.deepEqual(
    response,
    expected,
    `${JSON.stringify(response)}\n${JSON.stringify(expected)}`
  );
});

test('normalizeQueryRecord for findByClassAndCourseAndUnitAndLesson', function(assert) {
  const serializer = this.subject();

  const payload = [
      {
        collectionType: 'assessment',
        title: 'any-expected-title B1',
        gooruOid: 'any-expected-1C',
        collectionId: 24413362,
        visibility: false
      },
      {
        collectionType: 'collection',
        title: 'any-expected-title B2',
        gooruOid: 'any-expected-2C',
        collectionId: 24413363,
        visibility: true
      }
    ],
    response = serializer.normalizeQueryRecordResponse(
      'any store',
      'collection/collection',
      payload
    );

  const expected = {
    data: [
      {
        type: 'collection/collection',
        id: 'any-expected-1C',
        attributes: {
          collectionType: 'assessment',
          title: 'any-expected-title B1',
          description: '',
          imageUrl: '',
          resourceCount: 0,
          questionCount: 0,
          visibility: false
        },
        relationships: {
          resources: { data: [] }
        }
      },
      {
        type: 'collection/collection',
        id: 'any-expected-2C',
        attributes: {
          collectionType: 'collection',
          title: 'any-expected-title B2',
          description: '',
          imageUrl: '',
          resourceCount: 0,
          questionCount: 0,
          visibility: true
        },
        relationships: {
          resources: { data: [] }
        }
      }
    ]
  };

  assert.deepEqual(
    response,
    expected,
    `${JSON.stringify(response)}\n${JSON.stringify(expected)}`
  );
});
