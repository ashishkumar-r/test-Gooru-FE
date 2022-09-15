import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';
moduleForComponent(
  'cards/gru-user-network-card',
  'Integration | Component | cards/gru user network card',
  {
    integration: true
  }
);

test('User Network Card Layout', function(assert) {
  var user = Ember.Object.create({
    fullNameInformal: 'Lisa Keller',
    districtName: 'District Name',
    totalFollowers: 115,
    totalFollowing: 200,
    isFollowing: false,
    id: 123445
  });
  var myFollowings = Ember.A([
    Ember.Object.create({
      fullNameInformal: 'Lisa Keller',
      districtName: 'District Name',
      totalFollowers: 115,
      totalFollowing: 200,
      isFollowing: false,
      id: 12344799
    })
  ]);
  this.set('user', user);
  this.set('myFollowings', myFollowings);
  this.render(
    hbs`{{cards/gru-user-network-card user=user myFollowings=myFollowings}}`
  );
  var $component = this.$();
  const $userNetworkCard = $component.find('.gru-user-network-card');
  T.exists(
    assert,
    $userNetworkCard.find('.panel-heading .image img'),
    'Missing User Image'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-heading .user-info .name'),
    'Missing User Name'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-heading .user-info .district'),
    'Missing District Name'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-body .followers .count span'),
    'Missing Followers Count'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-body .followers .description'),
    'Missing Followers Label'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-body .following .count span'),
    'Missing Following Count'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-body .following .description'),
    'Missing Following Label'
  );
  T.exists(
    assert,
    $userNetworkCard.find('.panel-footer .follow-btn button.btn-follow'),
    'Missing Follow Button'
  );
  assert.equal(
    T.text(
      $userNetworkCard.find('.panel-footer .follow-btn button.btn-follow')
    ),
    'Follow',
    'The label button should be Follow'
  );
});

test('User Network Card Layout - if isFollowing', function(assert) {
  var user = Ember.Object.create({
    displayName: 'Lisa Keller',
    schoolDistrict: 'District Name',
    followers: 115,
    followings: 200,
    isFollowing: true,
    id: 12344799
  });
  var myFollowings = Ember.A([
    Ember.Object.create({
      fullNameInformal: 'Lisa Keller',
      districtName: 'District Name',
      totalFollowers: 115,
      totalFollowing: 200,
      isFollowing: true,
      id: 12344799
    })
  ]);

  this.set('user', user);
  this.set('myFollowings', myFollowings);

  this.render(
    hbs`{{cards/gru-user-network-card user=user myFollowings=myFollowings}}`
  );
  var $component = this.$();
  const $userNetworkCard = $component.find('.gru-user-network-card');
  T.exists(
    assert,
    $userNetworkCard.find('.panel-footer .follow-btn button'),
    'Missing Following Button'
  );
  assert.equal(
    T.text(
      $userNetworkCard.find('.panel-footer .follow-btn button span.following')
    ),
    'Following',
    'The label button should be Following'
  );
});

test('User Network Card Layout - Following Filter - unFollow implementation', function(
  assert
) {
  var user = Ember.Object.create({
    displayName: 'Lisa Keller',
    schoolDistrict: 'District Name',
    followers: 115,
    followings: 200,
    isFollowing: true,
    id: 12344799
  });

  var myFollowings = Ember.A([
    Ember.Object.create({
      fullNameInformal: 'Lisa Keller',
      districtName: 'District Name',
      totalFollowers: 115,
      totalFollowing: 200,
      isFollowing: true,
      id: 12344799
    })
  ]);

  this.on('unFollowUser', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.set('user', user);
  this.set('myFollowings', myFollowings);

  this.render(
    hbs`{{cards/gru-user-network-card user=user onUnFollowUser='unFollowUser' myFollowings=myFollowings}}`
  );
  var $component = this.$();
  const $userNetworkCard = $component.find('.gru-user-network-card');
  var $unFollowButton = $userNetworkCard.find(
    '.panel-footer .follow-btn button'
  );
  T.exists(assert, $unFollowButton, 'Missing Unfollow Button');
  assert.equal(
    T.text($unFollowButton.find('span.unfollow')),
    'Unfollow',
    'The label button should be Unfollow'
  );

  $unFollowButton.click();
});

test('User Network Card Layout - Followers Filter - Follow implementation', function(
  assert
) {
  var user = Ember.Object.create({
    displayName: 'Lisa Keller',
    schoolDistrict: 'District Name',
    followers: 115,
    followings: 200,
    isFollowing: false,
    id: 1234444799
  });
  var myFollowings = Ember.A([
    Ember.Object.create({
      fullNameInformal: 'Lisa Keller',
      districtName: 'District Name',
      totalFollowers: 115,
      totalFollowing: 200,
      isFollowing: true,
      id: 12344799
    })
  ]);

  this.on('followUser', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.set('user', user);

  this.set('myFollowings', myFollowings);

  this.render(
    hbs`{{cards/gru-user-network-card user=user onFollowUser='followUser' myFollowings=myFollowings}}`
  );
  var $component = this.$();
  const $userNetworkCard = $component.find('.gru-user-network-card');
  var $followButton = $userNetworkCard.find(
    '.panel-footer .follow-btn button.btn-follow'
  );
  T.exists(assert, $followButton, 'Missing Follow Button');
  assert.equal(
    T.text($followButton),
    'Follow',
    'The label button should be Follow'
  );

  $followButton.click();
});
test('User Network Card Layout - When the user on the session its the same than the user in the card', function(
  assert
) {
  var user = Ember.Object.create({
    displayName: 'Pochita',
    schoolDistrict: 'District Name',
    followers: 115,
    followings: 200,
    isFollowing: false,
    id: 1234
  });
  var myFollowings = Ember.A([
    Ember.Object.create({
      fullNameInformal: 'Lisa Keller',
      districtName: 'District Name',
      totalFollowers: 115,
      totalFollowing: 200,
      isFollowing: true,
      id: 12344799
    })
  ]);

  this.set('user', user);

  this.set('myFollowings', myFollowings);
  this.set('isMyProfile', true);

  this.render(
    hbs`{{cards/gru-user-network-card user=user myFollowings=myFollowings isMyProfile=isMyProfile}}`
  );
  var $component = this.$();
  const $userNetworkCard = $component.find('.gru-user-network-card');
  var $followButton = $userNetworkCard.find(
    '.panel-footer .follow-btn button.btn-follow'
  );
  T.notExists(assert, $followButton, 'Missing Follow Button');
});
