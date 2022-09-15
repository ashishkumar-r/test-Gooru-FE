import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'player/resources/gru-vimeo-resource',
  'Integration | Component | player/resources/gru vimeo resource',
  {
    integration: true
  }
);

test('Vimeo resource layout', function(assert) {
  assert.expect(2);

  const resource = Ember.Object.create({
    id: 10,
    order: 2,
    resourceType: 'vimeo/video',
    resourceFormat: 'video',
    url: 'https://vimeo.com/11590751'
  });

  this.set('resource', resource);
  this.render(hbs`{{player/resources/gru-vimeo-resource resource=resource}}`);

  var $component = this.$(); //component dom element

  T.exists(
    assert,
    $component.find('.gru-vimeo-resource iframe'),
    'Missing youtube player element'
  );
  assert.equal(
    $component.find('iframe').attr('src'),
    '//player.vimeo.com/video/11590751',
    'Wrong url'
  );
});
