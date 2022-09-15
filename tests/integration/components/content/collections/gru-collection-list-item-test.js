import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Question from 'gooru-web/models/content/question';
import Rubric from 'gooru-web/models/rubric/rubric';
import Resource from 'gooru-web/models/content/resource';
import { RESOURCE_TYPES } from 'gooru-web/config/config';
import { QUESTION_CONFIG } from 'gooru-web/config/question';
import wait from 'ember-test-helpers/wait';
import T from 'gooru-web/tests/helpers/assert';
import Answer from 'gooru-web/models/content/answer';

const questionServiceStub = Ember.Service.extend({
  updateQuestion(questionID, editedQuestion, collection) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (questionID === 'question-id-fail' || !editedQuestion || !collection) {
        reject({ status: 500 });
      } else {
        resolve(editedQuestion);
      }
    });
  }
});

moduleForComponent(
  'content/collections/gru-collection-list-item',
  'Integration | Component | content/collections/gru collection list item',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
      this.register('service:api-sdk/question', questionServiceStub);
      this.inject.service('api-sdk/question');
    }
  }
);

test('it renders resources correctly', function(assert) {
  const resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Resource Title',
    format: 'interactive'
  });

  this.set('resource', resource);
  this.set('index', 0);
  this.set('isSorting', false);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=resource index=index isSorting=isSorting}}`
  );

  const $component = this.$('li.content.collections.gru-collection-list-item');
  assert.ok($component.length, 'Component');

  const $container = $component.find('.panel-heading');
  assert.ok($container.find('> h3').text(), 1, 'Index');
  assert.ok(
    $container.find('> a strong').text(),
    this.get('resource.title'),
    'Resource title'
  );
  assert.notOk(
    $container.find('.drag-icon .drag_handle').length,
    'Drag icon should be hidden'
  );

  //TODO: check when there are standards
  assert.ok(
    $container.find('> .detail > span').text(),
    this.get('i18n').t('common.add-standard').string,
    'No standards text'
  );

  const $actions = $container.find('> .detail > .actions');
  assert.ok($actions.length, 'Actions container');

  assert.ok(
    $actions.find('button:eq(0)').hasClass('add-item'),
    'First action button'
  );
  assert.ok(
    $actions.find('button:eq(1)').hasClass('narration'),
    'Second action button'
  );
  assert.ok(
    $actions.find('button:eq(2)').hasClass('delete-item'),
    'Third action button'
  );
  assert.ok(
    $actions.find('button:eq(3)').hasClass('copy-to'),
    'Fourth action button'
  );
  assert.ok(
    $actions.find('button:eq(4)').hasClass('move-item'),
    'Fifth action button'
  );
  assert.ok(
    $actions.find('button:eq(5)').hasClass('copy-item'),
    'Sixth action button'
  );
  assert.ok(
    $actions.find('button:eq(6)').hasClass('edit-item'),
    'Seventh action button'
  );

  RESOURCE_TYPES.forEach(
    function(type_string) {
      // Check icons and subtitles specific to each resource type
      Ember.run(() => {
        this.set('resource.format', type_string);
      });
      assert.ok(
        $container.find('> a > i').hasClass(`${type_string}-icon`),
        'Resource icon'
      );
      assert.ok(
        $container.find('> a span').text(),
        `${this.get('i18n').t('common.resource').string} | ${
          this.get('i18n').t(`common.resource-format.${type_string}`).string
        }`,
        'Resource subtitle'
      );
    }.bind(this)
  );

  this.set('isSorting', true);
  assert.ok(
    $container.find('.drag-icon .drag_handle').length,
    'Drag icon should be appear'
  );
});

test('it renders questions correctly', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $component = this.$('li.content.collections.gru-collection-list-item');
  assert.ok($component.length, 'Component');

  const $container = $component.find('.panel-heading');
  assert.ok($container.find('> h3').text(), 1, 'Index');
  assert.ok(
    $container.find('> a > i').hasClass('question-icon'),
    'Question icon'
  );
  assert.ok(
    $container.find('> a strong').text(),
    this.get('question.title'),
    'Question title'
  );

  //TODO: check when there are standards
  assert.ok(
    $container.find('> .detail > span').text(),
    this.get('i18n').t('common.add-standard').string,
    'No standards text'
  );

  const $actions = $container.find('> .detail.collapsed > .actions');
  assert.ok($actions.length, 'Actions container');

  assert.ok($actions.find('button.add-item').length, 'Missing add button');
  assert.ok(
    !$actions.find('button.narration').length,
    'Narration button should not be visible for questions'
  );
  assert.ok(
    $actions.find('button.delete-item').length,
    'Missing delete button'
  );
  assert.ok($actions.find('button.copy-to').length, 'Missing copy button');
  assert.ok($actions.find('button.move-item').length, 'Missing move button');
  assert.ok($actions.find('button.copy-item').length, 'Missing copy button');
  assert.ok($actions.find('button.edit-item').length, 'Missing edit button');

  Object.keys(QUESTION_CONFIG).forEach(
    function(question_type) {
      // Check subtitle specific to each question type
      Ember.run(() => {
        this.set('question.type', question_type);
      });

      assert.ok(
        $container.find('> a span').text(),
        `${this.get('i18n').t('common.question').string} | ${
          this.get('i18n').t(`common.question-type.${question_type}`).string
        }`,
        'Question subtitle'
      );
    }.bind(this)
  );
});

test('it expands/collapses the narration panel', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Resource Title',
    format: 'interactive'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');
  assert.ok($panel.hasClass('collapsed'), 'Panel collapsed');

  $panel.find('.detail.visible .actions button.narration i').click();

  assert.ok(
    $panel.hasClass('expanded'),
    'Narration Panel expanded after clicking narration button'
  );

  assert.ok($panel.find('> .panel-body').length, 'panel body');

  assert.ok(
    $panel.find('> .panel-body .narration .gru-textarea').length,
    'Narration Field'
  );

  $panel.find('.detail .actions .narration').click();
  assert.ok(
    $panel.hasClass('collapsed'),
    'Narration Panel collapsed after clicking narration button'
  );
});

test('it expands/collapses the edit question inline panel', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');
  assert.ok($panel.hasClass('collapsed'), 'Panel collapsed');

  $panel.find('.detail.visible .actions button.edit-item i').click();

  assert.ok(
    $panel.hasClass('expanded'),
    'Edit Question Panel expanded after clicking edit button'
  );

  const $panelBody = $panel.find('> .panel-body');

  assert.ok($panelBody.length, 'panel body');

  assert.ok($panelBody.find('.question h3').length, 'Missing Question label');
  assert.ok($panelBody.find('.question textarea').length, 'Missing text area');
  assert.ok(
    $panelBody.find('.question .add-image').length,
    'Missing add image button'
  );
  assert.ok($panelBody.find('.answers h3').length, 'Missing Answer label');
  assert.ok(
    $panelBody.find('.answers .instructions').length,
    'Missing Answer Instructions'
  );

  const $actions = $panelBody.find('.actions');
  assert.ok($actions.length, 'Actions container');

  assert.ok(
    $actions.find('button:eq(0)').hasClass('cancel'),
    'First action button'
  );
  assert.ok(
    $actions.find('button:eq(1)').hasClass('save'),
    'Second action button'
  );

  $panel.find('.detail .actions .cancel').click();
  assert.ok(
    $panel.hasClass('collapsed'),
    'Edit Question Panel collapsed after clicking cancel button'
  );
});

test('Question inline panel for FIB has no answers', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question',
    questionType: 'FIB'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  $panel.find('.detail.visible .actions button.edit-item i').click();
  const $panelBody = $panel.find('> .panel-body');
  assert.ok($panelBody.length, 'panel body');
  assert.ok(
    !$panelBody.find('.answers').length,
    'Answers section should not be visible'
  );
});

test('it expands/collapses the edit resource inline panel', function(assert) {
  const resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Resource Title',
    format: 'resource'
  });

  this.set('resource', resource);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=resource index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');
  assert.ok($panel.hasClass('collapsed'), 'Panel collapsed');

  $panel.find('.detail.visible .actions button.edit-item i').click();

  assert.ok(
    $panel.hasClass('expanded'),
    'Edit Resource Panel expanded after clicking edit button'
  );

  const $panelBody = $panel.find('> .panel-body');

  assert.ok($panelBody.length, 'panel body');

  assert.ok(
    $panelBody.find('.narration .gru-textarea').length,
    'Narration Field'
  );

  const $actions = $panelBody.find('.actions');
  assert.ok($actions.length, 'Actions container');

  assert.ok(
    $actions.find('button:eq(0)').hasClass('cancel'),
    'First action button'
  );
  assert.ok(
    $actions.find('button:eq(1)').hasClass('save'),
    'Second action button'
  );

  $panel.find('.detail .actions .cancel').click();
  assert.ok(
    $panel.hasClass('collapsed'),
    'Edit Resource Panel collapsed after clicking cancel button'
  );
});

test('show the edit inline panel when a content is added from the content builder', function(assert) {
  const resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    id: 'e7460e72-7708-4892-afcc-63756ffa410f',
    title: 'Resource Title',
    format: 'resource'
  });

  var editingContent = 'e7460e72-7708-4892-afcc-63756ffa410f';
  this.set('resource', resource);
  this.set('index', 0);

  this.set('editingContent', editingContent);

  this.render(
    hbs`{{content/collections/gru-collection-list-item model=resource index=index editingContent=editingContent}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');
  assert.ok($panel.hasClass('expanded'), 'Edit Resource Panel expanded');

  const $panelBody = $panel.find('> .panel-body');

  assert.ok($panelBody.length, 'panel body');

  assert.ok(
    $panelBody.find('.narration .gru-textarea').length,
    'Narration Field'
  );

  const $actions = $panelBody.find('.actions');
  assert.ok($actions.length, 'Actions container');

  assert.ok(
    $actions.find('button:eq(0)').hasClass('cancel'),
    'First action button'
  );
  assert.ok(
    $actions.find('button:eq(1)').hasClass('save'),
    'Second action button'
  );

  $panel.find('.detail .actions .cancel').click();
  assert.ok(
    $panel.hasClass('collapsed'),
    'Edit Resource Panel collapsed after clicking cancel button'
  );
});
test('Save on edit inline panel with description empty', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    id: 'e7460e72-7708-4892-afcc-63756ffa410f',
    title: 'Question Title',
    format: 'question'
  });

  this.set('question', question);

  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');

  const $actions = $panel.find('.actions .item-actions');

  $actions.find('.edit-item').click();

  return wait().then(function() {
    assert.ok($panel.find('.question').length, 'Missing question section');
    const $saveButton = $panel.find('.detail .actions .item-actions .save');
    assert.ok($saveButton.length, 'Panel');
    $saveButton.click();
    return wait().then(function() {
      T.exists(
        assert,
        $panel.find('.question .validation .error'),
        'error message should be visible'
      );
    });
  });
});

