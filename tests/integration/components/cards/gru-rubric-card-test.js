import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'cards/gru-rubric-card',
  'Integration | Component | cards/gru rubric card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Rubric Card Layout', function(assert) {
  var rubric = Ember.Object.create({
    title: 'Rubric 1',
    thumbnail: 'assets/gooru/rubric-default.png'
  });

  this.set('rubric', rubric);
  assert.expect(6);
  this.render(hbs`{{cards/gru-rubric-card rubric=rubric}}`);

  var $component = this.$(); //component dom element

  const $rubricCard = $component.find('.gru-rubric-card');
  T.exists(assert, $rubricCard, 'Missing rubric card');

  const $cardHeader = $rubricCard.find('.panel-heading');
  T.exists(assert, $cardHeader, 'Missing header');
  T.exists(assert, $cardHeader.find('.image img'), 'Missing rubric image');

  const $rubricInfo = $cardHeader.find('.rubric-info');
  T.exists(
    assert,
    $rubricInfo.find('.title-section'),
    'Missing rubric info container'
  );
  T.exists(assert, $rubricInfo.find('.title-section h6'), 'Missing title');
  assert.equal(
    $rubricInfo.find('.title-section h6').text(),
    'Rubric 1',
    'Wrong title'
  );
});
