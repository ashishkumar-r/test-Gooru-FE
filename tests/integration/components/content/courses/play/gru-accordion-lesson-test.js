import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import BuilderItem from 'gooru-web/models/content/builder/item';
import Course from 'gooru-web/models/content/course';
import Lesson from 'gooru-web/models/content/lesson';
import LessonItem from 'gooru-web/models/content/lessonItem';
import Ember from 'ember';

const lessonServiceStub = Ember.Service.extend({
  fetchById(courseId, unitId, lessonId) {
    if (courseId && unitId && lessonId) {
      let lesson = Lesson.create(Ember.getOwner(this).ownerInjection(), {
        id: '123',
        sequence: 1,
        taxonomy: [],
        title: 'Sample Lesson Name',
        children: [
          LessonItem.create({
            id: 'collection-123',
            format: 'collection',
            sequence: 1,
            title: 'Collection Title'
          }),
          LessonItem.create({
            id: 'assessment-456',
            format: 'assessment',
            sequence: 2,
            title: 'Assessment Title'
          })
        ]
      });
      return Ember.RSVP.resolve(lesson);
    } else {
      return Ember.RSVP.reject('Fetch failed');
    }
  }
});

moduleForComponent(
  'content/courses/play/gru-accordion-lesson',
  'Integration | Component | content/courses/play/gru accordion lesson',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/lesson', lessonServiceStub);
      this.inject.service('api-sdk/lesson');
    }
  }
);

test('it renders the lesson correctly, if the lesson has no collections/assessments', function(
  assert
) {
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Sample Lesson Name'
    }),
    isEditing: false
  });

  this.set('lesson', lesson);
  this.set('index', 2);
  this.render(
    hbs`{{content/courses/play/gru-accordion-lesson model=lesson index=index}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('view'), 'View class');

  const $heading = $component.find('.view .panel-heading');
  assert.equal(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.lesson').string} ${this.get('index') + 1}`,
    'Header prefix'
  );
  assert.ok($heading.find('strong').text(), lesson.get('title'), 'Unit title');
  assert.equal(
    $heading.find('.detail > div > span').text(),
    `0 ${this.get('i18n').t('common.collection-pl', { count: 0 }).string}`,
    'Lesson text'
  );

  const $lessonList = $component.find('.view .panel-body ol.accordion-lesson');
  assert.ok($lessonList.length, 'Lesson items list');
  assert.ok(
    !$lessonList.find('> li.gru-accordion-lesson-item').length,
    'No lesson items by default'
  );
});

test('it expands/collapses the lesson', function(assert) {
  assert.expect(14);
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: false
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unitId', 'unit-id-123');
  this.set('lesson', lesson);
  let expectedExpanded = false;
  this.on('expandLesson', function(id, expanded) {
    //it should enter 4 times here
    assert.equal(id, '123', 'Wrong lesson id');
    assert.equal(expanded, expectedExpanded, 'Wrong expanded value');
  });

  this.render(hbs`
    {{content/courses/play/gru-accordion-lesson
      course=course
      unitId=unitId
      onExpandLesson=(action 'expandLesson')
      model=lesson }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok($container.hasClass('collapsed'), 'Container collapsed');

  expectedExpanded = true;
  $container.find('.panel-heading > h3 > a').click();
  assert.ok(
    $container.hasClass('expanded'),
    'Container expanded after clicking header prefix'
  );

  expectedExpanded = false;
  $container.find('.panel-heading > h3 > a').click();
  assert.ok(
    $container.hasClass('collapsed'),
    'Container collapsed after clicking header prefix'
  );

  expectedExpanded = true;
  $container.find('.panel-heading > strong > a').click();
  assert.ok(
    $container.hasClass('expanded'),
    'Container expanded after clicking header title'
  );

  expectedExpanded = false;
  $container.find('.panel-heading > strong > a').click();
  assert.ok(
    $container.hasClass('collapsed'),
    'Container collapsed after clicking header title'
  );
});

test('it loads lesson items and renders them after clicking on the lesson name', function(
  assert
) {
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      assessmentCount: 1,
      collectionCount: 1
    }),
    isEditing: false,
    isExpanded: false
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unitId', 'unit-id-123');
  this.set('lesson', lesson);
  this.set('isLoaded', false); // Binding to check on the state

  this.on('expandLesson', function(id, expanded) {
    assert.equal(id, '123', 'Wrong lesson id');
    assert.equal(expanded, true, 'Wrong expanded value');
  });

  this.render(hbs`
    {{content/courses/play/gru-accordion-lesson
      course=course
      unitId=unitId
      model=lesson
      onExpandLesson=(action 'expandLesson')
      isLoaded=isLoaded }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson > .view'
  );
  assert.ok($container.hasClass('collapsed'), 'Container collapsed');
  assert.ok(!this.get('isLoaded'), 'Data not loaded');

  $container.find('> .panel-heading > strong > a').click();
  assert.ok($container.hasClass('expanded'), 'Container expanded');
  assert.equal(
    $container.find('> .panel-heading .detail > div > span').text(),
    `1 ${this.get('i18n').t('common.assessment-pl', { count: 1 })
      .string}1 ${this.get('i18n').t('common.collection-pl', { count: 1 })
      .string}`,
    'Lesson text'
  );
  assert.equal(
    $container.find('.accordion-lesson > li.gru-accordion-lesson-item').length,
    2,
    'Number of lesson items loaded'
  );
  assert.ok(this.get('isLoaded'), 'Data was loaded');
});

test('The lesson is expanded by default ', function(assert) {
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: true
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unitId', 'unit-id-123');
  this.set('lesson', lesson);

  this.on('expandLesson', function() {
    assert.ok(false, 'Should not be called');
  });

  this.render(hbs`
    {{content/courses/play/gru-accordion-lesson
      course=course
      unitId=unitId
      onExpandLesson='expandLesson'
      model=lesson }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok($container.hasClass('expanded'), 'Container should be expanded');
});
