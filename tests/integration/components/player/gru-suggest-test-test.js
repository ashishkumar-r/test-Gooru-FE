import { moduleForComponent, test } from 'ember-qunit';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import { ASSESSMENT_SUB_TYPES } from 'gooru-web/config/config';

moduleForComponent(
  'player/gru-suggest-test',
  'Integration | Component | player/gru suggest test',
  {
    integration: true,

    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Layout', function(assert) {
  this.set('type', ASSESSMENT_SUB_TYPES.PRE_TEST);
  this.render(hbs`{{player/gru-suggest-test type=type}}`);
  const $component = this.$();
  assert.ok(
    $component.find('.player.gru-suggest-test').length,
    'Missing suggest test panel'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').length,
    'Missing lead'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-header`).string,
    'Wrong lead text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').length,
    'Missing description'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-lead`).string,
    'Wrong description text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .actions .btn-no')
      .length,
    'Missing no thanks button'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .actions .btn-suggestion'
    ).length,
    'Missing suggestion button'
  );
});

skip('Layout BackFill Pre test', function(assert) {
  this.set('type', ASSESSMENT_SUB_TYPES.BACKFILL);
  this.set('assessment', {
    isCollection: true,
    resources: Ember.A([])
  });
  this.set('suggestion', {
    thumbnail: 'image-test',
    title: 'Suggestion title',
    questionCount: '15',
    resourceCount: '3'
  });
  this.render(
    hbs`{{player/gru-suggest-test type=type assessment=assessment suggestion=suggestion}}`
  );
  const $component = this.$();
  assert.ok(
    $component.find('.player.gru-suggest-test').length,
    'Missing suggest test panel'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').length,
    'Missing lead'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-header`).string,
    'Wrong lead text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').length,
    'Missing description'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-lead`).string,
    'Wrong description text'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .assessment-info .image img'
    ).length,
    'Missing backfill image'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .assessment-info .title'
    ).length,
    'Missing collection title'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .assessment-info .resource'
    ).length,
    'Missing collection resources'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .assessment-info .resource.question'
    ).length,
    'Missing collection questions'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .actions .btn-no')
      .length,
    'Missing no thanks button'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .actions .btn-backfill'
    ).length,
    'Missing suggestion backfill button'
  );

  this.set('suggestion', {
    thumbnail: 'image-test',
    title: 'Suggestion title'
  });
  assert.notOk(
    $component.find(
      '.player.gru-suggest-test .panel-body .assessment-info .resource'
    ).length,
    'Collection resources not missing'
  );
  assert.notOk(
    $component.find(
      '.player.gru-suggest-test .panel-body .assessment-info .resource.question'
    ).length,
    'Collection questions not missing'
  );
});

skip('Layout Benchmark Post test', function(assert) {
  this.set('type', 'benchmark');
  this.set('assessment', { isCollection: true, resources: Ember.A([]) });
  this.render(hbs`{{player/gru-suggest-test type=type assessment=assessment}}`);
  const $component = this.$();
  assert.ok(
    $component.find('.player.gru-suggest-test').length,
    'Missing suggest test panel'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').length,
    'Missing lead'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-header`).string,
    'Wrong lead text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').length,
    'Missing description'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-lead`).string,
    'Wrong description text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .actions .btn-no')
      .length,
    'Missing no thanks button'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .actions .btn-benchmark'
    ).length,
    'Missing suggestion benchmark button'
  );
});

skip('Layout resource', function(assert) {
  this.set('type', 'resource');
  this.set('resource', { title: 'resource-title', resourceFormat: 'webpage' });
  this.render(hbs`{{player/gru-suggest-test type=type suggestion=resource}}`);
  const $component = this.$();
  assert.ok(
    $component.find('.player.gru-suggest-test').length,
    'Missing suggest test panel'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').length,
    'Missing lead'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .lead').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-header`).string,
    'Wrong lead text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').length,
    'Missing description'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .description').text(),
    this.get('i18n').t(`gru-suggest-test.${this.get('type')}-lead`).string,
    'Wrong description text'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .resource-info')
      .length,
    'Missing resource info section'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .resource-info .image i'
    ).length,
    'Missing resource icon'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .resource-info .info .title'
    ).length,
    'Missing resource title'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .resource-info .info .format'
    ).length,
    'Missing resource type'
  );
  assert.ok(
    $component.find('.player.gru-suggest-test .panel-body .actions .btn-no')
      .length,
    'Missing no thanks button'
  );
  assert.ok(
    $component.find(
      '.player.gru-suggest-test .panel-body .actions .btn-resource'
    ).length,
    'Missing suggestion resource button'
  );
});

skip('Layout disabled buttons on click', function(assert) {
  assert.expect(4);
  this.set('type', 'resource');
  this.set('resource', { title: 'resource-title', resourceFormat: 'webpage' });
  this.render(hbs`{{player/gru-suggest-test type=type suggestion=resource}}`);
  const $component = this.$();
  assert.notOk(
    $component
      .find('.player.gru-suggest-test .panel-body .actions .btn-no')
      .attr('disabled'),
    'No button should not be disabled'
  );
  assert.notOk(
    $component
      .find('.player.gru-suggest-test .panel-body .actions .btn-resource')
      .attr('disabled'),
    'Resource button should not be disabled'
  );
  $component
    .find('.player.gru-suggest-test .panel-body .actions .btn-resource')
    .click();

  let done = assert.async();
  return wait().then(() => {
    assert.ok(
      $component
        .find('.player.gru-suggest-test .panel-body .actions .btn-no')
        .attr('disabled'),
      'No button should be disabled'
    );
    assert.ok(
      $component
        .find('.player.gru-suggest-test .panel-body .actions .btn-resource')
        .attr('disabled'),
      'Resource button should not be disabled'
    );
    done();
  });
});
