import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'gru-user-registration',
  'Integration | Component | gru user registration',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('User Registration', function(assert) {
  assert.expect(13);

  this.render(hbs`{{gru-user-registration}}`);

  var $component = this.$(); //component dom element
  const $userRegistration = $component.find('.sign-up-form');
  T.exists(assert, $userRegistration, 'Missing sign-up-section');
  T.exists(assert, $userRegistration.find('h3'), 'Missing title');
  T.exists(
    assert,
    $userRegistration.find('.connect-button'),
    'Missing google button'
  );
  T.exists(
    assert,
    $userRegistration.find('.why-google'),
    'Missing why google section'
  );
  T.exists(
    assert,
    $userRegistration.find('.why-google-desc'),
    'Missing why google description'
  );
  T.exists(
    assert,
    $userRegistration.find('.img-question'),
    'Missing image question'
  );
  T.exists(
    assert,
    $userRegistration.find('.divider'),
    'Missing divider section'
  );
  T.exists(assert, $userRegistration.find('.divider-text'), 'Missing or');
  T.exists(
    assert,
    $userRegistration.find('.email-sign-up'),
    'Missing email sign up section'
  );
  T.exists(
    assert,
    $userRegistration.find('.no-google-account'),
    'Missing no google account'
  );
  T.exists(
    assert,
    $userRegistration.find('.email-sign-up button'),
    'Missing sign up email button'
  );
  T.exists(assert, $userRegistration.find('.footer'), 'Missing footer section');
  T.exists(
    assert,
    $userRegistration.find('.log-in-here'),
    'Missing login here link'
  );
});
