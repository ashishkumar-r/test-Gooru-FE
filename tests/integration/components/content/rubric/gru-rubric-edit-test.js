import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import RubricModel from 'gooru-web/models/rubric/rubric';
import Category from 'gooru-web/models/rubric/rubric-category';
import Ember from 'ember';
import DS from 'ember-data';
import AudienceModel from 'gooru-web/models/audience';

const lookupServiceStub = Ember.Service.extend({
  readAudiences() {
    var promiseResponse;
    var response = [
      AudienceModel.create({ id: 1, name: 'all students', order: 1 }),
      AudienceModel.create({ id: 4, name: 'none students', order: 2 })
    ];

    promiseResponse = new Ember.RSVP.Promise(function(resolve) {
      Ember.run.next(this, function() {
        resolve(response);
      });
    });

    return DS.PromiseArray.create({
      promise: promiseResponse
    });
  }
});

const taxonomyServiceStub = Ember.Service.extend({
  getSubjects(category) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!category) {
        reject({ status: 500 });
      } else {
        resolve({
          subjects: [
            {
              id: 'GDF.K12.CS',
              title: 'Computer Science',
              description: null,
              code: 'GDF.K12.CS',
              standard_framework_id: 'GDF'
            }
          ]
        });
      }
    });
  }
});

const rubricServiceStub = Ember.Service.extend({
  updateRubric(rubric) {
    return new Ember.RSVP.resolve(rubric);
  }
});

moduleForComponent(
  'content/rubric/gru-rubric-edit',
  'Integration | Component | content/rubric/gru rubric edit',
  {
    integration: true,
    beforeEach: function() {
      this.register('service:api-sdk/rubric', rubricServiceStub);
      this.inject.service('api-sdk/rubric');
      this.register('service:api-sdk/taxonomy', taxonomyServiceStub);
      this.inject.service('api-sdk/taxonomy');
      this.register('service:api-sdk/lookup', lookupServiceStub);
      this.inject.service('api-sdk/lookup');
    }
  }
);

skip('it renders', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: [
      Category.create(Ember.getOwner(this).ownerInjection(), {
        title: 'Category testing'
      })
    ]
  });
  this.set('rubric', rubric);

  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=rubric isEditing=true}}`
  );
  const $component = this.$();
  assert.ok(
    $component.find('.gru-rubric-edit').length,
    'Missing rubric edit component'
  );
  assert.ok(
    $component.find('.content.gru-header').length,
    'Missing rubric header'
  );
  assert.ok(
    $component.find('section.rubrics-section').length,
    'Missing rubrics section'
  );
  assert.ok(
    $component.find('#information').length,
    'Missing information section'
  );
  assert.ok(
    $component.find('#information .header').length,
    'Missing information header'
  );
  assert.ok(
    $component.find('#information .header h2').length,
    'Missing information header title'
  );
  assert.ok(
    $component.find('#information .title label .gru-input').length,
    'Missing assessment title input'
  );
  assert.ok(
    $component.find('#information .gru-taxonomy-selector').length,
    'Missing taxonomy selector'
  );
  assert.ok(
    $component.find('#information .standards').length,
    'Missing taxonomy selector'
  );
  assert.ok(
    $component.find('#information .content.gru-audience').length,
    'Missing audience'
  );
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    assert.ok(
      $component.find('#rubric .panel.rubric-creation').length,
      'Missing rubric creation panel'
    );
    assert.ok(
      $component.find('#rubric .panel.rubric-creation .panel-heading h3')
        .length,
      'Missing rubric creation title'
    );
    assert.ok(
      $component.find('#rubric .panel.rubric-creation .gru-rubric-creation')
        .length,
      'Missing rubric creation component'
    );
    assert.ok(
      $component.find('.overall-score').length,
      'Missing overall score panel'
    );
    assert.ok(
      $component.find('.overall-score .panel-heading h3').length,
      'Missing overall score title'
    );
    assert.ok(
      $component.find('.overall-score .panel-body .feedback label span').length,
      'Missing Feedback guidance label'
    );
    assert.ok(
      $component.find(
        '.overall-score .panel-body .feedback label .gru-textarea'
      ).length,
      'Missing Feedback guidance textarea'
    );
    assert.ok(
      $component.find('.overall-score .panel-body .required-feedback span')
        .length,
      'Missing required feedback checkbox'
    );
  });
});

skip('Add Category', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: [
      Category.create(Ember.getOwner(this).ownerInjection(), {
        title: 'Category testing'
      })
    ]
  });
  this.set('rubric', rubric);
  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=rubric isEditing=true}}`
  );
  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    var $addCategory = $component.find('.category-panel a.add-category');
    $addCategory.click();
    return wait().then(function() {
      assert.ok(
        $component.find('.category-panel .content.rubric.gru-category').length,
        'Should add a category'
      );
      assert.ok(
        $component.find(
          '.category-panel .content.rubric.gru-category .panel.expanded'
        ).length,
        'The category should be expanded'
      );
    });
  });
});

