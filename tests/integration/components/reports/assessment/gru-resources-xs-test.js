import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import resourceResult from 'gooru-web/models/result/resource';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/gru-resources-xs',
  'Integration | Component | reports/assessment/gru resources xs',
  {
    integration: true
  }
);

test('Questions Details Mobile Layout', function(assert) {
  assert.expect(6);

  const resourceResults = Ember.A([
    resourceResult.create({
      resource: Ember.Object.create({
        title: 'Resource Title 1',
        format: 'interactive',
        order: 1
      }),
      reaction: 4,
      timeSpent: 2096
    }),
    resourceResult.create({
      resource: Ember.Object.create({
        title: 'Resource Title 2',
        format: 'image',
        order: 2
      }),
      reaction: 2,
      timeSpent: 1096
    })
  ]);

  this.set('resourceResults', resourceResults);
  this.render(
    hbs`{{reports/assessment/gru-resources-xs results=resourceResults}}`
  );
  const $component = this.$(); //component dom element
  const $resource = $component.find('.gru-resources-xs');

  T.exists(assert, $resource, 'Missing resources-xs component');
  T.exists(
    assert,
    $resource.find('.resource-number'),
    'Missing resource number column'
  );
  T.exists(
    assert,
    $resource.find('.resource-text'),
    'Missing resource text column'
  );
  T.exists(
    assert,
    $resource.find('.resource-container'),
    'Missing resource container'
  );
  T.exists(
    assert,
    $resource.find('.resource-container .image'),
    'Missing resource icon'
  );
  T.exists(assert, $resource.find('.time-spent'), 'Missing time-spent column');
});
