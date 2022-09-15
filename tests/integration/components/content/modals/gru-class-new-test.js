import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-class-new',
  'Integration | Component | content/modals/gru class new',
  {
    integration: true
  }
);

test('show spinner button component while the server response, after clicking on create button', function(
  assert
) {
  assert.expect(1);

  this.render(hbs`{{content/modals/gru-class-new}}`);

  const $createClassContainer = this.$('.gru-class-new');
  const $titleField = $createClassContainer.find('.gru-input.title');

  $titleField.find('input').val('any');
  $titleField.find('input').blur();
  $createClassContainer.find('button.get-started-btn').click();

  return wait().then(function() {
    assert.ok(
      $createClassContainer.find('.gru-spinner-button .has-spinner').length,
      'Spinner button should appear'
    );
  });
});
