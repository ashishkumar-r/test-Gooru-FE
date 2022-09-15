import { moduleForComponent, test } from 'ember-qunit';
import Category from 'gooru-web/models/rubric/rubric-category';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

moduleForComponent(
  'content/rubric/gru-category',
  'Unit | Component | content/rubric/gru category',
  {
    unit: true,
    needs: ['validator:presence']
  }
);

test('setFeedBack', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {})
  });
  assert.equal(
    component.get('category.requiresFeedback'),
    true,
    'Feedback should be required'
  );
  component.send('setFeedBack');
  assert.equal(
    component.get('category.requiresFeedback'),
    false,
    'Feedback should not be required'
  );
});

test('editInline', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'test'
    })
  });
  assert.equal(
    component.get('isPanelExpanded'),
    false,
    'Panel should not expanded'
  );
  assert.equal(
    component.get('isEditingInline'),
    false,
    'Should not edit inline'
  );
  component.send('editInline');
  assert.equal(
    component.get('tempCategory').get('title'),
    component.get('category').get('title'),
    'Should copy the category'
  );
  assert.equal(
    component.get('isPanelExpanded'),
    true,
    'Panel should be expanded'
  );
  assert.equal(component.get('isEditingInline'), true, 'Should edit inline');
});

test('showInfo', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'test'
    })
  });
  assert.equal(
    component.get('isPanelExpanded'),
    false,
    'Panel should not expanded'
  );
  component.send('showInfo');
  assert.equal(
    component.get('isPanelExpanded'),
    true,
    'Panel should be expanded'
  );
});

test('cancel', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'test'
    })
  });
  component.send('editInline');
  assert.equal(
    component.get('isPanelExpanded'),
    true,
    'Panel should be expanded'
  );
  assert.equal(component.get('isEditingInline'), true, 'Should edit inline');

  component.send('cancel');
  assert.equal(
    component.get('isPanelExpanded'),
    false,
    'Panel should not expanded'
  );
  assert.equal(
    component.get('isEditingInline'),
    false,
    'Should not edit inline'
  );
});
test('copyCategory', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'test'
    })
  });
  let categoryCopy = { id: 'category-test' };
  component.set('sendAction', function(actionName, category, index) {
    assert.equal(actionName, 'onCopyCategory', 'Action sent should match');
    assert.equal(category, categoryCopy, 'Category should match');
    assert.equal(index, 1, 'Index should match');
  });
  component.send('copyCategory', categoryCopy, 1);
});
test('saveCategory', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'test'
    }),
    tempCategory: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'copy category'
    })
  });
  component.set('sendAction', function(actionName, category) {
    assert.equal(actionName, 'onUpdateCategory', 'Action sent should match');
    assert.equal(
      category.get('title'),
      component.get('tempCategory').get('title'),
      'Incorrect value in update action'
    );
  });
  component.send('saveCategory');
  return wait().then(function() {
    assert.equal(
      component.get('category').get('title'),
      component.get('tempCategory').get('title'),
      'Incorrect save'
    );
  });
});
test('deleteCategory', function(assert) {
  let component = this.subject({
    category: Category.create(Ember.getOwner(this).ownerInjection(), {
      title: 'test'
    })
  });
  let categoryDelete = { id: 'category-test' };
  component.set('sendAction', function(actionName, category) {
    assert.equal(actionName, 'onDeleteCategory', 'Action sent should match');
    assert.equal(category, categoryDelete, 'Category should match');
  });
  component.send('deleteCategory', categoryDelete);
});
