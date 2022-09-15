import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'gru-user-sign-up-cancel',
  'Integration | Component | gru user sign up cancel',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);
test('Cancel Signup Confirmation', function(assert) {
  assert.expect(8);
  this.render(hbs`{{gru-user-sign-up-cancel}}`);
  var $component = this.$(); //component dom element
  const $cancelConfirmationSignup = $component.find(
    '.cancel-signup-confirmation-section'
  );
  T.exists(
    assert,
    $cancelConfirmationSignup,
    'Missing cancel confirmation section'
  );
  T.exists(assert, $cancelConfirmationSignup.find('.title'), 'Missing title');
  T.exists(
    assert,
    $cancelConfirmationSignup.find('.description'),
    'Missing description'
  );
  T.exists(
    assert,
    $cancelConfirmationSignup.find('.leave-registration-submit'),
    'Missing leave registration button'
  );
  T.exists(
    assert,
    $cancelConfirmationSignup.find('.continue-registration-submit'),
    'Missing continue registration button'
  );
  T.exists(
    assert,
    $cancelConfirmationSignup.find('.footer'),
    'Missing footer section'
  );
  T.exists(
    assert,
    $cancelConfirmationSignup.find('.footer-description'),
    'Missing footer description'
  );
  T.exists(
    assert,
    $cancelConfirmationSignup.find('.support-mail'),
    'Missing support email'
  );
});
