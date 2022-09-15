import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'gru-featured-courses',
  'Integration | Component | gru explore featured courses',
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

  this.render(hbs`{{gru-explore-featured-courses courses=courses}}`);

  const $featuredCourses = this.$('.featured-courses');
  assert.ok($featuredCourses.length, 'Missing featured courses panel');
  assert.ok(
    $featuredCourses.find('.panel-heading').length,
    'Missing featured courses panel-heading'
  );
  assert.ok(
    $featuredCourses.find('.panel-body').length,
    'Missing featured courses panel-body'
  );

  assert.ok(
    $featuredCourses.find('.panel-body .legend').length,
    'Missing panel body legend'
  );
  assert.ok(
    $featuredCourses.find('.panel-heading').length,
    'Missing featured courses panel-heading'
  );
  assert.ok(
    $featuredCourses.find('.panel-body .courses').length,
    'Missing courses'
  );
  assert.equal(
    $featuredCourses.find('.panel-body .courses .gru-course-card').length,
    2,
    'Wrong number of featured course cards'
  );
  assert.ok(
    $featuredCourses.find('.panel-body .actions .library').length,
    'Missing library button'
  );
  assert.ok(
    $featuredCourses.find('.panel-body .will-disappear').length,
    'Missing will-disappear legend'
  );
});
