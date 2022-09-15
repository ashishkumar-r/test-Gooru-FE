import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'gru-copy-value',
  'Integration | Component | gru copy value',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
    }
  }
);

test('Layout', function(assert) {
  assert.expect(5);

  const value = 'value-to-copy';
  const tooltipCode = 'teacher-landing.class.click-to-copy';

  this.set('value', value);
  this.set('tooltipCode', tooltipCode);

  this.render(hbs`{{gru-copy-value value=value tooltipCode=tooltipCode}}`);
  const $component = this.$(); //component dom element

  const $inputHidden = $component.find('input');
  const $copyButton = $component.find('.copy-btn');

  T.exists(assert, $inputHidden, 'Missing class statistics title');
  T.exists(assert, $copyButton, 'Missing copy button');
  T.exists(
    assert,
    $copyButton.find('.gru-icon.content_copy'),
    'Missing correct icon'
  );

  assert.equal($inputHidden.val(), 'value-to-copy', 'Wrong value to be copied');
  assert.equal(
    $copyButton.attr('data-original-title'),
    'Click to copy class code',
    'Wrong tooltip for button'
  );
});
