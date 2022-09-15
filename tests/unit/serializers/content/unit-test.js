import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Ember from 'ember';
import Lesson from 'gooru-web/models/content/lesson';
import Unit from 'gooru-web/models/content/unit';

moduleForComponent(
  'serializer:content/unit',
  'Unit | Serializer | content/unit'
);

test('serializeCreateUnit', function(assert) {
  const serializer = this.subject();
  const modelInstance = Unit.create({
    bigIdeas: 'Big ideas text',
    children: [],
    essentialQuestions: 'Essential Questions text',
    id: 'unit-id-123',
    lessonsTotal: 0,
    sequence: 1,
    title: 'Unit Title',
    taxonomy: []
  });
  const expected = {
    title: modelInstance.get('title'),
    big_ideas: modelInstance.get('bigIdeas'),
    essential_questions: modelInstance.get('essentialQuestions'),
    taxonomy: null
  };
  const modelObject = serializer.serializeCreateUnit(modelInstance);
  assert.deepEqual(modelObject, expected, 'Serializer response');
});

test('serializeUpdateUnit', function(assert) {
  const serializer = this.subject();
  const modelInstance = Unit.create({
    bigIdeas: 'Big ideas text',
    children: [],
    essentialQuestions: 'Essential Questions text',
    id: 'unit-id',
    lessonsTotal: 0,
    sequence: 1,
    title: 'Unit Title',
    taxonomy: []
  });
  const expected = {
    title: modelInstance.get('title'),
    big_ideas: modelInstance.get('bigIdeas'),
    essential_questions: modelInstance.get('essentialQuestions'),
    taxonomy: null
  };
  const modelObject = serializer.serializeUpdateUnit(modelInstance);
  assert.deepEqual(modelObject, expected, 'Serializer response');
});

test('normalizeUnit', function(assert) {
  const serializer = this.subject();
  const payload = {
    unit_id: 'unit-id',
    course_id: 'course-id',
    title: 'Unit title',
    created_at: '2016-03-10T08:08:02Z',
    updated_at: '2016-03-10T08:09:44Z',
    owner_id: 'owner-id',
    creator_id: 'owner-id',
    modifier_id: 'owner-id',
    original_creator_id: null,
    original_unit_id: null,
    big_ideas: 'Big ideas text',
    essential_questions: 'Essential questions text',
    metadata: null,
    taxonomy: {},
    sequence_id: 4,
    is_deleted: false,
    creator_system: 'gooru',
    lesson_summary: [
      {
        lesson_id: 'lesson-id-123',
        title: 'my lesson',
        sequence_id: 1,
        collection_count: null,
        assessment_count: null
      },
      {
        lesson_id: 'lesson-id-456',
        title: 'Lesson 1',
        sequence_id: 2,
        collection_count: 2,
        assessment_count: 2
      }
    ]
  };
  const expected = Unit.create(Ember.getOwner(this).ownerInjection(), {
    children: [
      Lesson.create(Ember.getOwner(this).ownerInjection(), {
        assessmentCount: 0,
        collectionCount: 0,
        id: payload.lesson_summary[0].lesson_id,
        sequence: payload.lesson_summary[0].sequence_id,
        title: payload.lesson_summary[0].title
      }),
      Lesson.create(Ember.getOwner(this).ownerInjection(), {
        assessmentCount: 2,
        collectionCount: 2,
        id: payload.lesson_summary[1].lesson_id,
        sequence: payload.lesson_summary[1].sequence_id,
        title: payload.lesson_summary[1].title
      })
    ],
    bigIdeas: payload.big_ideas,
    essentialQuestions: payload.essential_questions,
    id: payload.unit_id,
    lessonCount: payload.lesson_summary.length,
    sequence: payload.sequence_id,
    taxonomy: [],
    title: payload.title
  });
  const result = serializer.normalizeUnit(payload);
  assert.deepEqual(result, expected, 'Serialized response');
});

test('serializeReorderUnit', function(assert) {
  const serializer = this.subject();
  const ids = ['a', 'b', 'c'];
  const data = serializer.serializeReorderUnit(ids);
  assert.ok(data.order, 'Missing order');
  assert.equal(data.order.length, 3, 'Wrong order total');
  assert.equal(data.order[0].id, 'a', 'Wrong id');
  assert.equal(data.order[0].sequence_id, 1, 'Wrong sequence id');
});
