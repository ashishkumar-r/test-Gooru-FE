import { test, moduleForComponent } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { ASSESSMENT_SHOW_VALUES } from 'gooru-web/config/config';

moduleForComponent(
  'content/gru-settings-edit',
  'Integration | Component | gru settings edit',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');
      this.register('service:popover', Ember.Service.extend({}));
    }
  }
);

test('Layout of settings component', function(assert) {
  this.set('model', { isVisibleOnProfile: false });
  this.render(hbs`{{content/gru-settings-edit id="settings" model=model}}`);

  var $settingsComponent = this.$();
  assert.ok($settingsComponent.find('.header h2').length, 'Section title');
  assert.ok(
    $settingsComponent.find('.panel-heading h3').length,
    'Panel subtitle'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .setting.publish-to i.visibility')
      .length,
    'Visibility icon'
  );
  assert.ok(
    $settingsComponent.find(
      '.panel-body .setting.publish-to i.visibility + span'
    ).length,
    'Visibility label'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .publish-to .gru-switch .toggle')
      .length,
    'Profile toggle button'
  );
  //assert.ok($settingsComponent.find('.panel-body .setting.request-to i.public').length, "Public icon");
  //assert.ok($settingsComponent.find('.panel-body .setting.request-to i.public + span').length, "Public label");
});

test('Layout of settings component for assessment', function(assert) {
  this.set('model', { isAssessment: true, isVisibleOnProfile: true });
  this.render(hbs`{{content/gru-settings-edit id="settings" model=model}}`);

  var $settingsComponent = this.$();
  assert.ok($settingsComponent.find('.header h2').length, 'Section title');
  assert.ok(
    $settingsComponent.find('.panel-heading h3').length,
    'Panel subtitle'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .setting.publish-to i.visibility')
      .length,
    'Visibility icon'
  );
  assert.ok(
    $settingsComponent.find(
      '.panel-body .setting.publish-to i.visibility + span'
    ).length,
    'Visibility label'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .publish-to .gru-switch .toggle')
      .length,
    'Profile toggle button'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .bidirectional .gru-switch .toggle')
      .length,
    'Backwards toggle button'
  );
  assert.equal(
    $settingsComponent.find('.panel-body .feedback .gru-radio').length,
    3,
    'Feedback radio buttons'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .answer-key .gru-switch .toggle')
      .length,
    'Answer key toggle button'
  );
  assert.ok(
    $settingsComponent.find('.panel-body .attempts .gru-select').length,
    'Attempts dropdown'
  );
  //assert.ok($settingsComponent.find('.panel-body .setting.request-to i.public').length, "Public icon");
  //assert.ok($settingsComponent.find('.panel-body .setting.request-to i.public + span').length, "Public label");
});

test('External action gets called on visibility switch change', function(assert) {
  assert.expect(3);
  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set('model', { isVisibleOnProfile: false });
  this.render(
    hbs`{{content/gru-settings-edit id="settings" action='externalAction' model=model}}`
  );

  var $toggle = this.$().find('.panel-body .publish-to .gru-switch .toggle');
  assert.ok($toggle.hasClass('off'), 'Toggle off by default');
  Ember.run(() => {
    $toggle.click();
  });
  assert.notOk($toggle.hasClass('off'), 'Toggle on after clicked');
});

test('External action gets called on backwards switch change', function(assert) {
  assert.expect(4);
  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set('model', {
    isAssessment: true,
    bidirectional: false,
    showFeedback: ASSESSMENT_SHOW_VALUES.NEVER
  });
  this.render(
    hbs`{{content/gru-settings-edit id="settings" action='externalAction' model=model}}`
  );

  var $toggle = this.$().find('.panel-body .bidirectional .gru-switch .toggle');
  assert.ok($toggle.hasClass('off'), 'Toggle off by default');
  Ember.run(() => {
    $toggle.click();
  });
  assert.notOk($toggle.hasClass('off'), 'Toggle on after clicked');
  assert.equal(
    this.get('model.showFeedback'),
    ASSESSMENT_SHOW_VALUES.SUMMARY,
    'Feedback value'
  );
});

test('External action gets called on answer key switch change', function(assert) {
  assert.expect(4);
  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set('model', { isAssessment: true, showKey: false, attempts: -1 });
  this.render(
    hbs`{{content/gru-settings-edit id="settings" action='externalAction' model=model}}`
  );

  var $toggle = this.$().find('.panel-body .answer-key .gru-switch .toggle');
  assert.ok($toggle.hasClass('off'), 'Toggle off by default');
  Ember.run(() => {
    $toggle.click();
  });
  assert.notOk($toggle.hasClass('off'), 'Toggle on after clicked');
  assert.equal(this.get('model.attempts'), 1, 'Attempts value');
});

test('External action gets called on feedback change', function(assert) {
  assert.expect(8);
  this.on('externalAction', function() {
    assert.ok(true);
  });

  this.set('model', {
    isAssessment: true,
    showFeedback: ASSESSMENT_SHOW_VALUES.NEVER
  });
  this.render(
    hbs`{{content/gru-settings-edit id="settings" action='externalAction' model=model}}`
  );

  var $summary = this.$().find(
    `.panel-body .feedback .gru-radio input[value="${ASSESSMENT_SHOW_VALUES.SUMMARY}"]`
  );
  var $immediate = this.$().find(
    `.panel-body .feedback .gru-radio input[value="${ASSESSMENT_SHOW_VALUES.IMMEDIATE}"]`
  );
  var $never = this.$().find(
    `.panel-body .feedback .gru-radio input[value="${ASSESSMENT_SHOW_VALUES.NEVER}"]`
  );
  assert.notOk(
    $summary.parents('.ember-radio-button').hasClass('checked'),
    'Not checked by default'
  );
  assert.notOk(
    $immediate.parents('.ember-radio-button').hasClass('checked'),
    'Not checked by default'
  );
  assert.ok(
    $never.parents('.ember-radio-button').hasClass('checked'),
    'Checked by default'
  );

  Ember.run(() => {
    $immediate.click();
  });

  assert.notOk(
    $summary.parents('.ember-radio-button').hasClass('checked'),
    'Not checked by default'
  );
  assert.ok(
    $immediate.parents('.ember-radio-button').hasClass('checked'),
    'Checked after clicked'
  );
  assert.notOk(
    $never.parents('.ember-radio-button').hasClass('checked'),
    'Not checked after change'
  );
  assert.equal(
    this.get('model.showFeedback'),
    ASSESSMENT_SHOW_VALUES.IMMEDIATE,
    'Feedback value'
  );
});
