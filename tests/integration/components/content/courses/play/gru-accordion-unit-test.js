import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import BuilderItem from 'gooru-web/models/content/builder/item';
import Course from 'gooru-web/models/content/course';
import Lesson from 'gooru-web/models/content/lesson';
import Unit from 'gooru-web/models/content/unit';
import Ember from 'ember';

const unitServiceStub = Ember.Service.extend({
  fetchById(courseId, unitId) {
    if (courseId && unitId) {
      let unit = Unit.create(Ember.getOwner(this).ownerInjection(), {
        bigIdeas: 'Big ideas text',
        essentialQuestions: 'Essential questions text',
        id: '123',
        title: 'Sample Unit Name',
        children: [
          Lesson.create(Ember.getOwner(this).ownerInjection(), {
            id: 'lesson-123',
            sequence: 1,
            title: 'Lesson Title A'
          }),
          Lesson.create(Ember.getOwner(this).ownerInjection(), {
            id: 'lesson-456',
            sequence: 2,
            title: 'Lesson Title B'
          })
        ]
      });
      return Ember.RSVP.resolve(unit);
    } else {
      return Ember.RSVP.reject('Fetch failed');
    }
  }
});

const lessonServiceStub = Ember.Service.extend({
  fetchById(courseId, unitId, lessonId) {
    if (courseId && unitId && lessonId) {
      let lesson = Lesson.create(Ember.getOwner(this).ownerInjection(), {
        id: '123',
        sequence: 1,
        taxonomy: [],
        title: 'Sample Lesson Name',
        children: []
      });
      return Ember.RSVP.resolve(lesson);
    } else {
      return Ember.RSVP.reject('Fetch failed');
    }
  }
});

moduleForComponent(
  'content/courses/play/gru-accordion-unit',
  'Integration | Component | content/courses/play/gru accordion unit',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/unit', unitServiceStub);
      this.register('service:api-sdk/lesson', lessonServiceStub);
    }
  }
);

test('it renders the unit correctly, if the unit has no lessons', function(
  assert
) {
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Sample Unit Name'
    }),
    isEditing: false
  });

  this.set('index', 0);
  this.set('unit', unit);
  this.set('onExpandUnit', function() {
    assert.ok(true, 'Called onExpandUnit');
  });
  this.render(
    hbs`{{content/courses/play/gru-accordion-unit model=unit index=index onExpandUnit=onExpandUnit}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit.view'
  );
  assert.ok($component.length, 'Component');

  const $heading = $component.find('.view .panel-heading');
  assert.equal(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.unit').string} ${this.get('index') + 1}`,
    'Header prefix'
  );
  assert.ok($heading.find('strong').text(), unit.get('title'), 'Unit title');
  assert.equal(
    $heading.find('.detail > span').text(),
    `0 ${this.get('i18n').t('common.lessonObj', { count: 0 }).string}`,
    'Lesson text'
  );

  const $lessonList = $component.find('.view .panel-body ol.accordion-unit');
  assert.ok($lessonList.length, 'Lesson list');
  assert.equal(
    $lessonList.find('li.lesson').length,
    0,
    'No lessons by default'
  );
});

test('first unit should not be expanded', function(assert) {
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: false
  });

  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);
  this.render(hbs`
    {{content/courses/play/gru-accordion-unit
      course=course
      model=unit
      index=0
      onExpandUnit=(action 'externalAction') }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok(
    $container.hasClass('collapsed'),
    'First unit should not be expanded'
  );
});

test('it expands/collapses the unit', function(assert) {
  assert.expect(11);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: false
  });

  let expectedExpanded = false;
  this.on('externalAction', function(id, expanded) {
    assert.equal(id, '123', 'Wrong id');
    assert.equal(expanded, expectedExpanded, 'Should match');
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);
  this.render(hbs`
    {{content/courses/play/gru-accordion-unit
      course=course
      model=unit
      index=0
      onExpandUnit=(action 'externalAction') }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok(
    $container.hasClass('collapsed'),
    'Container should not be expanded'
  );

  expectedExpanded = true;
  $container.find('> .panel-heading > h3 > a').click();
  assert.ok(
    $container.hasClass('expanded'),
    'Container collapsed after clicking header prefix'
  );

  expectedExpanded = false;
  $container.find('> .panel-heading > strong > a').click();
  assert.ok(
    $container.hasClass('collapsed'),
    'Container expanded after clicking header title'
  );

  expectedExpanded = true;
  $container.find('> .panel-heading > strong > a').click();
  assert.ok(
    $container.hasClass('expanded'),
    'Container collapsed after clicking header title'
  );
});

test('when unit is expanded by default', function(assert) {
  assert.expect(2);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: true
  });

  this.on('externalAction', function() {
    assert.ok(false, 'this should not be called');
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);
  this.render(hbs`
    {{content/courses/play/gru-accordion-unit
      course=course
      model=unit
      index=0
      onExpandUnit=(action 'externalAction') }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok(
    $container.hasClass('expanded'),
    'Container should not be expanded'
  );
});

test('when unit and lesson are expanded by default', function(assert) {
  assert.expect(4);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: true
  });

  this.on('expandUnit', function() {
    assert.ok(false, 'this should not be called');
  });

  this.on('expandLesson', function() {
    assert.ok(false, 'this should not be called');
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);
  this.render(hbs`
    {{content/courses/play/gru-accordion-unit
      course=course
      model=unit
      index=0
      selectedLessonId='lesson-123'
      onExpandUnit=(action 'expandUnit')
      onExpandLesson=(action 'expandLesson')
      }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok(
    $container.hasClass('expanded'),
    'Container should not be expanded'
  );

  const $lessonContainer = $container.find(
    '.content.courses.gru-accordion.gru-accordion-lesson:eq(0) > .view'
  );
  assert.ok($lessonContainer.length, 'Container');
  assert.ok(
    $lessonContainer.hasClass('expanded'),
    'Lesson container should be expanded'
  );
});

test('when lesson is expanded, the event is notified', function(assert) {
  assert.expect(7);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: true
  });

  this.on('expandUnit', function() {
    assert.ok(false, 'this should not be called');
  });

  this.on('expandLesson', function(unitId, lessonId, expanded) {
    assert.ok(expanded, 'Expanded should be true');
    assert.equal(unitId, '123', 'Wrong unit id');
    assert.equal(lessonId, 'lesson-123', 'Wrong unit id');
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);
  this.render(hbs`
    {{content/courses/play/gru-accordion-unit
      course=course
      model=unit
      index=0
      onExpandUnit=(action 'expandUnit')
      onExpandLesson=(action 'expandLesson')
      }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok(
    $container.hasClass('expanded'),
    'Container should not be expanded'
  );

  const $lessonContainer = $container.find(
    '.content.courses.gru-accordion.gru-accordion-lesson:eq(0) > .view'
  );
  assert.ok($lessonContainer.length, 'Container');
  $lessonContainer.find('.panel-heading > h3 > a').click();
  assert.ok(
    $lessonContainer.hasClass('expanded'),
    'Lesson container should be expanded'
  );
});

test('Overview is visible on unit metadata', function(assert) {
  assert.expect(2);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      bigIdeas: '-Simplification and computation of numerical expressions.',
      essentialQuestions:
        '-How do I accurately evaluate and create numerical expressions using order of operations?'
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
  this.set('unit', unit);
  this.render(hbs`
    {{content/courses/play/gru-accordion-unit
      course=course
      model=unit
      index=0}}
    `);

  const $container = this.$('.view');
  const $overview = $container.find('.overview');
  assert.ok($container.length, 'Container');

  assert.ok($overview.length, 'Overview hidden by default');
});
