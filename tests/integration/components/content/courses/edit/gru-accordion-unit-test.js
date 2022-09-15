import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import BuilderItem from 'gooru-web/models/content/builder/item';
import Course from 'gooru-web/models/content/course';
import Lesson from 'gooru-web/models/content/lesson';
import LessonItem from 'gooru-web/models/content/lessonItem';
import Unit from 'gooru-web/models/content/unit';
import Ember from 'ember';

const unitServiceStub = Ember.Service.extend({
  createUnit(courseId, unit) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (courseId === 'course-id-fail' || !unit) {
        reject({ status: 500 });
      } else {
        unit.set('id', 'unit-id-123');
        resolve(unit);
      }
    });
  },

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
  },

  updateUnit(courseId, unit) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (courseId === 'course-id-fail' || !unit) {
        reject({ status: 500 });
      } else {
        resolve(unit);
      }
    });
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
  'content/courses/edit/gru-accordion-unit',
  'Integration | Component | content/courses/edit/gru accordion unit',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/unit', unitServiceStub);
      this.inject.service('api-sdk/unit');

      this.register('service:api-sdk/lesson', lessonServiceStub);
      this.inject.service('api-sdk/lesson');
    }
  }
);

test('it renders a form for a new unit', function(assert) {
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: true
  });

  this.set('unit', unit);
  this.set('totalItems', 3);
  this.render(
    hbs`{{content/courses/edit/gru-accordion-unit model=unit totalItems=3}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('edit'), 'Edit class');

  const $heading = $component.find('.edit .panel-heading');
  assert.ok(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.unit').string} ${this.get('totalItems')}`,
    'Header prefix'
  );
  assert.ok($heading.find('.title').text(), '', 'Empty title');
  assert.equal(
    $heading.find('.actions button').length,
    2,
    'Unit header action buttons'
  );
  assert.ok(
    $heading.find('.actions button:eq(0)').hasClass('cancel'),
    'First button is cancel'
  );
  assert.ok(
    $heading.find('.actions button:eq(1)').hasClass('save'),
    'Second button is save'
  );

  const $panelBody = $component.find('.edit .panel-body');
  assert.ok(
    $panelBody.find('> .row .col-sm-6 label textarea').length,
    2,
    'Text areas'
  );
  assert.ok($panelBody.find('> .data-row.domain').length, 'Domain');
});

