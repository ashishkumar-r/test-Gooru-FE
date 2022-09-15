import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'gru-share-pop-over',
  'Integration | Component | gru share pop over',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
    }
  }
);

test('it renders for course', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{#gru-share-pop-over tagName="button" type="course"}}
    {{gru-icon name="insert_link"}}
  {{/gru-share-pop-over}}`);

  let $component = this.$();
  let $button = $component.find('.gru-share-pop-over');
  T.exists(assert, $button, 'Missing the button');
  T.exists(assert, $button.find('.gru-icon'), 'Missing the button');
});

test('it renders for resources', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{#gru-share-pop-over tagName="button" type="resource"}}
    {{gru-icon name="insert_link"}}
  {{/gru-share-pop-over}}`);

  let $component = this.$();
  let $button = $component.find('.gru-share-pop-over');
  T.exists(assert, $button, 'Missing the button');
  T.exists(assert, $button.find('.gru-icon'), 'Missing the button');
});

test('it renders for questions', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{#gru-share-pop-over tagName="button" type="question"}}
    {{gru-icon name="insert_link"}}
  {{/gru-share-pop-over}}`);

  let $component = this.$();
  let $button = $component.find('.gru-share-pop-over');
  T.exists(assert, $button, 'Missing the button');
  T.exists(assert, $button.find('.gru-icon'), 'Missing the button');
});

test('it renders for collections', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{#gru-share-pop-over tagName="button" type="collection"}}
    {{gru-icon name="insert_link"}}
  {{/gru-share-pop-over}}`);

  let $component = this.$();
  let $button = $component.find('.gru-share-pop-over');
  T.exists(assert, $button, 'Missing the button');
  T.exists(assert, $button.find('.gru-icon'), 'Missing the button');
});

test('it renders for assessments', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{#gru-share-pop-over tagName="button" type="assessment"}}
    {{gru-icon name="insert_link"}}
  {{/gru-share-pop-over}}`);

  let $component = this.$();
  let $button = $component.find('.gru-share-pop-over');
  T.exists(assert, $button, 'Missing the button');
  T.exists(assert, $button.find('.gru-icon'), 'Missing the button');
});

test('it renders for rubric', function(assert) {
  this.render(hbs`{{#gru-share-pop-over tagName="button" type="rubric"}}
    {{gru-icon name="insert_link"}}
  {{/gru-share-pop-over}}`);

  let $component = this.$();
  let $button = $component.find('.gru-share-pop-over');
  T.exists(assert, $button, 'Missing the button');
  T.exists(assert, $button.find('.gru-icon'), 'Missing the button');
});