test('Copy Category', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: [
      Category.create(Ember.getOwner(this).ownerInjection(), {
        title: 'Category testing'
      })
    ]
  });
  this.set('tempRubric', rubric);

  this.render(
    hbs`{{content/rubric/gru-rubric-edit tempRubric=tempRubric isEditing=true}}`
  );
  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    assert.equal(
      $component.find('.category-panel .content.rubric.gru-category').length,
      1,
      'Should have 1 category'
    );
    var $copyCategory = $component.find(
      '.category-panel .gru-category button.copy'
    );
    $copyCategory.click();
    return wait().then(function() {
      assert.equal(
        $component.find('.category-panel .content.rubric.gru-category').length,
        2,
        'Should have 2 category'
      );
    });
  });
});

test('Delete Category', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: [
      Category.create(Ember.getOwner(this).ownerInjection(), {
        title: 'Category testing'
      })
    ]
  });
  this.set('tempRubric', rubric);

  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=tempRubric tempRubric=tempRubric isEditing=true}}`
  );
  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    assert.equal(
      $component.find('.category-panel .content.rubric.gru-category').length,
      1,
      'Should have 1 category'
    );
    var $copyCategory = $component.find(
      '.category-panel .gru-category button.delete'
    );
    $copyCategory.click();
    return wait().then(function() {
      assert.equal(
        $component.find('.category-panel .content.rubric.gru-category').length,
        0,
        'Should not have categories'
      );
    });
  });
});

skip('Add two categories, change the content of one category and it doesnt change the second category', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing'
  });
  this.set('rubric', rubric);
  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=tempRubric rubric=rubric isEditing=true}}`
  );

  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    var $addCategory = $component.find('.category-panel a.add-category');
    $addCategory.click();
    return wait().then(function() {
      assert.ok(
        $component.find('.category-panel .content.rubric.gru-category').length,
        'Should add a category'
      );
      assert.ok(
        $component.find(
          '.category-panel .content.rubric.gru-category .panel.expanded'
        ).length,
        'The category should be expanded'
      );
      const $titleField = $component.find(
        '.gru-category:first-child .edit-title .input .gru-input'
      );
      $titleField.find('input').val('Category 1');
      $titleField.find('input').blur();

      var $levelSwitch = $component.find(
        '.gru-category:eq(0) .content.rubric.gru-scoring-levels .level .gru-switch a input'
      );
      $levelSwitch.prop('checked', true);
      return wait().then(function() {
        $levelSwitch.change();
        return wait().then(function() {
          const $levelField = $component.find(
            '.gru-category:eq(0) .gru-scoring-levels .level-list .gru-input:first-child'
          );
          $levelField.find('input').val('Level 1');
          $levelField.find('input').blur();

          var $lastLevelDeleteBtn = $component.find(
            '.gru-category:eq(0) .content.rubric.gru-scoring-levels .point-list div:last-child .btn.delete'
          );

          $lastLevelDeleteBtn.click();
          return wait().then(function() {
            assert.ok(
              $component.find(
                '.gru-category:eq(0) .content.rubric.gru-scoring-levels .point-list div .btn.delete'
              ).length,
              4,
              'Incorrect number of levels'
            );
            const $save = $component.find('.detail .actions .save');
            $save.click();
            return wait().then(function() {
              $addCategory.click();
              return wait().then(function() {
                var $levelSwitch = $component.find(
                  '.gru-category:eq(1) .content.rubric.gru-scoring-levels .level .gru-switch a input'
                );
                $levelSwitch.prop('checked', true);
                return wait().then(function() {
                  $levelSwitch.change();
                  return wait().then(function() {
                    const $levelField = $component.find(
                      '.gru-category:eq(1) .gru-scoring-levels .level-list .gru-input:first-child'
                    );
                    assert.equal(
                      $levelField.find('input').val(),
                      '',
                      'New Category level should be empty'
                    );
                    assert.ok(
                      $component.find(
                        '.gru-category:eq(1) .content.rubric.gru-scoring-levels .point-list div .btn.delete'
                      ).length,
                      5,
                      'Incorrect number of levels'
                    );
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

skip('Add Category and cancel before save', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: []
  });
  this.set('rubric', rubric);
  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=rubric isEditing=true}}`
  );
  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    var $addCategory = $component.find('.category-panel a.add-category');
    $addCategory.click();
    return wait().then(function() {
      assert.equal(
        $component.find('.category-panel .content.rubric.gru-category').length,
        1,
        'Should have 1 category'
      );
      assert.ok(
        $component.find(
          '.category-panel .content.rubric.gru-category .panel.expanded'
        ).length,
        'The category should be expanded'
      );
      let $cancel = $component.find(
        '.category-panel .content.rubric.gru-category .item-actions .cancel'
      );
      $cancel.click();
      return wait().then(function() {
        assert.equal(
          $component.find('.category-panel .content.rubric.gru-category')
            .length,
          0,
          'Should have not categories'
        );
      });
    });
  });
});

test('Edit Category', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: [
      Category.create(Ember.getOwner(this).ownerInjection(), {
        title: 'Category testing'
      })
    ]
  });
  this.set('tempRubric', rubric);

  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=tempRubric tempRubric=tempRubric isEditing=true}}`
  );
  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    const $category = $component.find(
      '.category-panel .content.rubric.gru-category'
    );
    assert.equal($category.length, 1, 'Should have 1 category');
    assert.equal(
      $category
        .find('.panel-heading .title')
        .text()
        .trim(),
      'Category testing',
      'Incorrect Title'
    );
    let $edit = $component.find('.detail .actions .edit');
    $edit.click();
    return wait().then(function() {
      let $title = $category.find('.panel-heading .edit-title input');
      $title.val('New category title');
      $title.blur();
      let $save = $category.find('.item-actions .save');
      $save.click();
      return wait().then(function() {
        assert.equal(
          $category
            .find('.panel-heading .title')
            .text()
            .trim(),
          'New category title',
          'Incorrect Title after update'
        );
      });
    });
  });
});

test('Edit Existing Category And Cancel', function(assert) {
  let rubric = RubricModel.create(Ember.getOwner(this).ownerInjection(), {
    id: 'id-for-test',
    title: 'Rubric for testing',
    categories: [
      Category.create(Ember.getOwner(this).ownerInjection(), {
        title: 'Category testing'
      })
    ]
  });
  this.set('tempRubric', rubric);

  this.render(
    hbs`{{content/rubric/gru-rubric-edit rubric=tempRubric tempRubric=tempRubric isEditing=true}}`
  );
  const $component = this.$();
  var $rubricTab = $component.find('.header.content.gru-header nav a.rubric');
  $rubricTab.click();
  return wait().then(function() {
    const $category = $component.find(
      '.category-panel .content.rubric.gru-category'
    );
    assert.equal($category.length, 1, 'Should have 1 category');
    assert.equal(
      $category
        .find('.panel-heading .title')
        .text()
        .trim(),
      'Category testing',
      'Incorrect Title'
    );
    let $edit = $component.find('.detail .actions .edit');
    $edit.click();
    return wait().then(function() {
      let $title = $category.find('.panel-heading .edit-title input');
      $title.val('New category title');
      $title.blur();
      let $save = $category.find('.item-actions .cancel');
      $save.click();
      return wait().then(function() {
        assert.equal(
          $category
            .find('.panel-heading .title')
            .text()
            .trim(),
          'Category testing',
          'Incorrect Title after cancel'
        );
      });
    });
  });
});
