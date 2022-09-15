import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'player/resources/gru-vimeo-resource',
  'Unit | Component | player/resources/ gru vimeo resource',
  {
    integration: false
  }
);

test('getVimeoID default url', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var id = component.getVimeoID('https://vimeo.com/11590751');
  assert.equal(id, 11590751, 'Incorrect ID');
});
test('getVimeoID non default vimeo url', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var id = component.getVimeoID('http://vimeo.com/11590751');
  assert.equal(id, 11590751, 'Incorrect ID');
});
test('getVimeoID vimeo url with numbers', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var id = component.getVimeoID('http://12vimeo.com/11590751');
  assert.equal(id, 11590751, 'Incorrect ID');
});
test('getVimeoID when no id provided', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var id = component.getVimeoID('https://vimeo.com/');
  assert.equal(id, '', 'Should be empty');
});
