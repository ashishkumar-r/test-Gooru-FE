import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Lesson from 'gooru-web/models/content/lesson';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

var configurationService = Ember.Object.create({
  configuration: {
    appRootPath: '/'
  }
});

moduleForComponent(
  'serializer:content/lesson',
  'Unit | Serializer | content/lesson'
);

test('serializeCreateLesson', function(assert) {
  const serializer = this.subject();

  const modelInstance = Lesson.create({
    id: 'lesson-id-123',
    sequence: 1,
    standards: [],
    title: 'Lesson Title'
  });

  const expected = {
    title: modelInstance.get('title'),
    taxonomy: null
  };

  const modelObject = serializer.serializeCreateLesson(modelInstance);
  assert.deepEqual(modelObject, expected, 'Serializer response');
});

test('normalizeLesson', function(assert) {
  const serializer = this.subject();

  const appRootPath = '/'; //default appRootPath
  serializer.set('configurationService', configurationService);

  const payload = {
    lesson_id: 'lesson-id-789',
    unit_id: 'unit-id-456',
    course_id: 'course-id-123',
    title: 'Lesson title',
    created_at: '2016-03-10T08:19:17Z',
    updated_at: '2016-03-10T08:19:17Z',
    creator_id: 'owner-id',
    modifier_id: 'owner-id',
    owner_id: 'owner-id',
    original_creator_id: null,
    original_lesson_id: null,
    metadata: null,
    taxonomy: ['K12.MA-MA2', 'K12.MA-MAK-CC'],
    sequence_id: 4,
    is_deleted: false,
    creator_system: 'gooru',
    collection_summary: [
      {
        id: 'collection-id-123',
        title: 'Collection title',
        format: 'collection',
        sequence_id: 1,
        thumbnail: '259b732c-2672-4780-9616-2c7a35d2d526.png',
        resource_count: 5,
        question_count: 5,
        oe_question_count: 15
      },
      {
        id: 'assessment-id-456',
        title: 'Assessment title',
        format: 'assessment',
        sequence_id: 2,
        thumbnail: null,
        resource_count: null,
        question_count: 10,
        oe_question_count: 12,
        url: 'any'
      }
    ]
  };

  const result = serializer.normalizeLesson(payload);
  assert.equal(result.get('id'), 'lesson-id-789', 'Wrong id');
  assert.equal(result.get('sequence'), 4, 'Wrong sequence');
  assert.equal(result.get('title'), 'Lesson title', 'Wrong title');
  assert.equal(result.get('taxonomy.length'), 2, 'Wrong taxonomy');
  assert.equal(result.get('children.length'), 2, 'Wrong children total');

  const child = result.get('children')[1];
  assert.equal(child.get('id'), 'assessment-id-456', 'Wrong id');
  assert.equal(child.get('title'), 'Assessment title', 'Wrong title');
  assert.equal(child.get('format'), 'assessment', 'Wrong format');
  assert.equal(child.get('url'), 'any', 'Wrong url');
  assert.equal(child.get('questionCount'), 10, 'Wrong question count');
  assert.equal(child.get('openEndedQuestionCount'), 12, 'Wrong question count');
  assert.equal(child.get('resourceCount'), 0, 'Wrong resource count');
  assert.equal(
    child.get('thumbnailUrl'),
    `${appRootPath}${DEFAULT_IMAGES.ASSESSMENT}`,
    'Wrong thumbnailUrl'
  );
});
test('serializeReorderLesson', function(assert) {
  const serializer = this.subject();
  const ids = ['a', 'b', 'c'];
  const data = serializer.serializeReorderLesson(ids);
  assert.ok(data.order, 'Missing order');
  assert.equal(data.order.length, 3, 'Wrong order total');
  assert.equal(data.order[0].id, 'a', 'Wrong id');
  assert.equal(data.order[0].sequence_id, 1, 'Wrong sequence id');
});
