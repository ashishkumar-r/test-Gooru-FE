import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'cards/gru-class-card',
  'Integration | Component | cards/gru class card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
      this.inject.service('api-sdk/course');
    }
  }
);

var mockClass = Ember.Object.create({
  id: 'class-id',
  creatorId: 'creator-id',
  title: 'My class - 1',
  description: 'This class is intended to make awareness of good habits',
  greeting: 'Hi! Welcome to my class',
  grade: [4, 5],
  classSharing: 'open',
  coverImage: 'cover.png',
  code: 'VZFMEWH',
  minScore: 75,
  endDate: '2016-12-31',
  courseId: 'course-123',
  collaborator: ['collaborator-1', 'collaborator-2'],
  creatorSystem: null,
  contentVisibility: null,
  isArchived: false,
  isTeacher: function() {
    return true;
  }
});

var mockProfile = Ember.Object.create({
  id: 'test-profile',
  displayName: 'test',
  role: 'student'
});

var classStudentCount = Ember.Object.create({
  'class-id': 4
});

test('Class Card Layout', function(assert) {
  this.set('class', mockClass);
  this.set('profile', mockProfile);
  this.set('classStudentCount', classStudentCount);

  assert.expect(5);

  this.render(
    hbs`{{cards/gru-class-card class=class profile=profile course=class.course classStudentCount=classStudentCount}}`
  );

  var $component = this.$(); //component dom element

  const $classCard = $component.find('.gru-class-card');
  const $panel = $classCard.find('.panel');
  const $panelBody = $panel.find('.panel-body');

  T.exists(assert, $classCard, 'Missing class card section');
  T.exists(assert, $panel, 'Missing class card panel');
  assert.ok($panel.hasClass('teacher'), 'Must be a teacher class card');

  T.exists(assert, $classCard.find('.title'), 'Missing class card title');

  T.exists(assert, $panelBody.find('.information'), 'Missing course images');
});

test('Student class card', function(assert) {
  //changing mock to be a student
  mockClass.set('isTeacher', function() {
    return false;
  });

  this.set('class', mockClass);
  this.set('profile', mockProfile);
  this.set('classStudentCount', classStudentCount);

  assert.expect(1);

  this.render(
    hbs`{{cards/gru-class-card class=class profile=profile classStudentCount=classStudentCount}}`
  );

  var $component = this.$(); //component dom element

  const $panel = $component.find('.panel');
  assert.ok($panel.hasClass('student'), 'Must be a student class card');
});

test('Class with just one collaborator', function(assert) {
  mockClass.set('collaborator', ['collaborator-1']);
  this.set('class', mockClass);
  this.set('profile', mockProfile);
  this.set('classStudentCount', classStudentCount);

  assert.expect(2);

  this.render(
    hbs`{{cards/gru-class-card class=class profile=profile classStudentCount=classStudentCount}}`
  );

  var $component = this.$(); //component dom element

  const $classCard = $component.find('.gru-class-card');
  T.exists(assert, $classCard, 'Missing class card section');
  T.notExists(
    assert,
    $classCard.find('.collaborators-count'),
    'Collaborators count should not exist'
  );
});

test('Class Card Student with location', function(assert) {
  this.set(
    'class',
    Ember.Object.create({
      id: 'class-id',
      creatorId: 'creator-id',
      title: 'My class - 1',
      description: 'This class is intended to make awareness of good habits',
      greeting: 'Hi! Welcome to my class',
      currentLocation: {
        unitIndex: 2,
        lessonIndex: 3,
        collection: {
          title: 'Equations'
        }
      },
      grade: [4, 5],
      classSharing: 'open',
      coverImage: 'cover.png',
      code: 'VZFMEWH',
      minScore: 75,
      endDate: '2016-12-31',
      courseId: null,
      collaborator: ['collaborator-1', 'collaborator-2'],
      creatorSystem: null,
      contentVisibility: null,
      isArchived: false,
      isTeacher: function() {
        return false;
      }
    })
  );
  this.set('profile', mockProfile);
  this.set('classStudentCount', classStudentCount);

  assert.expect(5);

  this.render(
    hbs`{{cards/gru-class-card class=class course=class.course profile=profile classStudentCount=classStudentCount}}`
  );

  var $component = this.$(); //component dom element

  const $classCard = $component.find('.gru-class-card');
  const $panel = $classCard.find('.panel');
  const $panelBody = $panel.find('.panel-body');

  T.exists(assert, $classCard, 'Missing class card section');
  T.exists(assert, $panel, 'Missing class card panel');
  assert.ok($panel.hasClass('student'), 'Must be a student class card');
  T.exists(assert, $classCard.find('.title'), 'Missing class card title');

  T.exists(
    assert,
    $panelBody.find('.information'),
    'Missing collaborator avatar'
  );
});

test('Teacher class card pannel', function(assert) {
  mockClass.set('isTeacher', function() {
    return true;
  });
  this.set('class', mockClass);
  this.set('profile', mockProfile);
  this.set('classStudentCount', classStudentCount);

  assert.expect(1);

  this.render(
    hbs`{{cards/gru-class-card class=class profile=profile classStudentCount=classStudentCount showUnitsCount=true}}`
  );

  const $component = this.$(); //component dom element
  const $panel = $component.find('.panel.teacher');
  T.exists(assert, $panel, 'Must be a teacher class card');
});

test('Is Archived', function(assert) {
  this.set(
    'class',
    Ember.Object.create({
      id: 'class-id',
      unitsCount: 1,
      creatorId: 'creator-id',
      title: 'My 4 units class',
      code: 'VZFMEWH',
      courseId: '123',
      collaborator: ['collaborator-1'],
      isArchived: true,
      isTeacher: function() {
        return true;
      }
    })
  );

  this.set('profile', mockProfile);

  this.render(
    hbs`{{cards/gru-class-card class=class profile=profile classStudentCount=classStudentCount showUnitsCount=true}}`
  );

  const $component = this.$(); //component dom element
  const $isArchived = $component.find('.panel.archive');
  assert.ok($isArchived.length, 'This class should be archive');
  assert.ok(
    $isArchived.find('.current-location'),
    'Archive classes should not have current location'
  );
});
