import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Question from 'gooru-web/models/content/question';
import Ember from 'ember';
import { QUESTION_TYPES } from 'gooru-web/config/question';

moduleForComponent(
  'content/questions/gru-question-play',
  'Integration | Component | content/questions/gru question play',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
    }
  }
);
test('Header Layout', function(assert) {
  var question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    text: 'Some text',
    type: QUESTION_TYPES.openEnded,
    answers: Ember.A([])
  });

  this.set('question', question);

  this.render(hbs`{{content/questions/gru-question-play question=question}}`);

  var $container = this.$('article.content.questions.gru-question-play');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h1').text(), 'Question Title', 'Missing title');
  assert.ok(
    $header.find(`.details .${question.type}-icon`).length,
    'Missing icon'
  );
  assert.ok($header.find('.details .type').length, 'Missing type');
  assert.ok($header.find('.details .tags').length, 'Missing tags');
  assert.ok($header.find('.publisher').length, 'Missing publisher');
});

test('it renders', function(assert) {
  var question = Question.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question Title',
    text: 'Some text',
    type: QUESTION_TYPES.openEnded,
    answers: Ember.A([])
  });

  this.set('question', question);

  this.render(hbs`{{content/questions/gru-question-play question=question}}`);

  var $container = this.$('article.content.questions.gru-question-play');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h1').text(), 'Question Title', 'Missing title');

  const $content = $container.find('> .player');
  assert.ok($content.length, 'Missing player content');
  assert.ok(
    $content.find('.gru-question-viewer .gru-open-ended').length,
    'Missing question type component'
  );
});