skip('Save on edit inline panel with HL text question', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    id: 'e7460e72-7708-4892-afcc-63756ffa410f',
    title: 'Question Title',
    format: 'question',
    description: 'decription',
    type: 'HT_HL',
    answers: Ember.A([
      Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: 'Option A',
        isCorrect: true
      })
    ])
  });

  this.set('question', question);

  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question editingContent=question}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');

  const $actions = $panel.find('.actions .item-actions');

  $actions.find('.edit-item').click();

  return wait().then(function() {
    assert.ok($panel.find('.question').length, 'Missing question section');
    const $saveButton = $panel.find('.detail .actions .item-actions .save');
    assert.ok($saveButton.length, 'Panel');
    $saveButton.click();
    return wait().then(function() {
      T.notExists(
        assert,
        $panel.find('.question .validation .error'),
        'error message should be visible'
      );
    });
  });
});

test('Update on edit inline panel ', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    id: 'e7460e72-7708-4892-afcc-63756ffa410f',
    title: 'Question Title',
    format: 'question',
    description: 'description',
    type: 'T/F'
  });

  this.set('question', question);

  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  assert.ok($panel.length, 'Panel');

  const $actions = $panel.find('.actions .item-actions');

  $actions.find('.edit-item').click();

  return wait().then(function() {
    assert.ok($panel.find('.question').length, 'Missing question section');

    let $mathEditor = $panel.find('.rich-editor');
    $mathEditor.text('<span class=\'gru-math-expression\'>testing</span>');
    const $saveButton = $panel.find('.detail .actions .item-actions .save');
    assert.ok($saveButton.length, 'Panel');
    $saveButton.click();
    return wait().then(function() {
      $actions.find('.edit-item').click();
      return wait().then(function() {
        assert.ok(
          $panel.find('.rich-editor .gru-math-expression'),
          'Missing math'
        );
      });
    });
  });
});

