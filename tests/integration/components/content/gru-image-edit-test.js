import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
moduleForComponent(
  'content/gru-image-edit',
  'Integration | Component | content/gru image edit',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');
    }
  }
);

test('Layout without image - edit', function(assert) {
  this.render(
    hbs`{{content/gru-image-edit isEditing=true srcImage=null editImage=null }}`
  );

  const $component = this.$('.content.gru-image-edit');
  assert.ok($component.length, 'Component found');
  assert.ok($component.hasClass('is-editing'), 'Edit class');
  assert.ok($component.find('div > i.library_add').length, 'Image placeholder');
  assert.ok(
    $component.find('.image-edit-actions > .file-picker').length,
    'File picker'
  );
  assert.equal(
    $component
      .find('.image-edit-actions > .file-picker')
      .text()
      .trim(),
    this.get('i18n').t('common.upload-photo').string,
    'Upload photo button text'
  );
});

test('Layout with image - edit', function(assert) {
  var imageUrl = '/path/image.png';
  this.set('imageUrl', imageUrl);
  this.render(
    hbs`{{content/gru-image-edit isEditing=true srcImage=imageUrl editImage=imageUrl}}`
  );

  const $component = this.$('.content.gru-image-edit');
  assert.ok($component.length, 'Component found');
  assert.ok($component.hasClass('is-editing'), 'Edit class');
  assert.ok($component.hasClass('has-edit-image'), 'Has image class');
  assert.ok($component.find('div > img.img-responsive').length, 'Image');
  assert.ok(
    $component.find('div > img.img-responsive').prop('src'),
    '/path/image.png',
    'Image url'
  );
  assert.ok(
    $component.find('.image-edit-actions .file-picker').length,
    'File picker'
  );
  assert.equal(
    $component
      .find('.image-edit-actions > .file-picker')
      .text()
      .trim(),
    this.get('i18n').t('common.update-photo').string,
    'Update Photo text'
  );
  assert.ok(
    $component.find('.remove-photo > span.delete').length,
    'Delete Photo text'
  );
});

skip('Delete photo button will replace currently selected image into default', function(assert) {
  var imageUrl = '/path/image.png';
  this.set('imageUrl', imageUrl);
  this.render(
    hbs`{{content/gru-image-edit isEditing=true srcImage=imageUrl editImage=imageUrl}}`
  );

  const $component = this.$('.content.gru-image-edit');
  assert.ok(
    $component.find('div > img.img-responsive').prop('src'),
    '/path/image.png',
    'Image exits'
  );
  assert.ok(
    $component.find('.image-edit-actions .remove-photo span.delete').length,
    'Remove photo text exits'
  );
  $component.find('.image-edit-actions .remove-photo span.delete').click();

  assert.notOk(
    $component.find('.image-edit-actions .remove-photo span.delete').length,
    'Remove photo should not be exits'
  );
  assert.equal(
    $component
      .find('.image-edit-actions .file-picker')
      .text()
      .trim(),
    this.get('i18n').t('common.upload-photo').string,
    'Upload photo should be exits'
  );
});
