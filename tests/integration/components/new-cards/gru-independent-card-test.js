import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Location from 'gooru-web/models/learner/location';
import Performance from 'gooru-web/models/learner/performance';

const courseMock = Ember.Object.create({
  id: '0101',
  title: 'Course 1',
  children: [
    Ember.Object.create({
      id: '0102',
      title: 'Unit 1',
      children: [
        Ember.Object.create({
          id: '0103',
          title: 'Lesson 1'
        })
      ]
    })
  ]
});

const courseServiceStub = Ember.Service.extend({
  fetchById(courseId) {
    if (courseId) {
      return Ember.RSVP.resolve(courseMock);
    } else {
      return Ember.RSVP.reject('Fetch failed');
    }
  }
});

moduleForComponent(
  'new-cards/gru-independent-card',
  'Integration | Component | new cards/gru independent card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
      this.register('service:api-sdk/course', courseServiceStub);
    }
  }
);

test('Course Card Layout', function(assert) {
  this.set(
    'location',
    Location.create(Ember.getOwner(this).ownerInjection(), {
      title: 'course-title',
      type: 'course',
      currentId: 'collection-id',
      currentTitle: 'current-title',
      currentType: 'collection',
      lastAccessed: '2017-03-07 18:44:04.798',
      courseId: 'course-id'
    })
  );

  this.set(
    'performance',
    Performance.create(Ember.getOwner(this).ownerInjection(), {
      completedCount: 5,
      totalCount: 10,
      scoreInPercentage: 90,
      timeSpent: 4000
    })
  );

  this.render(
    hbs`{{new-cards/gru-independent-card location=location performance=performance}}`
  );

  const $component = this.$(); //component dom element
  const $card = $component.find('.new-gru-independent-card');
  const $panel = $card.find('.panel');
  const $panelHeading = $panel.find('.panel-heading');
  const $panelBody = $panel.find('.panel-body');
  const $panelFooter = $panel.find('.panel-footer');

  T.exists(assert, $card, 'Missing course card section');
  T.exists(assert, $panel, 'Missing course card panel');
  T.exists(assert, $panelHeading, 'Missing course card panel heading');
  T.exists(assert, $panelBody, 'Missing course card panel body');

  assert.equal(
    T.text($panelHeading.find('.card-heading .current-activity .title a')),
    'current-title',
    'Wrong currect activity title'
  );
  assert.equal(
    T.text($panelBody.find('.timestamp .pull-right')),
    'Mar 2, 2017 6:44 PM',
    'Wrong last accessed time'
  );
  assert.equal(
    T.text($panelFooter.find('.performance .percentage')),
    '90%',
    'Wrong Percentage value'
  );
  T.exists(
    assert,
    $panelFooter.find('.performance .completion-bar'),
    'Missing completion bar'
  );
  T.exists(assert, $panelFooter.find('.report'), 'Missing Report');
});

test('Collection Card Layout', function(assert) {
  this.set(
    'location',
    Location.create(Ember.getOwner(this).ownerInjection(), {
      title: 'collection-title',
      type: 'collection',
      lastAccessed: '2017-03-07 18:44:04.798',
      isCompleted: true
    })
  );

  this.set(
    'performance',
    Performance.create(Ember.getOwner(this).ownerInjection(), {
      timeSpent: 4000
    })
  );

  this.render(
    hbs`{{new-cards/gru-independent-card location=location performance=performance}}`
  );
  const $component = this.$(); //component dom element
  const $card = $component.find('.new-gru-independent-card');
  const $panel = $card.find('.panel');
  const $panelHeading = $panel.find('.panel-heading');
  const $panelBody = $panel.find('.panel-body');
  const $panelFooter = $panel.find('.panel-footer');

  T.exists(assert, $card, 'Missing collection card section');
  T.exists(assert, $panel, 'Missing collection card panel');
  T.exists(assert, $panelHeading, 'Missing collection card panel heading');
  T.exists(assert, $panelBody, 'Missing collection card panel body');

  assert.equal(
    T.text($panelBody.find('.timestamp .pull-right')),
    'Mar 2, 2017 6:44 PM',
    'Wrong last accessed time'
  );
  T.exists(
    assert,
    $panelFooter.find('.collection i.collection'),
    'Missing Collection Icon'
  );
  assert.equal(
    T.text($panelFooter.find('.time-spent .total-time')),
    '4s',
    'Wrong time spent value'
  );
  T.exists(
    assert,
    $panelFooter.find('.collection-report'),
    'Missing Report icon'
  );
});

test('Assessment Card Layout', function(assert) {
  this.set(
    'location',
    Location.create(Ember.getOwner(this).ownerInjection(), {
      title: 'assessment-title',
      type: 'assessment',
      lastAccessed: '2017-03-07 18:44:04.798',
      isCompleted: true
    })
  );

  this.set(
    'performance',
    Performance.create(Ember.getOwner(this).ownerInjection(), {
      scoreInPercentage: 90,
      timeSpent: 4000
    })
  );

  this.render(
    hbs`{{new-cards/gru-independent-card location=location performance=performance}}`
  );

  const $component = this.$(); //component dom element
  const $card = $component.find('.new-gru-independent-card');
  const $panel = $card.find('.panel');
  const $panelHeading = $panel.find('.panel-heading');
  const $panelBody = $panel.find('.panel-body');
  const $panelFooter = $panel.find('.panel-footer');

  T.exists(assert, $card, 'Missing assessment card section');
  T.exists(assert, $panel, 'Missing assessment card panel');
  T.exists(assert, $panelHeading, 'Missing assessment card panel heading');
  T.exists(assert, $panelBody, 'Missing assessment card panel body');
  assert.equal(
    T.text($panelBody.find('.timestamp .pull-right')),
    'Mar 2, 2017 6:44 PM',
    'Wrong last accessed time'
  );
  T.exists(
    assert,
    $panelFooter.find('i.assessment'),
    'Missing Assessment Icon'
  );
  T.exists(assert, $panelFooter.find('.report'), 'Missing Report icon');
});
