import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'gru-user-icons',
  'Integration | Component | gru user icons',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  var users = [
    Ember.Object.create({
      user: Ember.Object.create({
        id: 1,
        firstName: 'Bobby',
        lastName: 'Fisher'
      })
    }),
    Ember.Object.create({
      user: Ember.Object.create({
        id: 2,
        firstName: 'John',
        lastName: 'Doe'
      })
    })
  ];

  this.set('users', users);

  this.render(hbs`{{gru-user-icons users=users membersCount=2 }}`);

  const $component = this.$('.gru-user-icons');
  const $firstView = $component.find('.first-view');

  assert.ok($component, 'Component does not have the component class');
  assert.ok(
    $firstView.find('.item i.group').length,
    'Group icon should be present'
  );
  assert.equal(
    T.text($firstView.find('.item span')),
    '2',
    'Incorrect number of members at first view'
  );
});

//test('it opens/closes a modal to view more users', function(assert) {
//
//  const users = [
//    Ember.Object.create({
//      user: Ember.Object.create({
//        id: 1,
//        firstName: "Bobby",
//        lastName: "Fisher"
//      })
//    }),
//    Ember.Object.create({
//      user: Ember.Object.create({
//        id: 2,
//        firstName: "John",
//        lastName: "Doe"
//      })
//    }),
//    Ember.Object.create({
//      user: Ember.Object.create({
//        id: 3,
//        firstName: "Martha",
//        lastName: "Stewart"
//      })
//    }),
//    Ember.Object.create({
//      user: Ember.Object.create({
//        id: 4,
//        firstName: "John",
//        lastName: "Fitzgerald"
//      })
//    })
//  ];
//
//  this.set('users', users);
//
//  this.render(hbs`{{gru-user-icons users=users viewMoreIn='modal'}}`);
//
//  const $component = this.$('.gru-user-icons');
//  const $anchor = $component.find('.first-view .pointer span');
//  const $modal = $component.find('.remaining.modal');
//  assert.ok($modal.length, 'Modal element should be present');
//  assert.ok(!$modal.hasClass('in'), 'Modal should not be visible');
//
//  // Open the modal
//  $anchor.click();
//
//  return wait().then(function () {
//    assert.ok($modal.hasClass('in'), 'Modal should be visible');
//    assert.equal($modal.find('.modal-body .user').length, 4, 'Modal does not show the correct number of users');
//    const $close = $component.find('.modal-header button.close');
//    // Close the modal
//    $close.click();
//    return wait().then(function () {
//      assert.ok(!$modal.hasClass('in'), 'Modal should have been hidden');
//    });
//  });
//});
