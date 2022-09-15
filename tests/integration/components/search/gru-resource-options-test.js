import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent(
  'gru-resource-options',
  'Integration | Component | gru-resource-options',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('gru-question-options-default', function(assert) {
  const selectedOptionType = Ember.A(['video']);

  this.set('selectedOptionType', selectedOptionType);

  this.render(
    hbs`{{search/gru-resource-options selectedOptionType=selectedOptionType}}`
  ); //render the component
  var $component = this.$(); //component dom element

  assert.expect(18); //making sure all asserts are called

  const $menuOptions = $component.find('.options');
  const $videoButton = $menuOptions.find('.video');
  T.exists(assert, $videoButton, 'Missing video button');
  T.exists(assert, $videoButton.find('.icon'), 'Missing icon video button');
  assert.equal(
    T.text($videoButton.find('.text')),
    'Video',
    'Incorrect video button text'
  );

  const $webPageButton = $menuOptions.find('.web-page');
  T.exists(assert, $webPageButton, 'Missing web page button');
  T.exists(
    assert,
    $webPageButton.find('.icon'),
    'Missing icon  web page button'
  );
  assert.equal(
    T.text($webPageButton.find('.text')),
    'Webpage',
    'Incorrect  web page button text'
  );

  const $interactiveButton = $component.find('.interactive');
  T.exists(assert, $interactiveButton, 'Missing interactive button');
  T.exists(
    assert,
    $interactiveButton.find('.icon'),
    'Missing icon interactive button'
  );
  assert.equal(
    T.text($interactiveButton.find('.text')),
    'Interactive',
    'Incorrect interactive button text'
  );

  const $imageButton = $component.find('.image');
  T.exists(assert, $imageButton, 'Missing fib button');
  T.exists(assert, $imageButton.find('.icon'), 'Missing icon image button');
  assert.equal(
    T.text($imageButton.find('.text')),
    'Image',
    'Incorrect image button text'
  );

  const $textButton = $component.find('.text');
  T.exists(assert, $textButton, 'Missing text button');
  T.exists(assert, $textButton.find('.icon'), 'Missing icon text button');
  assert.equal(
    T.text($textButton.find('.text')),
    'Text',
    'Incorrect text button text'
  );

  const $audioButton = $component.find('.audio');
  T.exists(assert, $audioButton, 'Missing audio button');
  T.exists(assert, $audioButton.find('.icon'), 'Missing icon audio button');
  assert.equal(
    T.text($audioButton.find('.text')),
    'Audio',
    'Incorrect audio button text'
  );
});

test('search-filter-onAudioClick', function(assert) {
  assert.expect(1); //making sure all asserts are called

  this.on('selectMenuOption', function(options) {
    assert.equal(options[0], 'audio', 'Incorrect audio option type');
  });

  this.render(
    hbs`{{search/gru-resource-options onSelectMenuOption='selectMenuOption'}}`
  );

  var $component = this.$(); //component dom element

  const $audioOptionButton = $component.find('.audio.btn-option');

  $audioOptionButton.click();
  assert.ok(
    !$audioOptionButton.hasClass('selected'),
    'Missing audio option selected'
  );
});
