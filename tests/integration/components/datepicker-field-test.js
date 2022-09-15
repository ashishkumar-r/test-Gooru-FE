import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'datepicker-field',
  'Integration | Component | datepicker field',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('renders datepicker', function(assert) {
  assert.expect(4); // making sure all asserts are called

  this.render(
    hbs`{{datepicker-field onSelectDateAction=onSelectDateOfBirthAction placeholder='MyBirthday'}}`
  ); // render the component
  var $component = this.$(); // component dom element

  T.exists(
    assert,
    $component.find('div.datepicker'),
    'Div container element not found'
  );
  T.exists(
    assert,
    $component.find('input.datepicker'),
    'Missing datepicker textbox'
  );
  T.exists(
    assert,
    $component.find('button.datepicker-icon'),
    'Datepicker icon element not found'
  );
  assert.equal(
    this.$('input.datepicker').attr('placeholder'),
    'MyBirthday',
    'Wrong placeholder'
  );
});

test('renders datepicker with selected date', function(assert) {
  assert.expect(5); // making sure all asserts are called

  this.render(
    hbs`{{datepicker-field onSelectDateAction=onSelectDateOfBirthAction placeholder='MyBirthday' selectedDate='10/21/2015'}}`
  ); // render the component
  var $component = this.$(); // component dom element

  T.exists(
    assert,
    $component.find('div.datepicker'),
    'Div container element not found'
  );
  T.exists(
    assert,
    $component.find('input.datepicker'),
    'Missing datepicker textbox'
  );
  T.exists(
    assert,
    $component.find('button.datepicker-icon'),
    'Datepicker icon element not found'
  );
  assert.equal(
    this.$('input.datepicker').attr('placeholder'),
    'MyBirthday',
    'Wrong placeholder'
  );
  assert.equal(this.$('input.datepicker').val(), '10/21/2015', 'Wrong value');
});
