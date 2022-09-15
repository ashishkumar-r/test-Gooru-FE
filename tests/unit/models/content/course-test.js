import Ember from 'ember';
import Unit from 'gooru-web/models/content/unit';
import Lesson from 'gooru-web/models/content/lesson';
import LessonItem from 'gooru-web/models/content/lessonItem';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('model:content/course', 'Unit | Model | content/course', {
  unit: true,
  needs: ['validator:presence']
});

test('get a child unit index', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Unit.create({
        id: '123',
        title: 'Unit#1'
      }),
      Unit.create({
        id: '456',
        title: 'Unit#2'
      }),
      Unit.create({
        id: '789',
        title: 'Unit#3'
      })
    ])
  });

  var unit = Unit.create({
    id: '456',
    title: 'Unit#2'
  });

  assert.equal(model.getChildUnitIndex(unit), 1, 'wrong unit index');
});

test('getCollectionsByType', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Unit.create({
        id: 1,
        children: Ember.A([
          Lesson.create({
            id: 10,
            children: Ember.A([
              LessonItem.create({
                format: 'assessment'
              }),
              LessonItem.create({
                format: 'assessment'
              }),
              LessonItem.create({
                format: 'collection'
              })
            ])
          }),
          Lesson.create({
            id: 12,
            children: Ember.A([
              LessonItem.create({
                format: 'assessment'
              }),
              LessonItem.create({
                format: 'collection'
              })
            ])
          })
        ])
      }),
      Unit.create({
        id: 2,
        children: Ember.A([
          Lesson.create({
            id: 20,
            children: Ember.A([
              LessonItem.create({
                format: 'collection'
              })
            ])
          }),
          Lesson.create({
            id: 21,
            children: Ember.A([
              LessonItem.create({
                format: 'assessment'
              })
            ])
          })
        ])
      })
    ])
  });

  assert.equal(
    model.getCollectionsByType('assessment').length,
    4,
    'Wrong total assessments'
  );
  assert.equal(
    model.getCollectionsByType('collection').length,
    3,
    'Wrong total collections'
  );
  assert.equal(
    model.getCollectionsByType('assessment', 1).length,
    3,
    'Wrong total assessments for unit 1'
  );
  assert.equal(
    model.getCollectionsByType('collection', 1).length,
    2,
    'Wrong total collections for unit 1'
  );
  assert.equal(
    model.getCollectionsByType('assessment', 1, 12).length,
    1,
    'Wrong total assessments for unit 1 and lesson 12'
  );
  assert.equal(
    model.getCollectionsByType('collection', 1, 12).length,
    1,
    'Wrong total collections for unit 1 and lesson 12'
  );
  assert.equal(
    model.getCollectionsByType('assessment', 2, 21).length,
    1,
    'Wrong total assessments for unit 2 and lesson 21'
  );
  assert.equal(
    model.getCollectionsByType('collection', 2, 21).length,
    0,
    'Wrong total collections for unit 2 and lesson 21'
  );
});

test('sortedUnitResults', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Unit.create({
        id: '123',
        title: 'Unit#1',
        sequence: 1
      }),
      Unit.create({
        id: '789',
        title: 'Unit#3',
        sequence: 3
      }),
      Unit.create({
        id: '456',
        title: 'Unit#2',
        sequence: 2
      })
    ])
  });

  assert.equal(
    model.get('sortedUnitResults')[0].title,
    'Unit#1',
    'Wrong sorted units'
  );
  assert.equal(
    model.get('sortedUnitResults')[1].title,
    'Unit#2',
    'Wrong sorted units'
  );
  assert.equal(
    model.get('sortedUnitResults')[2].title,
    'Unit#3',
    'Wrong sorted units'
  );
});
