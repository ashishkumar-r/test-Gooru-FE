import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import ProfileModel from 'gooru-web/models/profile/profile';

moduleForComponent(
  'cards/gru-profile-card',
  'Integration | Component | cards/gru profile card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('it renders', function(assert) {
  assert.expect(5);

  const mockProfile = ProfileModel.create({
    avatarUrl: 'assets/gooru/profile.png',
    firstName: 'John',
    lastName: 'Doe',
    username: 'JohnDoe',
    followers: 10,
    followings: 20
  });

  this.set('mockProfile', mockProfile);

  this.render(hbs`{{cards/gru-profile-card profile=mockProfile}}`);

  const $component = this.$('.cards.gru-profile-card');
  assert.ok($component.length, 'Component does not have the component classes');

  const $followers = $component.find('> .social > .followers');
  assert.equal(
    $followers.text().trim(),
    `10 ${this.get('i18n').t('cards.gru-profile-card.followers').string}`
  );

  const $following = $component.find('> .social > .following');
  assert.equal(
    $following.text().trim(),
    `20 ${this.get('i18n').t('cards.gru-profile-card.following').string}`
  );

  return wait().then(function() {
    const $image = $component.find('> div > span > img');
    assert.equal($image.attr('src'), 'assets/gooru/profile.png');

    const $name = $component.find('> div > strong');
    assert.equal($name.text(), 'JohnDoe');
  });
});