test('Layout for OpenEnded Question', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question',
    questionType: 'OE'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  $panel.find('.detail.visible .actions button.edit-item i').click();

  const $panelBody = $panel.find('> .panel-body');
  assert.ok($panelBody.length, 'panel body');

  const $answersContainer = $panelBody.find('.answers');
  assert.ok(!$answersContainer.length, 'Answers section should not be visible');

  const $submissionFormatContainer = $panelBody.find('.submission-format');
  assert.ok(
    $submissionFormatContainer.length,
    'Student Submission format section should be visible'
  );

  const $feedbackGradingContainer = $panelBody.find('.feedback-grading');
  assert.ok(
    $feedbackGradingContainer.length,
    'Feedback and Grading section should be visible'
  );
  assert.equal(
    $feedbackGradingContainer.find('.gru-switch').length,
    2,
    'Two gru-switch inputs should be displayed'
  );
});

test('Display fields when scoring is clicked', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question',
    questionType: 'OE'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  $panel.find('.detail.visible .actions button.edit-item i').click();

  const $panelBody = $panel.find('> .panel-body');

  const $feedbackGradingContainer = $panelBody.find('.feedback-grading');
  assert.ok(
    $feedbackGradingContainer.length,
    'Feedback and Grading section should be visible'
  );

  let $scoringSettingsContainer = $feedbackGradingContainer.find(
    '.scoring-settings'
  );
  assert.ok(
    !$scoringSettingsContainer.length,
    'Scoring settings section should not be visible'
  );

  const $switchScoring = $feedbackGradingContainer.find(
    '.switch.scoring .gru-switch .toggle'
  );
  Ember.run(() => {
    $switchScoring.click();
  });

  $scoringSettingsContainer = $feedbackGradingContainer.find(
    '.scoring-settings'
  );
  assert.ok(
    $scoringSettingsContainer.length,
    'Scoring settings section should now be visible'
  );

  const $maxScoreContainer = $scoringSettingsContainer.find(
    '.setting.maximum-points'
  );
  assert.ok($maxScoreContainer.length, 'Max Score field should be visible');
  assert.equal(
    $maxScoreContainer.find('.gru-select .dropdown-toggle').text(),
    1,
    'Default value for maximum score is wrong'
  );

  const $incrementContainer = $scoringSettingsContainer.find(
    '.setting.increment'
  );
  assert.ok($incrementContainer.length, 'Increment field should be visible');
  assert.equal(
    $incrementContainer.find('.gru-select .dropdown-toggle').text(),
    0.5,
    'Default value for increment is wrong'
  );
});

