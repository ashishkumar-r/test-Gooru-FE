import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import CourseModel from 'gooru-web/models/content/course';

import Ember from 'ember';

moduleForComponent(
  'content/modals/gru-quick-course-search',
  'Integration | Component | content/modals/gru quick course search',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('model', {
    courses: Ember.A([
      CourseModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id',
        description: 'some-description',
        isPublished: true,
        isVisibleOnProfile: true,
        subject: 'some-subject',
        thumbnailUrl: 'some-image-url.png',
        title: 'some-title',
        unitCount: '0'
      }),
      CourseModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id-2',
        description: 'some-description-2',
        isPublished: false,
        isVisibleOnProfile: true,
        subject: 'some-subject-2',
        thumbnailUrl: 'some-image-url-2.png',
        title: 'some-title-2',
        unitCount: '1'
      })
    ])
  });

  this.render(hbs`{{content/modals/gru-quick-course-search model=model}}`);

  const $component = this.$('.content.modals.gru-quick-course-search');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');
  assert.equal($body.find('>div').length, 2, 'Number of cards');

  const $footer = $component.find('.modal-footer');

  assert.equal(
    $footer.find('.btn-group button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($footer.find('.btn-group .cancel').length, 'Cancel button');
  assert.ok($footer.find('.btn-group .assign').length, 'Join class button');
});
