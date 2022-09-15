import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:library/library',
  'Unit | Serializer | library/library'
);

test('normalizeFetchLibraries', function(assert) {
  const serializer = this.subject();
  const contentCdnUrl = 'content-url/';
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        user: contentCdnUrl
      }
    })
  );
  const librariesPayload = {
    libraries: [
      {
        id: 'library-id-1',
        name: 'name-1',
        short_name: 'name1',
        description: 'description-1',
        thumbnail: 'thumbnail-1',
        tenant: 'tenant-1',
        tenant_root: null,
        course_count: 5,
        assessment_count: 12,
        collection_count: 15,
        resource_count: 56,
        question_count: 45,
        rubric_count: 12,
        sequence_id: 1,
        taxonomy: null
      },
      {
        id: 'library-id-2',
        name: 'name-2',
        short_name: 'name2',
        description: 'description-2',
        thumbnail: 'thumbnail-2',
        tenant: 'tenant-2',
        tenant_root: null,
        course_count: 7,
        assessment_count: 10,
        collection_count: 9,
        resource_count: 46,
        question_count: 51,
        rubric_count: 9,
        sequence_id: 2,
        taxonomy: null
      }
    ]
  };
  const normalizedLibraries = serializer.normalizeFetchLibraries(
    librariesPayload
  );

  assert.equal(normalizedLibraries.length, 2, 'Wrong number of libraries');
  const library1 = normalizedLibraries.objectAt(0);

  assert.equal(library1.get('id'), 'library-id-1', 'Wrong library id');
  assert.equal(library1.get('name'), 'name-1', 'Wrong library name');
  assert.equal(library1.get('shortName'), 'name1', 'Wrong library short name');
  assert.equal(
    library1.get('description'),
    'description-1',
    'Wrong library description'
  );
  assert.equal(
    library1.get('image'),
    'content-url/thumbnail-1',
    'Wrong image name'
  );
  assert.equal(library1.get('tenantId'), 'tenant-1', 'Wrong tenant id');
  assert.equal(library1.get('tenantRoot'), null, 'Should be null');
  assert.equal(library1.get('courseCount'), 5, 'Wrong course count');
  assert.equal(library1.get('assessmentCount'), 12, 'Wrong assessment count');
  assert.equal(library1.get('collectionCount'), 15, 'Wrong collection count');
  assert.equal(library1.get('resourceCount'), 56, 'Wrong resource count');
  assert.equal(library1.get('questionCount'), 45, 'Wrong question count');
  assert.equal(library1.get('rubricCount'), 12, 'Wrong rubric count');
  assert.equal(library1.get('sequence'), 1, 'Wrong sequence');
  assert.equal(library1.get('taxonomy'), null, 'Should be null');
});

test('normalizeFetchLibraryContent', function(assert) {
  const serializer = this.subject();
  const contentCdnUrl = 'content-url/';
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: contentCdnUrl
      }
    })
  );

  let libraryContentPayload = Ember.Object.create({
    library: {
      id: 1,
      name: 'library name',
      description: 'library description'
    },
    library_contents: {
      courses: [
        {
          id: '48700459-cc80-4c54-9c2d-b013cd209722',
          title: 'Course - 1'
        },
        {
          id: '58700459-cc80-4c54-9c2d-b013cd209722',
          title: 'Course - 2'
        }
      ],
      owner_details: [
        {
          id: '416922ac-7404-400b-883a-4993e23d1c8f',
          username: 'szgooru',
          first_name: 'TestUpdaetd',
          last_name: 'Zope'
        }
      ]
    }
  });

  const contentType = 'course';
  const normalizedLibraries = serializer.normalizeFetchLibraryContent(
    contentType,
    libraryContentPayload
  );

  assert.equal(
    normalizedLibraries.get('libraryContent.courses').length,
    2,
    'Wrong number of courses'
  );
  assert.equal(
    normalizedLibraries.get('libraryContent.ownerDetails').length,
    1,
    'Wrong number of ownerDetails'
  );

  const library = normalizedLibraries.get('library');

  assert.equal(library.get('id'), 1, 'Wrong library id');
  assert.equal(library.get('name'), 'library name', 'Wrong library name');
  assert.equal(
    library.get('description'),
    'library description',
    'Wrong library description'
  );
});
