import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Course from 'gooru-web/models/content/course';

moduleForComponent(
  'content/courses/gru-course-play',
  'Integration | Component | content/courses/gru course play',
  {
    integration: true
  }
);

test('layout', function(assert) {
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Course Title'
  });

  this.set('course', course);
  this.set('isOwner', true);
  this.render(
    hbs`{{content/courses/gru-course-play course=course isOwner=isOwner}}`
  );

  var $container = this.$('article.content.courses.gru-course-play');
  assert.ok($container.length, 'Component');

  assert.equal($container.find('> section').length, 2, 'Number of sections');
  assert.ok(
    $container.find('> section#information').length,
    'Information section'
  );
  assert.ok($container.find('> section#content').length, 'Content section');
});

test('it renders the course information in the side panel', function(assert) {
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    license: 'License text',
    useCase: 'Use case text'
  });

  var remixedUsers = [
    {
      id: 'remix-1',
      firstName: 'Russell',
      fullName: 'Russell Owner1',
      avatarUrl: 'assets/gooru/profile.png'
    }
  ];

  var createdUsers = [
    {
      id: 'owner-1',
      firstName: 'Shawn',
      fullName: 'Shawn Collaborator1',
      avatarUrl: 'assets/gooru/profile.png'
    }
  ];

  this.set('course', course);
  this.set('remixedUsers', remixedUsers);
  this.set('createdUsers', createdUsers);
  this.render(
    hbs`{{content/courses/gru-course-play course=course remixedUsers=remixedUsers createdUsers=createdUsers}}`
  );

  var $container = this.$('article.content.courses.gru-course-play');

  const $sidePanel = $container.find('#information .panel.aside > .panel-body');
  assert.ok($sidePanel.length, 'Side panel');

  const $rows = $sidePanel.find('> .row');
  assert.equal($rows.length, 2, 'Number of rows');

  var $row = $rows.eq(0);
  assert.equal($row.find('> div').length, 3, 'Number of columns -first row');

  let $column = $row.find('> div:eq(0)');
  assert.ok($column.hasClass('remixed-by'), 'Class 1 -column 2');
  assert.ok($column.hasClass('gru-user-icons'), 'Class 2 -column 2');
  assert.ok($column.find('> strong').length, 'Title -column 2');
  assert.ok($column.find('li.item.user').length, 1, 'Remixes');

  $column = $row.find('> div:eq(1)');
  assert.ok($column.hasClass('created-by'), 'Class 1 -column 1');
  assert.ok($column.hasClass('gru-user-icons'), 'Class 2 -column 1');
  assert.ok($column.find('> strong').length, 'Title -column 1');
  assert.ok($column.find('li.item').length, 1, 'Creators');

  $column = $row.find('> div:eq(2)');
  assert.ok($column.hasClass('license'), 'Class -column 3');
  assert.ok($column.find('> strong').length, 'Title -column 3');
  assert.ok($column.find('p').text(), 'License text', 'License text');

  $row = $rows.eq(1);
  assert.equal($row.find('> div').length, 1, 'Number of columns -second row');

  $column = $row.find('> div:eq(0)');
  assert.ok($column.hasClass('use-case'), 'Class -column 1, row 2');
  assert.ok($column.find('> strong').length, 'Title -column 1, row 2');
  assert.ok($column.find('p').text(), 'Use case text', 'Use case text');
});
