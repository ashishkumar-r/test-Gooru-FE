import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'gru-student-featured-courses',
  'Integration | Component | gru student featured courses',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Test for featured courses panel', function(assert) {
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
    })
  ]);

  this.set('courses', courses);

  this.render(hbs`{{gru-student-featured-courses courses=courses}}`);

  const $featuredCourses = this.$('.student-featured-courses');
  assert.ok($featuredCourses.length, 'Missing featured courses panel');
  assert.ok($featuredCourses.find('.courses').length, 'Missing courses');
  assert.equal(
    $featuredCourses.find('.courses .gru-standard-card').length,
    2,
    'Wrong number of featured course cards'
  );
});