test('Display fields when rubric is clicked', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question',
    questionType: 'OE'
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  $panel.find('.detail.visible .actions button.edit-item i').click();

  const $panelBody = $panel.find('> .panel-body');

  const $feedbackGradingContainer = $panelBody.find('.feedback-grading');
  assert.ok(
    $feedbackGradingContainer.length,
    'Feedback and Grading section should be visible'
  );

  let $addRubricContainer = $feedbackGradingContainer.find(
    '.add-rubric-container'
  );
  assert.ok(
    !$addRubricContainer.length,
    'Add rubric section should not be visible'
  );

  const $switchRubric = $feedbackGradingContainer.find(
    '.switch.rubric .gru-switch .toggle'
  );
  Ember.run(() => {
    $switchRubric.click();
  });

  $addRubricContainer = $feedbackGradingContainer.find('.add-rubric-container');
  assert.ok(
    $addRubricContainer.length,
    'Add rubric section should now be visible'
  );

  assert.ok(
    $addRubricContainer.find('.btn.add-rubric').length,
    'Add rubric button should be visible'
  );
});

test('Save when rubric ON is not associated - Open Ended', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    id: 'question-id',
    title: 'Question Title',
    description: 'Question Description',
    format: 'question',
    questionType: 'OE',
    type: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      rubricOn: false
    })
  });

  this.set('question', question);

  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );

  const $panelBody = $panel.find('> .panel-body');

  const $actions = $panel.find('.actions .item-actions');

  $actions.find('.edit-item').click();

  return wait().then(function() {
    assert.ok($panel.find('.question').length, 'Missing question section');

    const $feedbackGradingContainer = $panelBody.find('.feedback-grading');

    const $switchRubric = $feedbackGradingContainer.find(
      '.switch.rubric .gru-switch .toggle'
    );

    Ember.run(() => {
      $switchRubric.click();
    });

    const $saveButton = $panel.find('.detail .actions .item-actions .save');
    assert.ok($saveButton.length, 'Panel');
    $saveButton.click();

    return wait().then(function() {
      T.exists(
        assert,
        $feedbackGradingContainer.find('.content .validation .error'),
        'error message should be visible'
      );
    });
  });
});

