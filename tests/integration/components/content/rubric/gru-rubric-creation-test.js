import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Rubric from 'gooru-web/models/rubric/rubric';

moduleForComponent(
  'content/rubric/gru-rubric-creation',
  'Integration | Component | content/rubric/gru rubric creation',
  {
    integration: true
  }
);

test('Rubric creation Layout', function(assert) {
  this.render(hbs`{{content/rubric/gru-rubric-creation}}`);
  const $component = this.$();
  assert.ok(
    $component.find('.gru-rubric-creation #from-web').length,
    'Missing From Web Tab'
  );
  assert.ok(
    $component.find('.gru-rubric-creation #from-web .add-from-web .url-label')
      .length,
    'Missing URL label'
  );
  assert.ok(
    $component.find('.gru-rubric-creation #from-web .add-from-web .add-btn')
      .length,
    'Missing add button'
  );
  var $fromComputerTab = $component.find('.gru-rubric-creation #from-web');
  assert.ok($fromComputerTab.length, 'Missing From Your Computer Tab');
  $fromComputerTab.click();
  return wait().then(function() {
    assert.ok(
      $component.find('.gru-rubric-creation #from-computer .add-from-computer')
        .length,
      'Should switch to From Your Computer Tab'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .information'
      ).length,
      'Missing upload subheader'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .information .icon'
      ).length,
      'Missing upload icon'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .information .title'
      ).length,
      'Missing upload title'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .filename-label'
      ).length,
      'Missing filename section'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .filename-label span.file-name'
      ).length,
      'Missing filename label'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .filename-label .formats'
      ).length,
      'Missing available formats'
    );
    assert.ok(
      $component.find(
        '.gru-rubric-creation #from-computer .add-from-computer .gru-file-picker'
      ).length,
      'Missing file picker component'
    );
    assert.ok(
      $component.find('.gru-preview-url').length,
      'Missing preview component'
    );
  });
});

test('Rubric creation Layout with file uploaded', function(assert) {
  this.set(
    'rubric',
    Rubric.create({
      uploaded: true
    })
  );
  this.render(hbs`{{content/rubric/gru-rubric-creation}}`);
  const $component = this.$();
  assert.ok(
    $component.find('.gru-rubric-creation #from-computer .add-from-computer')
      .length,
    'Should switch to From Your Computer Tab'
  );
  assert.ok(
    $component.find(
      '.gru-rubric-creation #from-computer .add-from-computer .gru-file-picker'
    ).length,
    'Missing file picker component'
  );
  assert.ok(
    $component.find('.gru-preview-url').length,
    'Missing preview component'
  );
});
