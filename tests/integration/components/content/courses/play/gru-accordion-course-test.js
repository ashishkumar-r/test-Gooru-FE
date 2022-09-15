import Ember from 'ember';
import BuilderItem from 'gooru-web/models/content/builder/item';
import Unit from 'gooru-web/models/content/unit';
import Lesson from 'gooru-web/models/content/lesson';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

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
  'content/courses/play/gru-accordion-course',
  'Integration | Component | content/courses/play/gru accordion course',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/unit', unitServiceStub);
      this.register('service:api-sdk/lesson', lessonServiceStub);
    }
  }
);

test('it renders correctly when there are no units', function(assert) {
  this.set('units', []);
  this.render(hbs`{{content/courses/play/gru-accordion-course items=units}}`);

  const $component = this.$(
    '.content.courses.gru-accordion-course.gru-accordion'
  );
  assert.ok($component.length, 'Component');

  const $listContainer = $component.find('> .accordion-course');

  assert.ok($listContainer.length, 'List container');
  assert.equal($listContainer.find('li').length, 0, 'No units by default');
});

test('it renders correctly when there are 2 or more units', function(assert) {
  this.set(
    'units',
    Ember.A([
      BuilderItem.create({
        data: Unit.create(Ember.getOwner(this).ownerInjection(), {
          id: '123',
          title: 'Sample Unit Title'
        })
      }),
      BuilderItem.create({
        data: Unit.create(Ember.getOwner(this).ownerInjection(), {
          id: '456',
          title: 'Another Unit Title'
        })
      })
    ])
  );

  this.render(hbs`{{content/courses/play/gru-accordion-course items=units}}`);

  const $component = this.$(
    '.content.courses.gru-accordion-course.gru-accordion'
  );
  assert.ok($component.length, 'Component');

  const $listContainer = $component.find('> .accordion-course');

  assert.ok($listContainer.length, 'List container');
  assert.equal($listContainer.find('> li').length, 2, 'Total Units');
});

test('it notifies the location when expanding and collapsing a unit', function(
  assert
) {
  assert.expect(5);
  this.set(
    'units',
    Ember.A([
      BuilderItem.create({
        data: Unit.create(Ember.getOwner(this).ownerInjection(), {
          id: '123',
          title: 'Sample Unit Title'
        })
      }),
      BuilderItem.create({
        data: Unit.create(Ember.getOwner(this).ownerInjection(), {
          id: '456',
          title: 'Another Unit Title'
        })
      })
    ])
  );

  let expanded = false;
  this.on('setLocation', function(unitId) {
    if (expanded) {
      assert.equal(unitId, '123', 'Wrong unit id when expanded');
    } else {
      assert.equal(unitId, undefined, 'Wrong unit id when collapsed');
    }
  });

  this.set(
    'course',
    Ember.Object.create({
      id: 'course-id'
    })
  );

  this.render(
    hbs`{{content/courses/play/gru-accordion-course model=course items=units onLocationChange='setLocation'}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion-course.gru-accordion'
  );
  assert.ok($component.length, 'Component');

  const $listContainer = $component.find('> .accordion-course');

  assert.ok($listContainer.length, 'List container');
  assert.equal($listContainer.find('> li').length, 2, 'Total Units');

  expanded = true;
  const $firstUnitContainer = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit:eq(0) > .view'
  );
  $firstUnitContainer.find('> .panel-heading > h3 > a').click(); //expand unit 1

  expanded = false;
  $firstUnitContainer.find('> .panel-heading > h3 > a').click(); //collapse unit 1
});

test('it notifies the location when expanding and collapsing a lesson', function(
  assert
) {
  assert.expect(9);
  this.set(
    'units',
    Ember.A([
      BuilderItem.create({
        data: Unit.create(Ember.getOwner(this).ownerInjection(), {
          id: '123',
          title: 'Sample Unit Title'
        }),
        isExpanded: true
      }),
      BuilderItem.create({
        data: Unit.create(Ember.getOwner(this).ownerInjection(), {
          id: '456',
          title: 'Another Unit Title'
        })
      })
    ])
  );

  let expanded = false;
  this.on('setLocation', function(unitId, lessonId) {
    if (expanded) {
      assert.equal(unitId, '123', 'Wrong unit id when expanded');
      assert.equal(lessonId, 'lesson-123', 'Wrong lesson id when expanded');
    } else {
      assert.equal(unitId, '123', 'Wrong unit id when collapsed');
      assert.equal(lessonId, undefined, 'Wrong lesson id when collapsed');
    }
  });

  this.set(
    'course',
    Ember.Object.create({
      id: 'course-id'
    })
  );

  this.render(
    hbs`{{content/courses/play/gru-accordion-course model=course items=units onLocationChange='setLocation'}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion-course.gru-accordion'
  );
  assert.ok($component.length, 'Component');

  const $listContainer = $component.find('> .accordion-course');

  assert.ok($listContainer.length, 'List container');
  assert.equal($listContainer.find('> li').length, 2, 'Total Units');

  expanded = true;
  const $firstUnitContainer = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit:eq(0) > .view'
  );
  const $lessonContainer = $firstUnitContainer.find(
    '.content.courses.gru-accordion.gru-accordion-lesson:eq(0) > .view'
  );
  $lessonContainer.find('> .panel-heading > h3 > a').click(); //expand lesson
  assert.ok(
    $lessonContainer.hasClass('expanded'),
    'Lesson container should be expanded'
  );

  expanded = false;
  $lessonContainer.find('> .panel-heading > h3 > a').click(); //collapse lesson
  assert.ok(
    !$lessonContainer.hasClass('expanded'),
    'Lesson container should not be expanded'
  );
});
