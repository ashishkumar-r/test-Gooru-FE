import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import BuilderItem from 'gooru-web/models/content/builder/item';
import Course from 'gooru-web/models/content/course';
import Lesson from 'gooru-web/models/content/lesson';
import LessonItem from 'gooru-web/models/content/lessonItem';
import Ember from 'ember';

const lessonServiceStub = Ember.Service.extend({
  createLesson(courseId, unitId, lesson) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (courseId === 'course-id-fail' || !unitId || !lesson) {
        reject({ status: 500 });
      } else {
        lesson.set('id', 'lesson-id-123');
        resolve(lesson);
      }
    });
  },

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
  },

  updateLesson(courseId, unitId, lesson) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (courseId === 'course-id-fail' || !unitId || !lesson) {
        reject({ status: 500 });
      } else {
        resolve(lesson);
      }
    });
  }
});

moduleForComponent(
  'content/courses/edit/gru-accordion-lesson',
  'Integration | Component | content/courses/edit/gru accordion lesson',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/lesson', lessonServiceStub);
      this.inject.service('api-sdk/lesson');
    }
  }
);

test('it renders a form for creating a new lesson', function(assert) {
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: true
  });

  this.set('lesson', lesson);
  this.set('totalItems', 3);
  this.render(
    hbs`{{content/courses/edit/gru-accordion-lesson model=lesson totalItems=3}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('edit'), 'Edit class');

  const $heading = $component.find('.edit .panel-heading');
  assert.ok(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.lesson').string} ${this.get('totalItems')}`,
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
});

test('it can create a new lesson in a valid state', function(assert) {
  const title = 'New Lesson';

  var lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: 0
    }),
    isEditing: false
  });

  this.set('lesson', lesson);
  this.set('unitId', 'unit-id-123');
  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.render(hbs`{{content/courses/edit/gru-accordion-lesson
    course=course
    unitId=unitId
    model=lesson }}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
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

  // Form has current lesson values
  const $titleField = $component.find('.edit .panel-heading .title');
  assert.equal($titleField.find('input').val(), '', 'Lesson title');

  $titleField.find('input').blur();
  assert.ok(
    $titleField.find('.error-messages .error').length,
    'Error message should exist'
  );

  $titleField.find('input').val(title);
  $titleField.find('input').blur();

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Error message should not exist'
  );

  const $saveButton = $component.find(
    '.edit .panel-heading .actions button:eq(1)'
  );
  Ember.run(() => {
    $saveButton.click();
  });

  const $heading = $component.find('.view .panel-heading');
  assert.equal($heading.find('strong').text(), title, 'Unit title updated');

  lesson = this.get('lesson');
  assert.equal(
    lesson.get('data.id'),
    'lesson-id-123',
    'Lesson ID updated after saving'
  );
  assert.equal(lesson.get('isEditing'), false, 'Lesson is no longer editable');
});

test('it can edit an existing lesson', function(assert) {
  const title = 'Lesson Title Updated';

  var lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-123',
      title: 'Lesson Title'
    }),
    isEditing: false
  });

  this.set('lesson', lesson);
  this.set(
    'course',
    Course.create({
      id: 'course-id-123'
    })
  );
  this.set('unitId', 'unit-id-456');
  this.render(hbs`{{content/courses/edit/gru-accordion-lesson
     course=course
     unitId=unitId
     model=lesson }}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
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

  // Form has current lesson values
  assert.equal(
    $component.find('.edit .panel-heading .title input').val(),
    lesson.get('data.title'),
    'Lesson title'
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
  assert.equal($heading.find('strong').text(), title, 'Lesson title updated');
  assert.equal(lesson.get('isEditing'), false, 'Lesson is no longer editable');
});

test('it shows an error message if it fails to create a new lesson', function(assert) {
  assert.expect(2);

  const context = this;

  // Mock notifications service
  this.register(
    'service:notifications',
    Ember.Service.extend({
      error(message) {
        assert.equal(
          message,
          context.get('i18n').t('common.errors.lesson-not-created').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: '',
      title: 'Lesson Title'
    }),
    isEditing: true
  });

  this.set('lesson', lesson);
  this.set('unitId', 'unit-id-123');
  this.set(
    'course',
    Course.create({
      id: 'course-id-fail'
    })
  );
  this.render(hbs`{{content/courses/edit/gru-accordion-lesson
    course=course
    unitId=unitId
    model=lesson }}`);

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
  );
  assert.ok($component.length, 'Component');

  const $saveButton = $component.find(
    '.edit .panel-heading .actions button:eq(1)'
  );
  $saveButton.click();
});

test('it renders a form when editing an existing lesson', function(assert) {
  const lessonData = {
    id: '123',
    title: 'Sample Lesson Name',
    taxonomy: [],
    sequence: 3
  };

  // Lesson model
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), lessonData),
    isEditing: true
  });

  const tempLesson = Lesson.create(
    Ember.getOwner(this).ownerInjection(),
    lessonData
  );

  this.set('tempLesson', tempLesson);
  this.set('lesson', lesson);
  this.set('index', 2);
  this.render(
    hbs`{{content/courses/edit/gru-accordion-lesson model=lesson tempLesson=tempLesson index=index }}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('edit'), 'Edit class');

  const $heading = $component.find('.edit .panel-heading');
  assert.equal(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.lesson').string} ${this.get('index') + 1}`,
    'Header prefix'
  );
  assert.ok(
    $heading.find('.gru-input.title').text(),
    lesson.get('data.title'),
    'Lesson title'
  );
  assert.equal(
    $heading.find('.actions button').length,
    2,
    'Lesson header action buttons'
  );
  assert.ok(
    $heading.find('.actions button:eq(0)').hasClass('cancel'),
    'First button is cancel'
  );
  assert.ok(
    $heading.find('.actions button:eq(1)').hasClass('save'),
    'Second button is save'
  );
});