test('it can create a new unit', function(assert) {
  const title = 'New Unit';

  var unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: false
  });

  this.set('unit', unit);
  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.render(hbs`{{content/courses/edit/gru-accordion-unit
    course=course
    model=unit }}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('view'), 'View mode');

  const $editButton = $component.find(
    '.view .detail .item-actions .btn.edit-item'
  );

  Ember.run(() => {
    $editButton.click();
  });

  assert.ok($component.hasClass('edit'), 'Edit mode');

  // Form has current unit values
  const $panelBody = $component.find('.edit .panel-body');

  assert.equal(
    $component.find('.edit .panel-heading .title input').val(),
    '',
    'Unit title'
  );
  assert.equal(
    $panelBody.find('.big-ideas label textarea').val(),
    '',
    'Big ideas text'
  );
  assert.equal(
    $panelBody.find('.essential-questions label textarea').val(),
    '',
    'Essential questions text'
  );

  $component.find('.edit .panel-heading .title input').val(title);
  $component.find('.edit .panel-heading .title input').blur();

  const $saveButton = $component.find(
    '.edit .panel-heading .actions button:eq(1)'
  );

  Ember.run(() => {
    $saveButton.click();
  });

  const $heading = $component.find('.view .panel-heading');
  assert.equal($heading.find('strong').text(), title, 'Unit title updated');

  unit = this.get('unit');
  assert.equal(
    unit.get('data.id'),
    'unit-id-123',
    'Unit ID updated after saving'
  );
  assert.equal(unit.get('isEditing'), false, 'Unit is no longer editable');
});

/*
// TODO: Fix test per changes in 1149

test('it can edit an existing unit', function (assert) {

  const title = 'Unit Title Updated';

  var unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: 'unit-123',
      title: 'Unit Title',
      bigIdeas: 'Big ideas text',
      essentialQuestions: 'Essential questions text'
    }),
    isEditing: false
  });

  this.set('unit', unit);
  this.set('course', Course.create({
    id: 'course-id-123'
  }));
  this.render(hbs`{{content/courses/edit/gru-accordion-unit
    course=course
    model=unit }}`);

  const $component = this.$('.content.courses.gru-accordion.gru-accordion-unit');
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('view'), 'View mode');

  const $editButton = $component.find('.view .detail .item-actions .btn.edit-item');

  Ember.run(() => {
    $editButton.click();
  });

  assert.ok($component.hasClass('edit'), 'Edit mode');

  // Form has current unit values
  const $panelBody = $component.find('.edit .panel-body');

  assert.equal($component.find('.edit .panel-heading .title input').val(), unit.get('data.title'), 'Unit title');
  assert.equal($panelBody.find('.big-ideas label textarea').val(), unit.get('data.bigIdeas'), 'Big ideas text');
  assert.equal($panelBody.find('.essential-questions label textarea').val(), unit.get('data.essentialQuestions'), 'Essential questions text');

  $component.find('.edit .panel-heading .title input').val(title);
  $component.find('.edit .panel-heading .title input').blur();

  const $saveButton = $component.find('.edit .panel-heading .actions button:eq(1)');

  Ember.run(() => {
    $saveButton.click();
  });

  const $heading = $component.find('> .view > .panel-heading');
  assert.equal($heading.find('strong').text(), title, 'Unit title updated');
  assert.equal(unit.get('isEditing'), false, 'Unit is no longer editable');
});
*/

test('it shows an error message when there is no title for a new unit', function(
  assert
) {
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: true
  });

  this.set('unit', unit);
  this.render(hbs`{{content/courses/edit/gru-accordion-unit model=unit}}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  assert.ok($component.length, 'Component displayed');
  assert.ok($component.hasClass('edit'), 'Edit class');

  const $heading = $component.find('.edit .panel-heading');
  assert.ok($heading.find('.title').text(), '', 'Empty title');

  const $saveButton = $heading.find('.actions .save.btn');
  assert.ok($saveButton.length, 'Save button is displayed');

  Ember.run(() => {
    $saveButton.click();
  });

  assert.ok(
    $heading.find('.title .error-messages .error').length,
    'Show message error for title'
  );
});

