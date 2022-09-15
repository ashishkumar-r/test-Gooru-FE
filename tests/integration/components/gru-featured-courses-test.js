import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'gru-featured-courses',
  'Integration | Component | gru featured courses',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Test for featured courses templates', function(assert) {
  var courses = Ember.A([
    Ember.Object.create({
      subject: 'K12.First',
      subjectName: 'First',
      subjectSequence: '1'
    }),
    Ember.Object.create({
      subject: 'K12.Second',
      subjectName: 'Second',
      subjectSequence: '2'
    }),
    Ember.Object.create({
      subject: 'K12.First',
      subjectName: 'First',
      subjectSequence: '1'
    }),
    Ember.Object.create({
      subject: 'K12.Second',
      subjectName: 'Second',
      subjectSequence: '2'
    })
  ]);
  this.set('courses', courses);

  this.render(hbs`{{gru-featured-courses courses=courses}}`);

  const $component = this.$('.gru-featured-courses');
  assert.ok(
    $component.find('.subject-filters').length,
    'subject-filters container missing'
  );
  assert.ok(
    $component.find('.subject-menu-option').length,
    'subject-menu-option-container container missing'
  );

  assert.ok(
    $component.find('.course-container').length,
    'courses container missing'
  );
  assert.ok($component.find('.subject-title').length, 'subject title missing');
});
