import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import Bookmark from 'gooru-web/models/content/bookmark';

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
  'new-cards/gru-bookmark-card',
  'Integration | Component | new cards/gru bookmark card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
      this.register('service:api-sdk/course', courseServiceStub);
    }
  }
);

test('Bookmark Card Layout', function(assert) {
  let bookmarkData = Bookmark.create({
    id: 'aaa-bbb',
    contentId: '123',
    contentType: CONTENT_TYPES.COURSE,
    title: 'Title 1'
  });

  this.set('bookmark', bookmarkData);

  this.render(hbs`{{new-cards/gru-bookmark-card bookmark=bookmark}}`);

  var $component = this.$(); //component dom element

  const $bookmarkCard = $component.find('.new-gru-bookmark-card');
  const $panel = $bookmarkCard.find('.panel');
  const $panelHeading = $panel.find('.panel-heading');
  const $panelFooter = $panel.find('.panel-footer');

  T.exists(assert, $bookmarkCard, 'Missing bookmark card');
  T.exists(assert, $panel, 'Missing bookmark card panel');
  T.exists(assert, $panelHeading, 'Missing Panel heading');
  T.exists(assert, $panelFooter, 'Missing Panel footer');
  assert.equal(
    T.text($panelHeading.find('.card-heading .title')),
    'Title 1',
    'Wrong bookmark Title'
  );
  T.exists(assert, $panelFooter.find('i.course'), 'Missing Course Icon');
  T.exists(assert, $panelFooter.find('i.bookmark'), 'Missing Bookmark Icon');
});

test('unBookmark Click', function(assert) {
  let bookmarkData = Bookmark.create({
    id: 'aaa-bbb',
    contentId: '123',
    contentType: CONTENT_TYPES.COURSE,
    title: 'Title 1'
  });

  this.set('bookmark', bookmarkData);

  this.render(hbs`{{new-cards/gru-bookmark-card bookmark=bookmark}}`);

  var $component = this.$(); //component dom element

  const $bookmarkCard = $component.find('.new-gru-bookmark-card');
  const $panel = $bookmarkCard.find('.panel');
  const $panelFooter = $panel.find('.panel-footer');
  const $bookmarkIcon = $panelFooter.find('i.bookmark');
  T.exists(assert, $bookmarkIcon, 'Missing Bookmark Icon');
  $bookmarkIcon.click();
  return wait().then(function() {
    assert.ok(
      $component.find('.gru-delete-bookmark'),
      'Missing Bookmark Delete Modal'
    );
  });
});
