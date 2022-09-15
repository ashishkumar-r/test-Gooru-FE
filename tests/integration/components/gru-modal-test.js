import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('gru-modal', 'Integration | Component | gru modal', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
  }
});

test('it renders', function(assert) {
  this.render(hbs`{{gru-modal}}`);

  var $component = this.$(); //component dom element
  var $rootElement = $component.find('.gru-modal');
  assert.ok($rootElement, 'Root element not found');
  assert.ok(
    $rootElement.hasClass('modal'),
    'Component should have class to identify it as a modal'
  );
});
