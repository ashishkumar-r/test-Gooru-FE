import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Category from 'gooru-web/models/rubric/rubric-category';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

moduleForComponent(
  'content/rubric/gru-category',
  'Integration | Component | content/rubric/gru category',
  {
    integration: true
  }
);

test('Category collapsed', function(assert) {
  let category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category Title'
  });

  this.set('category', category);

  this.render(hbs`{{content/rubric/gru-category category=category index=1}}`);
  const $component = this.$();

  assert.ok(
    $component.find('.category-index').length,
    'Missing category index'
  );
  assert.ok(
    $component.find('.required').length,
    'Missing Category Title Label'
  );
  assert.ok($component.find('a.title h2').length, 'Missing title');
  assert.ok(
    $component.find('.actions .item-actions.border').length,
    'Missing category actions'
  );
  assert.ok(
    $component.find('.actions .item-actions.border .delete').length,
    'Missing delete category button'
  );
  assert.ok(
    $component.find('.actions .item-actions.border .edit').length,
    'Missing edit category button'
  );
  assert.ok(
    $component.find('.actions .item-actions.border .copy').length,
    'Missing copy category button'
  );
});

test('Category expanded', function(assert) {
  let category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category Title'
  });

  this.set('category', category);
  this.set('isPanelExpanded', true);
  this.set('isEditingInline', true);

  this.render(
    hbs`{{content/rubric/gru-category category=category index=1 isEditingInline=isEditingInline isPanelExpanded=isPanelExpanded}}`
  );
  const $component = this.$();

  assert.ok(
    $component.find('.actions .item-actions').length,
    'Missing category actions'
  );
  assert.ok(
    $component.find('.actions .item-actions .cancel').length,
    'Missing cancel category button'
  );
  assert.ok(
    $component.find('.actions .item-actions .save').length,
    'Missing save category button'
  );
  assert.notOk(
    $component.find('.actions .panel-body .feedback label').length,
    'Missing category feedback'
  );
  assert.notOk(
    $component.find('.actions .panel-body .required-feedback').length,
    'Missing requires feedback checkbox'
  );
});

test('Delete Category', function(assert) {
  assert.expect(1);

  let categoryDelete = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test'
  });

  this.on('parentAction', function(category) {
    assert.ok(categoryDelete, category);
  });

  this.set('category', categoryDelete);
  this.render(
    hbs`{{content/rubric/gru-category category=category onDeleteCategory='parentAction'}}`
  );

  var $component = this.$();
  var $delete = $component.find('.btn.delete');
  $delete.click();
});

test('Copy Category', function(assert) {
  assert.expect(1);

  let categoryCopy = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test'
  });

  this.on('parentAction', function(category) {
    assert.ok(categoryCopy, category);
  });

  this.set('category', categoryCopy);
  this.render(
    hbs`{{content/rubric/gru-category category=category onCopyCategory='parentAction'}}`
  );

  var $component = this.$();
  var $copy = $component.find('.btn.copy');
  $copy.click();
});

test('Edit Category', function(assert) {
  assert.expect(4);

  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    allowsLevels: true,
    levels: Ember.A([
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      }
    ])
  });

  this.set('category', category);
  this.on('parentAction', function(categoryParam) {
    assert.ok(category, categoryParam, 'Category on action does not match');
  });
  this.render(
    hbs`{{content/rubric/gru-category category=category onUpdateCategory='parentAction'}}`
  );

  var $component = this.$();
  var $edit = $component.find('.btn.edit');
  $edit.click();
  return wait().then(function() {
    var $scoringLevels = $component.find('.gru-scoring-levels');
    assert.ok($scoringLevels.length, 'Missing scoring levels');
    const $titleField = $component.find('.edit-title .input .gru-input');
    $titleField.find('input').val('Category 1');
    $titleField.find('input').blur();
    const $levelField = $component.find(
      '.gru-scoring-levels .level-list .gru-input:first-child'
    );
    $levelField.find('input').val('Level 1');
    $levelField.find('input').blur();

    const $save = $component.find('.detail .actions .save');
    $save.click();
    return wait().then(function() {
      assert.equal(
        $component.find('.title h2').text(),
        'Category 1',
        'Incorrect Title'
      );
      $edit.click();
      return wait().then(function() {
        assert.equal(
          $levelField.find('input').val(),
          'Level 1',
          'Incorrect Level'
        );
      });
    });
  });
});