test('Layout when rubric ON is already associated - without thumbnail', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      title: 'Rubric Title',
      thumbnail: null,
      rubricOn: true
    })
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  $panel.find('.detail.visible .actions button.edit-item i').click();

  const $panelBody = $panel.find('> .panel-body');

  const $feedbackGradingContainer = $panelBody.find('.feedback-grading');
  assert.ok(
    $feedbackGradingContainer.length,
    'Feedback and Grading section should be visible'
  );

  const $addRubricContainer = $feedbackGradingContainer.find(
    '.add-rubric-container'
  );
  assert.ok(
    !$addRubricContainer.length,
    'Add rubric section should not be visible'
  );

  const $associatedRubricContainer = $feedbackGradingContainer.find(
    '.associated-rubric'
  );
  assert.ok(
    $associatedRubricContainer.length,
    'Associated rubric should be visible'
  );

  assert.ok(
    $associatedRubricContainer.find('.image i.rubric-icon').length,
    'Default rubric icon should be displayed'
  );

  assert.equal(
    $associatedRubricContainer.find('.info h3').text(),
    'Rubric Title',
    'Wrong Rubric title'
  );

  assert.equal(
    $associatedRubricContainer.find('.actions button').length,
    2,
    'Some button is missing'
  );

  assert.ok(
    $associatedRubricContainer.find('.actions button.remove-item').length,
    'Remove button is missing'
  );

  assert.ok(
    $associatedRubricContainer.find('.actions button.edit-item').length,
    'Edit button is missing'
  );
});

test('Layout when rubric ON is already associated - with thumbnail', function(assert) {
  const question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    format: 'question',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      title: 'Rubric Title',
      thumbnail: 'rubric-icon',
      rubricOn: true
    })
  });

  this.set('question', question);
  this.set('index', 0);
  this.render(
    hbs`{{content/collections/gru-collection-list-item model=question index=index}}`
  );

  const $panel = this.$(
    'li.content.collections.gru-collection-list-item > .panel'
  );
  $panel.find('.detail.visible .actions button.edit-item i').click();

  const $panelBody = $panel.find('> .panel-body');

  const $feedbackGradingContainer = $panelBody.find('.feedback-grading');
  assert.ok(
    $feedbackGradingContainer.length,
    'Feedback and Grading section should be visible'
  );

  const $addRubricContainer = $feedbackGradingContainer.find(
    '.add-rubric-container'
  );
  assert.ok(
    !$addRubricContainer.length,
    'Add rubric section should not be visible'
  );

  const $associatedRubricContainer = $feedbackGradingContainer.find(
    '.associated-rubric'
  );
  assert.ok(
    $associatedRubricContainer.length,
    'Associated rubric should be visible'
  );

  assert.ok(
    $associatedRubricContainer.find('.image img').length,
    'Uploaded rubric icon should be displayed'
  );

  assert.equal(
    $associatedRubricContainer.find('.image img').attr('src'),
    'rubric-icon',
    'Wrong uploaded rubric icon displayed'
  );

  assert.equal(
    $associatedRubricContainer.find('.info h3').text(),
    'Rubric Title',
    'Wrong Rubric title'
  );
});
