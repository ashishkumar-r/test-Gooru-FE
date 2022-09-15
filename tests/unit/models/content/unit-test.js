import Ember from 'ember';
import Lesson from 'gooru-web/models/content/lesson';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('model:content/unit', 'Unit | Model | content/unit', {
  unit: true,
  needs: ['validator:presence']
});

test('get a child lesson index', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Lesson.create({
        id: '123',
        title: 'Lesson#1'
      }),
      Lesson.create({
        id: '456',
        title: 'Lesson#2'
      }),
      Lesson.create({
        id: '789',
        title: 'Lesson#3'
      })
    ])
  });

  var lesson = Lesson.create({
    id: '789',
    title: 'Lesson#3'
  });

  assert.equal(model.getChildLessonIndex(lesson), 2, 'wrong lesson index');
});

test('sortedLessonResults', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Lesson.create({
        id: '123',
        title: 'Lesson#1',
        sequence: 1
      }),
      Lesson.create({
        id: '789',
        title: 'Lesson#3',
        sequence: 3
      }),
      Lesson.create({
        id: '456',
        title: 'Lesson#2',
        sequence: 2
      })
    ])
  });

  assert.equal(
    model.get('sortedLessonResults')[0].title,
    'Lesson#1',
    'Wrong sorted lessons'
  );
  assert.equal(
    model.get('sortedLessonResults')[1].title,
    'Lesson#2',
    'Wrong sorted lessons'
  );
  assert.equal(
    model.get('sortedLessonResults')[2].title,
    'Lesson#3',
    'Wrong sorted lessons'
  );
});
