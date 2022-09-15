import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent(
  'serializer:content/alternate-path',
  'Unit | Serializer | content/alternate-path'
);

test('normalizeAlternatePath', function(assert) {
  const serializer = this.subject();
  const alternatePathData = {
    ctx_course_id: '8cdc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    ctx_unit_id: '1ddc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    ctx_lesson_id: '87dc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    ctx_collection_id: '97dc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    thumbnail: 'ae08615a-4cd7-4b73-9f96-e812443b5cb2.jpg',
    target_unit_id: null,
    id: 1,
    target_resource_id: '0cdc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    target_content_subtype: null,
    target_lesson_id: null,
    target_content_type: 'resource',
    title: 'Integers Video',
    target_course_id: null
  };
  const assessment = serializer.normalizeAlternatePath(alternatePathData);
  assert.equal(assessment.get('pathId'), 1, 'Wrong path id');
  assert.equal(assessment.get('title'), 'Integers Video', 'Wrong title');
  assert.equal(
    assessment.get('thumbnail'),
    'ae08615a-4cd7-4b73-9f96-e812443b5cb2.jpg',
    'Wrong thumbnail'
  );
  assert.equal(
    assessment.get('targetResourceId'),
    '0cdc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    'Wrong target resource id'
  );
  assert.equal(
    assessment.get('contextCourseId'),
    '8cdc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    'Wrong context course id'
  );
  assert.equal(
    assessment.get('contextUnitId'),
    '1ddc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    'Wrong context unit id'
  );
  assert.equal(
    assessment.get('contextLessonId'),
    '87dc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    'Wrong context lesson id'
  );
  assert.equal(
    assessment.get('contextCollectionId'),
    '97dc6f53-16c1-4092-9cd9-62ee9c9c8fdb',
    'Wrong context collection id'
  );
});

test('normalizeReadResourse for alternate paths', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const resourceData = {
    pathId: 1,
    contextCourseId: 'course-id',
    contextUnitId: 'unit-id',
    contextLessonId: 'lesson-id',
    contextCollectionId: 'assessment-id',
    targetResourceId: 'resource-id',
    targetContentSubtype: 'webpage_resource',
    targetContentType: 'resource',
    title: 'resource-title'
  };
  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(resource.get('id'), 'resource-id', 'Wrong resource id');
  assert.equal(
    resource.get('assessmentId'),
    'assessment-id',
    'Wrong assessmentId'
  );
  assert.equal(resource.get('format'), 'webpage', 'Wrong path id');
  assert.equal(resource.get('title'), 'resource-title', 'Wrong title');
});
