import Ember from 'ember';
import { moduleFor, test, skip } from 'ember-qunit';

import MapContext from 'gooru-web/models/map/map-context';
import { ASSESSMENT_SUB_TYPES } from 'gooru-web/config/config';

const sessionServiceStub = Ember.Service.extend({
  userId: '12345'
});
moduleFor(
  'serializer:map/navigate-map',
  'Unit | Serializer | map/navigate-map',
  {
    needs: ['service:configuration'],
    beforeEach: function() {
      this.register('service:session', sessionServiceStub);
      this.inject.service('session');
    }
  }
);

test('serializeMapContext', function(assert) {
  const serializer = this.subject();
  const model = MapContext.create({
    courseId: 'course_id',
    classId: 'class_id',
    unitId: 'unit_id',
    lessonId: 'lesson_id',
    collectionId: 'collection_id',
    collectionType: 'collection_type',
    collectionSubType: 'collection_subtype',
    itemId: 'current_item_id',
    itemType: 'current_item_type',
    status: 'state',
    pathId: 'path_id',
    score: 'score_percent'
  });
  const serialized = serializer.serializeMapContext(model);
  assert.equal(serialized.course_id, model.get('courseId'), 'Wrong course id');
  assert.equal(serialized.class_id, model.get('classId'), 'Wrong class id');
  assert.equal(serialized.unit_id, model.get('unitId'), 'Wrong unit id');
  assert.equal(serialized.lesson_id, model.get('lessonId'), 'Wrong lesson id');
  assert.equal(
    serialized.collection_id,
    model.get('collectionId'),
    'Wrong collection id'
  );
  assert.equal(
    serialized.collection_type,
    model.get('collectionType'),
    'Wrong collection type'
  );
  assert.equal(
    serialized.collection_subtype,
    model.get('collectionSubType'),
    'Wrong collection sub type'
  );
  assert.equal(
    serialized.current_item_id,
    model.get('itemId'),
    'Wrong item id'
  );
  assert.equal(
    serialized.current_item_type,
    model.get('itemType'),
    'Wrong item type'
  );
  assert.equal(serialized.state, model.get('status'), 'Wrong status');
  assert.equal(serialized.path_id, model.get('pathId'), 'Wrong path id');
  assert.equal(serialized.score_percent, model.get('score'), 'Wrong score');
});

test('normalizeMapContext', function(assert) {
  const serializer = this.subject();
  const payload = {
    course_id: 'courseId',
    class_id: 'classId',
    unit_id: 'unitId',
    lesson_id: 'lessonId',
    collection_id: 'collectionId',
    collection_type: 'collectionType',
    collection_subtype: 'collectionSubType',
    current_item_id: 'itemId',
    current_item_type: 'itemType',
    state: 'status',
    path_id: 'pathId',
    score_percent: 'score'
  };
  const model = serializer.normalizeMapContext(payload);
  assert.equal(model.get('courseId'), payload.course_id, 'Wrong course id');
  assert.equal(model.get('classId'), payload.class_id, 'Wrong class id');
  assert.equal(model.get('unitId'), payload.unit_id, 'Wrong unit id');
  assert.equal(model.get('lessonId'), payload.lesson_id, 'Wrong lesson id');
  assert.equal(
    model.get('collectionId'),
    payload.collection_id,
    'Wrong collection id'
  );
  assert.equal(
    model.get('collectionType'),
    payload.collection_type,
    'Wrong collection type'
  );
  assert.equal(
    model.get('collectionSubType'),
    payload.collection_subtype,
    'Wrong collection sub type'
  );
  assert.equal(model.get('itemId'), payload.current_item_id, 'Wrong item id');
  assert.equal(
    model.get('itemType'),
    payload.current_item_type,
    'Wrong item type'
  );
  assert.equal(model.get('status'), payload.state, 'Wrong status');
  assert.equal(model.get('pathId'), payload.path_id, 'Wrong path id');
  assert.equal(model.get('score'), payload.score_percent, 'Wrong score');
});

skip('normalizeMapSuggestion', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: '//basepath/'
      }
    })
  );
  const payload = {
    id: '123',
    title: 'Title',
    format: 'assessment',
    thumbnail: 'image',
    subformat: ASSESSMENT_SUB_TYPES.PRE_TEST
  };
  const model = serializer.normalizeMapSuggestion(payload);
  assert.equal(model.get('id'), payload.id, 'Wrong id');
  assert.equal(model.get('title'), payload.title, 'Wrong title');
  assert.equal(
    model.get('thumbnail'),
    `//basepath/${payload.thumbnail}`,
    'Wrong thumbnail'
  );
  assert.equal(model.get('type'), payload.format, 'Wrong type');
  assert.equal(model.get('subType'), payload.subformat, 'Wrong type');
});

skip('normalizeMapSuggestion backfill', function(assert) {
  const serializer = this.subject();
  const payload = {
    id: '123',
    title: 'Title',
    format: 'assessment',
    questionCount: '15',
    resourceCount: '3',
    subformat: null
  };
  const model = serializer.normalizeMapSuggestion(payload);
  assert.equal(model.get('id'), payload.id, 'Wrong id');
  assert.equal(model.get('title'), payload.title, 'Wrong title');
  assert.equal(model.get('type'), payload.format, 'Wrong type');
  assert.equal(
    model.get('questionCount'),
    payload.questionCount,
    'Wrong question count'
  );
  assert.equal(
    model.get('resourceCount'),
    payload.resourceCount,
    'Wrong resource count'
  );
  assert.equal(
    model.get('subType'),
    ASSESSMENT_SUB_TYPES.BACKFILL,
    'Wrong type'
  );
});

skip('normalizeMapSuggestion resource', function(assert) {
  const serializer = this.subject();
  const payload = {
    id: '123',
    title: 'Title',
    format: 'resource',
    subformat: ASSESSMENT_SUB_TYPES.PRE_TEST
  };
  const model = serializer.normalizeMapSuggestion(payload);
  assert.equal(model.get('id'), payload.id, 'Wrong id');
  assert.equal(model.get('title'), payload.title, 'Wrong title');
  assert.equal(model.get('type'), payload.format, 'Wrong type');
  assert.equal(
    model.get('subType'),
    ASSESSMENT_SUB_TYPES.RESOURCE,
    'Wrong type'
  );
});

skip('normalizeMapSuggestions', function(assert) {
  const serializer = this.subject();
  const payload = [
    {
      id: '123',
      title: 'Title',
      format: 'assessment',
      subformat: ASSESSMENT_SUB_TYPES.PRE_TEST
    },
    {
      id: '1234',
      title: 'Title',
      format: 'assessment',
      subformat: ASSESSMENT_SUB_TYPES.PRE_TEST
    }
  ];
  const models = serializer.normalizeMapSuggestions(payload);
  assert.equal(models.get('length'), 2, 'Wrong total suggestions');
});