test('it shows an error message if it fails to create a new unit', function(
  assert
) {
  assert.expect(1);

  const context = this;

  // Mock notifications service
  this.register(
    'service:notifications',
    Ember.Service.extend({
      error(message) {
        assert.equal(
          message,
          context.get('i18n').t('common.errors.unit-not-created').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: true
  });

  this.set('unit', unit);
  this.set(
    'course',
    Course.create({
      id: 'course-id-fail'
    })
  );
  this.render(hbs`{{content/courses/edit/gru-accordion-unit
    course=course
    model=unit }}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  assert.ok($component.length, 'Component');

  const $saveButton = $component.find(
    '.edit .panel-heading .actions button:eq(1)'
  );
  $saveButton.click();
});

test('it renders a form when editing an existing unit', function(assert) {
  const unitData = {
    bigIdeas: 'Big ideas text',
    essentialQuestions: 'Essential questions text',
    id: '123',
    title: 'Sample Unit Name'
  };

  // Unit model
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), unitData),
    isEditing: true
  });

  const tempUnit = Unit.create(Ember.getOwner(this).ownerInjection(), unitData);

  this.set('unit', unit);
  this.set('tempUnit', tempUnit);
  this.set('index', 2);
  this.render(
    hbs`{{content/courses/edit/gru-accordion-unit model=unit tempUnit=tempUnit index=index}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('edit'), 'Edit class');

  const $heading = $component.find('.edit .panel-heading');
  assert.equal(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.unit').string} ${this.get('index') + 1}`,
    'Header prefix'
  );
  assert.ok(
    $heading.find('.gru-input.title').text(),
    unit.get('data.title'),
    'Unit title'
  );
  assert.equal(
    $heading.find('.actions button').length,
    2,
    'Unit header action buttons'
  );
  assert.ok(
    $heading.find('.actions button:eq(0)').hasClass('cancel'),
    'First button is cancel'
  );
  assert.ok(
    $heading.find('.actions button:eq(1)').hasClass('save'),
    'Second button is save'
  );

  const $panelBody = $component.find('.edit .panel-body');
  assert.ok(
    $panelBody.find('> .row .col-sm-6 label textarea').length,
    2,
    'Text areas'
  );
  assert.equal(
    $panelBody.find('.big-ideas textarea').val(),
    tempUnit.get('bigIdeas'),
    'First textarea content'
  );
  assert.equal(
    $panelBody.find('.essential-questions textarea').val(),
    tempUnit.get('essentialQuestions'),
    'Second textarea content'
  );

  assert.ok($panelBody.find('> .data-row.domain').length, 'Domain');
  assert.ok(
    $panelBody.find('> .data-row.domain button.add-domain:disabled').length,
    'Domain button should be disabled'
  );
  assert.ok(
    $panelBody.find('> .data-row.domain span.legend').length,
    'Add domain legend should be visible'
  );
});

test('it triggers an external event when clicking cancel on a new unsaved unit', function(
  assert
) {
  assert.expect(1);

  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: true
  });

  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set('unit', unit);
  this.render(
    hbs`{{content/courses/edit/gru-accordion-unit model=unit onCancelAddUnit=(action 'externalAction')}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  $component.find('.edit .actions button.cancel').click();
});

test('it renders the unit correctly, if the unit has no lessons -view mode', function(
  assert
) {
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Sample Unit Name',
      sequence: 1
    }),
    isEditing: false
  });

  this.set('unit', unit);
  this.render(hbs`{{content/courses/edit/gru-accordion-unit model=unit }}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('view'), 'View class');

  const $heading = $component.find('.view .panel-heading');
  assert.ok(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.unit').string} ${unit.get('sequence')}`,
    'Header prefix'
  );
  assert.ok($heading.find('strong').text(), unit.get('title'), 'Unit title');
  assert.equal(
    $heading.find('.detail > span').text(),
    this.get('i18n').t('common.add-lessons').string,
    'Lesson text'
  );
  assert.equal(
    $heading.find('.actions button').length,
    6,
    'Unit header action buttons'
  );
  assert.ok(
    $heading.find('.actions button:eq(0)').hasClass('add-item'),
    'First button is for adding a lesson'
  );
  assert.ok(
    $heading.find('.actions button:eq(1)').hasClass('sort-items'),
    'Second button is for sorting the lessons in the unit'
  );
  assert.ok(
    $heading.find('.actions button:eq(2)').hasClass('delete-item'),
    'Third button is for deleting the unit'
  );
  assert.ok(
    $heading.find('.actions button:eq(3)').hasClass('move-item'),
    'Fourth button is for moving the unit'
  );
  assert.ok(
    $heading.find('.actions button:eq(4)').hasClass('copy-item'),
    'Fifth button is for copying the unit'
  );
  assert.ok(
    $heading.find('.actions button:eq(5)').hasClass('edit-item'),
    'Sixth button is for editing the unit'
  );

  const $lessonList = $component.find('.view .panel-body ol.accordion-unit');
  assert.ok($lessonList.length, 'Lesson list');
  assert.equal(
    $lessonList.find('li.lesson').length,
    1,
    'Number of lessons by default'
  );
  assert.ok(
    $lessonList.find('li:eq(0)').hasClass('add-item'),
    'Default lesson'
  );
});

test('it expands/collapses the unit -view mode', function(assert) {
  assert.expect(14);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123'
    }),
    isEditing: false,
    isExpanded: false
  });

  let expectedExpanded = false;
  let expectedId = '123';
  this.on('externalAction', function(id, expanded) {
    assert.equal(id, expectedId, 'Wrong id');
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
    {{content/courses/edit/gru-accordion-unit
      course=course
      model=unit
      onExpandUnit=(action 'externalAction') }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok($container.hasClass('collapsed'), 'Container collapsed');

  expectedExpanded = true;
  $container.find('> .panel-heading > a').click();
  assert.ok(
    $container.hasClass('expanded'),
    'Container expanded after clicking header prefix'
  );

  expectedExpanded = false;
  $container.find('> .panel-heading > a').click();
  assert.ok(
    $container.hasClass('collapsed'),
    'Container collapsed after clicking header prefix'
  );

  expectedExpanded = true;
  $container.find('> .panel-heading .actions .add-item').click();
  assert.ok(
    $container.hasClass('expanded'),
    'Container expanded after clicking the add button'
  );

  expectedExpanded = true;
  $container.find('> .panel-heading .actions .add-item').click();
  assert.ok(
    !$container.hasClass('collapsed'),
    'Container should remain expanded after clicking the add button'
  );
});

test('it loads lessons and renders them after clicking on the unit name', function(
  assert
) {
  assert.expect(6);
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      lessonCount: 2
    }),
    isEditing: false,
    isExpanded: false
  });

  //onExpandUnit action must be defined
  this.on('externalAction', function(id, expanded) {
    assert.equal(id, '123', 'Wrong id');
    assert.equal(expanded, true, 'Should match');
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);
  this.set('isLoaded', false); // Binding to check on the state

  this.render(hbs`
    {{content/courses/edit/gru-accordion-unit
      course=course
      model=unit
      isLoaded=isLoaded
      onExpandUnit=(action 'externalAction') }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  assert.ok($container.length, 'Container');
  assert.ok(!this.get('isLoaded'), 'Data not loaded');

  $container.find('> .panel-heading > a').click();
  assert.equal(
    $container.find('.accordion-unit > li.gru-accordion-lesson').length,
    2,
    'Number of lessons loaded'
  );
  assert.ok(this.get('isLoaded'), 'Data was loaded');
});

test('it offers the ability to reorder the lessons', function(assert) {
  const unit = BuilderItem.create({
    data: Unit.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      isSorting: false,
      lessonCount: 2
    }),
    isEditing: false,
    isExpanded: false
  });

  //onExpandUnit action must be defined
  this.on('externalAction', function() {
    assert.ok(true, 'called externalAction');
  });

  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unit', unit);

  this.render(hbs`
    {{content/courses/edit/gru-accordion-unit
      course=course
      model=unit
      onExpandUnit=(action 'externalAction') }}
    `);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-unit > .view'
  );
  const $heading = $container.find('> .panel-heading');
  const $accordion = $container.find('> .panel-body > .accordion-unit');

  assert.ok($container.length, 'Container');
  assert.ok($container.hasClass('collapsed'), 'Container collapsed');
  assert.ok($accordion.hasClass('sortable'), 'Class to enable reordering');
  assert.ok(
    $accordion.hasClass('ui-sortable'),
    'Reordering capability installed'
  );
  assert.notOk(
    $accordion.hasClass('sorting'),
    'Class when reordering is active is not present'
  );

  $heading.find('> .detail > .actions > .sort-items').click();

  assert.ok(
    $container.hasClass('expanded'),
    'Container expanded after clicking the sort button'
  );
  assert.ok(
    $accordion.hasClass('sorting'),
    'Class when reordering is active is present'
  );
  assert.equal(
    $accordion.find('> li.gru-accordion-lesson').length,
    2,
    'Number of lessons loaded'
  );
  assert.equal(
    $accordion.find(
      '> li.gru-accordion-lesson > .panel > .panel-heading > .drag-icon'
    ).length,
    2,
    'Lessons have drag handles'
  );

  // Check action buttons changed
  assert.equal(
    $heading.find('.actions button').length,
    3,
    'Action buttons when reordering'
  );
  assert.ok(
    $heading.find('.actions button:eq(0)').hasClass('sort-items'),
    'First button is for sorting the lessons in the unit'
  );
  assert.ok(
    $heading.find('.actions button:eq(1)').hasClass('cancel'),
    'Second button is to cancel reordering'
  );
  assert.ok(
    $heading.find('.actions button:eq(2)').hasClass('save'),
    'Third button is to save the new order of lessons'
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
    {{content/courses/edit/gru-accordion-unit
      course=course
      model=unit
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
    {{content/courses/edit/gru-accordion-unit
      course=course
      model=unit
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
    {{content/courses/edit/gru-accordion-unit
      course=course
      model=unit
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
  $lessonContainer.find('.panel-heading > a').click();
  assert.ok(
    $lessonContainer.hasClass('expanded'),
    'Lesson container should be expanded'
  );
});
