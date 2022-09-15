import Ember from 'ember';
import { module, test } from 'qunit';
import ContextMixin from '../../../../mixins/quizzes/context';
import CollectionModel from 'gooru-web/models/content/collection';

module('Unit | Mixin | quizzes/context');

test('createContext without context', function(assert) {
  let subject = Ember.Object.extend(ContextMixin).create();
  const params = {
    classId: 'class-id'
  };
  const collection = CollectionModel.create({
    id: 'collection-id',
    title: 'collection-title',
    isCollection: true,
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id'
  });
  subject.set('quizzesContextService', {
    createContext: context => {
      assert.equal(
        context.get('collectionId'),
        'collection-id',
        'Collection id should match'
      );
      assert.equal(
        context.get('title'),
        'collection-title',
        'Collection title should match'
      );
      assert.ok(context.get('isCollection'), 'Should show as collection');
      assert.deepEqual(
        context.get('contextMapping'),
        {},
        'Context should not have mapping'
      );
      return Ember.RSVP.resolve();
    }
  });
  let done = assert.async();
  subject.createContext(params, collection, false).then(done);
});

test('createContext with context', function(assert) {
  let subject = Ember.Object.extend(ContextMixin).create();
  const params = {
    classId: 'class-id',
    source: 'source-test'
  };
  const collection = CollectionModel.create({
    id: 'collection-id',
    title: 'collection-title',
    isCollection: false,
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id'
  });
  subject.set('quizzesContextService', {
    createContext: context => {
      assert.equal(
        context.get('collectionId'),
        'collection-id',
        'Collection id should match'
      );
      assert.equal(
        context.get('title'),
        'collection-title',
        'Collection title should match'
      );
      assert.notOk(context.get('isCollection'), 'Should show as collection');
      assert.equal(context.get('classId'), 'class-id', 'Class id should match');
      assert.equal(
        context.get('contextMapping.courseId'),
        'course-id',
        'Course id should match'
      );
      assert.equal(
        context.get('contextMapping.unitId'),
        'unit-id',
        'Unit id should match'
      );
      assert.equal(
        context.get('contextMapping.lessonId'),
        'lesson-id',
        'Lesson id should match'
      );
      assert.equal(
        context.get('contextMapping.eventSource'),
        'source-test',
        'event source should match'
      );
      return Ember.RSVP.resolve();
    }
  });
  let done = assert.async();
  subject.createContext(params, collection, true).then(done);
});