test('Validate if the category title field is left blank', function(assert) {
  assert.expect(2);

  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: '',
    levels: Ember.A([
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      }
    ])
  });

  this.set('category', category);
  this.render(hbs`{{content/rubric/gru-category category=category}}`);

  const $component = this.$();
  var $edit = $component.find('.btn.edit');
  $edit.click();
  return wait().then(function() {
    const $titleField = $component.find('.edit-title .input .gru-input');

    const $save = $component.find('.detail .actions .save');
    $save.click();
    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Title error should be visible'
      );
      $titleField.find('input').val('Category');
      $titleField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$titleField.find('.error-messages .error').length,
          'Title error message was hidden'
        );
      });
    });
  });
});

test('Validate if the rubric title field has only whitespaces', function(
  assert
) {
  assert.expect(2);

  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: '',
    levels: Ember.A([
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      }
    ])
  });

  this.set('category', category);
  this.render(hbs`{{content/rubric/gru-category category=category}}`);

  const $component = this.$();
  var $edit = $component.find('.btn.edit');
  $edit.click();
  return wait().then(function() {
    const $titleField = $component.find('.edit-title .input .gru-input');
    const $save = $component.find('.detail .actions .save');
    $save.click();
    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Category Title error should be visible'
      );
      $titleField.find('input').val(' ');
      $save.click();
      return wait().then(function() {
        assert.ok(
          $titleField.find('.error-messages .error').length,
          'Category Title error message should be visible'
        );
      });
    });
  });
});

test('Validate the character limit in the category title field', function(
  assert
) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    levels: Ember.A([
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      },
      {
        name: '',
        score: null
      }
    ])
  });

  this.set('category', category);
  this.render(hbs`{{content/rubric/gru-category category=category}}`);

  const $component = this.$();
  var $edit = $component.find('.btn.edit');
  $edit.click();
  return wait().then(function() {
    const maxLenValue = $component
      .find('.gru-category .edit-title .input .gru-input input')
      .prop('maxlength');
    assert.equal(maxLenValue, 50, 'Incorrect input max length');
  });
});

test('Category on preview', function(assert) {
  let category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category Title'
  });

  this.set('category', category);
  this.set('preview', true);

  this.render(
    hbs`{{content/rubric/gru-category category=category index=1 preview=preview}}`
  );
  const $component = this.$();

  assert.ok(
    $component.find('.category-index').length,
    'Missing category index'
  );
  assert.ok(
    $component.find('.required').length,
    'Missing Category Title Label'
  );
  assert.ok($component.find('a.title h2').length, 'Missing title');
  assert.notOk(
    $component.find('.actions .item-actions.border').length,
    'Category actions should not appear'
  );
  assert.notOk(
    $component.find('.actions .item-actions.border .delete').length,
    'Delete category button should not appear'
  );
  assert.notOk(
    $component.find('.actions .item-actions.border .edit').length,
    'Edit category button should not appear'
  );
  assert.notOk(
    $component.find('.actions .item-actions.border .copy').length,
    'Copy category button should not appear'
  );
});

test('Category on preview-show information', function(assert) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    levels: Ember.A([
      {
        name: 'Level 1',
        score: null
      },
      {
        name: 'Level 2',
        score: null
      },
      {
        name: 'Level 3',
        score: null
      }
    ])
  });

  this.set('category', category);
  this.set('preview', true);

  this.render(
    hbs`{{content/rubric/gru-category category=category preview=preview}}`
  );

  const $component = this.$();
  var $showInfo = $component.find('.panel-heading a.title');
  $showInfo.click();
  return wait().then(function() {
    var $scoringLevels = $component.find('.gru-scoring-levels');
    assert.ok($scoringLevels.length, 'Missing scoring levels');
  });
});
