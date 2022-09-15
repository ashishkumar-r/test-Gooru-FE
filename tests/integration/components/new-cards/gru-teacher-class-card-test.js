import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import ClassModel from 'gooru-web/models/content/resource';
import Course from 'gooru-web/models/content/course';
import Ember from 'ember';

const courseServiceStub = Ember.Service.extend({
  fetchByIdWithOutProfile(courseId) {
    if (courseId) {
      let course = Course.create(Ember.getOwner(this).ownerInjection(), {
        id: 'course-123',
        title: 'Sample Course Name'
      });
      return Ember.RSVP.resolve(course);
    } else {
      return Ember.RSVP.reject('Fetch failed');
    }
  }
});

moduleForComponent(
  'new-cards/gru-teacher-class-card',
  'Integration | Component | new cards/gru teacher class card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
      this.register('service:api-sdk/course', courseServiceStub);
      this.inject.service('api-sdk/course', { as: 'courseService' });
    }
  }
);

var mockClass = ClassModel.create({
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
  },
  performanceSummary: Ember.Object.create({
    classId: 'class-id',
    id: 'class-id',
    score: 90,
    timeSpent: 344680,
    total: 60,
    totalCompleted: 30
  })
});

test('Class Card Layout', function(assert) {
  this.set('class', mockClass);

  this.render(hbs`{{new-cards/gru-teacher-class-card class=class}}`);

  var $component = this.$(); //component dom element

  const $classCard = $component.find('.gru-teacher-class-cards');
  const $panel = $classCard.find('.panel');
  const $panelHeading = $panel.find('.panel-heading');
  const $panelBody = $panel.find('.panel-body');

  T.exists(assert, $classCard, 'Missing teacher class card section');
  T.exists(assert, $panel, 'Missing class card panel');
  T.exists(assert, $panelHeading, 'Missing class card panel heading');
  T.exists(assert, $panelBody, 'Missing class card panel body');
  T.exists(assert, $panelHeading.find('.title'), 'Missing class card title');
  assert.equal(
    T.text($panelHeading.find('> .title')),
    'My class - 1',
    'Wrong class title text'
  );

  T.exists(
    assert,
    $panelBody.find('.card-class-code .class-code'),
    'Missing class card code'
  );
  assert.equal(
    T.text($panelBody.find('.card-class-code .class-code')),
    'VZFMEWH',
    'Wrong class code text'
  );

  T.exists(
    assert,
    $panelBody.find('.information'),
    'Missing class information'
  );
});