test('it triggers an external event when clicking cancel on a new unsaved lesson', function(assert) {
  assert.expect(1);

  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: ''
    }),
    isEditing: true
  });

  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set('lesson', lesson);
  this.render(
    hbs`{{content/courses/edit/gru-accordion-lesson model=lesson onCancelAddLesson=(action 'externalAction')}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
  );
  $component.find('.edit .actions button.cancel').click();
});

test('it renders the lesson correctly, if the lesson has no collections/assessments -view mode', function(assert) {
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
    hbs`{{content/courses/edit/gru-accordion-lesson model=lesson index=index}}`
  );

  const $component = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.hasClass('view'), 'View class');

  const $heading = $component.find('.view .panel-heading');
  assert.ok(
    $heading.find('h3').text(),
    `${this.get('i18n').t('common.lesson').string} ${this.get('index')}`,
    'Header prefix'
  );
  assert.ok($heading.find('strong').text(), lesson.get('title'), 'Unit title');
  assert.equal(
    $heading.find('.detail > span').text(),
    this.get('i18n').t('common.add').string,
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

  // Add dropdown menu
  const $addDropdown = $heading.find('.actions > .dropdown');
  assert.ok($addDropdown.length, 'Add dropdown');
  assert.ok(
    !$addDropdown.hasClass('open'),
    'Add dropdown is closed by default'
  );

  // Click on the add button to open the dropdown menu
  $heading.find('.actions .add-item').click();
  assert.ok($addDropdown.hasClass('open'), 'Add dropdown is open');
  assert.equal(
    $addDropdown.find('.dropdown-menu li').length,
    6,
    'Dropdown options'
  );

  $heading.find('.actions .add-item').click();
  assert.ok(!$addDropdown.hasClass('open'), 'Add dropdown is closed');

  assert.ok(
    $heading.find('.actions button:eq(1)').hasClass('sort-items'),
    'Second button is for reordering the lessons'
  );
  assert.ok(
    $heading.find('.actions button:eq(2)').hasClass('delete-item'),
    'Third button is for deleting the lesson'
  );
  //assert.ok($heading.find('.actions button:eq(3)').hasClass('move-item'), 'Fourth button is for moving the lesson');
  assert.ok(
    $heading.find('.actions button:eq(4)').hasClass('copy-item'),
    'Fifth button is for copying the lesson'
  );
  assert.ok(
    $heading.find('.actions button:eq(5)').hasClass('edit-item'),
    'Sixth button is for editing the lesson'
  );

  const $lessonList = $component.find('.view .panel-body ol.accordion-lesson');
  assert.ok($lessonList.length, 'Lesson items list');
  assert.ok(
    !$lessonList.find('> li.gru-accordion-lesson-item').length,
    'No lesson items by default'
  );

  const $addActions = $component.find('.view .panel-body > div');
  assert.ok($addActions.length, 'Add actions container');
  assert.equal($addActions.find('button').length, 6, 'Number of add buttons');
});

test('it expands/collapses the lesson -view mode', function(assert) {
  assert.expect(8);
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
    {{content/courses/edit/gru-accordion-lesson
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
});

test('it loads lesson items and renders them after clicking on the lesson name', function(assert) {
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
    //it should enter 4 times here
    assert.equal(id, '123', 'Wrong lesson id');
    assert.equal(expanded, true, 'Wrong expanded value');
  });
  this.render(hbs`
    {{content/courses/edit/gru-accordion-lesson
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

  $container.find('> .panel-heading > a').click();
  assert.ok($container.hasClass('expanded'), 'Container expanded');
  assert.equal(
    $container.find('.accordion-lesson > li.gru-accordion-lesson-item').length,
    2,
    'Number of lesson items loaded'
  );
  assert.ok(this.get('isLoaded'), 'Data was loaded');
});

test('it offers the ability to reorder the lesson items', function(assert) {
  const lesson = BuilderItem.create({
    data: Lesson.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      isSorting: false,
      assessmentCount: 1,
      collectionCount: 1
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
  this.set('unitId', 'unit-id-123');
  this.set('lesson', lesson);

  this.render(hbs`
    {{content/courses/edit/gru-accordion-lesson
      course=course
      unitId=unitId
      model=lesson }}`);

  const $container = this.$(
    '.content.courses.gru-accordion.gru-accordion-lesson > .view'
  );
  const $heading = $container.find('> .panel-heading');
  const $accordion = $container.find('> .panel-body > .accordion-lesson');

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
    $accordion.find('> li.gru-accordion-lesson-item').length,
    2,
    'Number of lessons loaded'
  );
  assert.equal(
    $accordion.find(
      '> li.gru-accordion-lesson-item > .panel > .panel-heading > .drag-icon'
    ).length,
    2,
    'Lesson items have drag handles'
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
    {{content/courses/edit/gru-accordion-lesson
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
