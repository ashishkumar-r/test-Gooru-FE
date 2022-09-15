import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Course from 'gooru-web/models/content/course';

moduleForComponent(
  'student/gru-performance-courses',
  'Integration | Component | student/gru performance courses',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  const courses = [
    Course.create({
      id: '0101',
      title: 'Course 1'
    }),
    Course.create({
      id: '0201',
      title: 'Course 2'
    }),
    Course.create({
      id: '0301',
      title: 'Course 3'
    })
  ];
  this.set('courses', courses);

  this.render(hbs`{{student/gru-performance-courses courses=courses}}`);

  const $component = this.$();

  assert.ok(
    $component.find('.student.gru-performance-courses').length,
    'Missing component'
  );
  assert.ok(
    $component.find('.search-navigation .search-keyword input').length,
    'Missing search navigation'
  );
  assert.ok(
    $component.find('.search-navigation .search-keyword .search-icon').length,
    'Missing search navigation icon'
  );
  assert.equal($component.find('.item').length, 3, 'Should have 3 icons');
  assert.notOk(
    $component.find('.no-content').length,
    'No content label should not appear'
  );
  this.set('courses', []);
  assert.ok(
    $component.find('.no-content').length,
    'No content label should appear'
  );
});

test('Search course by name', function(assert) {
  const courses = [
    Course.create({
      id: '0101',
      title: 'Course 1'
    }),
    Course.create({
      id: '0201',
      title: 'Course 2'
    }),
    Course.create({
      id: '0301',
      title: 'Course 3'
    })
  ];
  this.set('courses', courses);

  this.render(hbs`{{student/gru-performance-courses courses=courses}}`);

  const $component = this.$();
  assert.equal(
    $component.find('.item:visible').length,
    3,
    'Should 3 student visible'
  );
  const $searchInput = $component.find(
    '.search-navigation .search-keyword input'
  );
  $searchInput.val('Course 3');
  $searchInput.first().keyup();
  return wait().then(function() {
    assert.equal(
      $component.find('.item:visible').length,
      1,
      'Should have only 1 student visible'
    );
  });
});
