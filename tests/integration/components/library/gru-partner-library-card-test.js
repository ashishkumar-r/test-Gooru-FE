import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'library/gru-partner-library-card',
  'Integration | Component | library/gru partner library card',
  {
    integration: true
  }
);

test('Partner Library card', function(assert) {
  var library = {
    id: 1,
    name: 'Partner library',
    description: 'Library description',
    image: 'image-url',
    tenant: 'tenant-id',
    tenantRoot: null,
    courseCount: 5,
    assessmentCount: 12,
    collectionCount: 15,
    resourceCount: 0,
    questionCount: 45,
    rubricCount: 0,
    sequence: 1,
    taxonomy: null
  };

  this.set('library', library);

  this.render(hbs`{{library/gru-partner-library-card content=library}}`);
  const $component = this.$('.gru-partner-library-card');
  assert.ok($component.length, 'Component found');

  const $header = $component.find('.panel-heading');
  assert.ok($header.length, 'Missing header');
  assert.ok($header.find('.title-section').length, 'Missing library name');

  const $body = $component.find('.panel-body');
  assert.ok($body.length, 'Missing body');
  assert.ok($body.find('.image img').length, 'Missing partner library image');
  assert.ok(
    $body.find('.description').length,
    'Missing partner library description'
  );
  assert.equal(
    $body
      .find('.description')
      .text()
      .trim(),
    'Library description',
    'Wrong description displayed'
  );

  const $footer = $component.find('.panel-footer');
  const $info = $footer.find('.library-info');
  assert.ok($info.length, 'Missing library info container');
  assert.equal(
    $info
      .find('.total-courses span')
      .text()
      .trim(),
    '5',
    'Missing courses count'
  );
  assert.equal(
    $info
      .find('.total-collections span')
      .text()
      .trim(),
    '15',
    'Missing collections count'
  );
  assert.equal(
    $info
      .find('.total-assessments span')
      .text()
      .trim(),
    '12',
    'Missing assessments count'
  );
  assert.notOk(
    $info.find('.total-resources span').length,
    'Resources count should not be displayed'
  );
  assert.equal(
    $info
      .find('.total-questions span')
      .text()
      .trim(),
    '45',
    'Missing questions count'
  );
  assert.notOk(
    $info.find('.total-rubrics span').length,
    'Rubrics count should not be displayed'
  );
});
