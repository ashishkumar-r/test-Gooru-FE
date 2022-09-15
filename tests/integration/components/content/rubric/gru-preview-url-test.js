import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import ResourceModel from 'gooru-web/models/resource/resource';

moduleForComponent(
  'content/rubric/gru-preview-url',
  'Integration | Component | content/rubric/gru preview url',
  {
    integration: true
  }
);
test('Preview url layout', function(assert) {
  assert.expect(2);

  this.render(
    hbs`{{content/rubric/gru-preview-url resource=resource isRubric=true}}`
  );

  var $component = this.$();

  assert.ok(
    $component.find('.gru-preview-url .preview.show-legend span').length,
    'Missing preview legend'
  );

  const resource = ResourceModel.create({
    url: 'http://www.water4all.org/us/'
  });
  this.set('resource', resource);

  assert.ok(
    $component.find('.gru-preview-url .preview.show-url').length,
    'Missing url preview'
  );
});

test('Show url', function(assert) {
  assert.expect(2);

  const resource = ResourceModel.create({
    url: 'http://www.water4all.org/us/'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/rubric/gru-preview-url resource=resource}}`);

  var $component = this.$();

  assert.ok(
    $component.find('.gru-preview-url iframe').length,
    'Missing url preview'
  );
  assert.equal(
    $component.find('iframe').attr('src'),
    'http://www.water4all.org/us/',
    'Wrong url'
  );
});

test('Show image', function(assert) {
  assert.expect(2);

  const resource = ResourceModel.create({ url: 'test/images/icon.png' });

  this.set('resource', resource);

  this.render(hbs`{{content/rubric/gru-preview-url resource=resource}}`);

  var $component = this.$();
  assert.ok(
    $component.find('.gru-preview-url iframe').length,
    'Missing url preview'
  );
  assert.equal(
    $component.find('iframe').attr('src'),
    'test/images/icon.png',
    'Wrong url'
  );
});

test('Show PDF', function(assert) {
  assert.expect(2);

  const resource = ResourceModel.create({
    url: 'http://www.worldanimalfoundation.net/f/koala.pdf'
  });

  this.set('resource', resource);

  this.render(hbs`{{content/rubric/gru-preview-url resource=resource}}`);

  var $component = this.$();

  assert.ok(
    $component.find('.gru-preview-url iframe').length,
    'Missing url preview'
  );
  assert.equal(
    $component.find('iframe').attr('src'),
    'http://www.worldanimalfoundation.net/f/koala.pdf',
    'Wrong url'
  );
});
