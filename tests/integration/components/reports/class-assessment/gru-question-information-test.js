import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'reports/class-assessment/gru-question-information',
  'Integration | Component | reports/class assessment/gru question information',
  {
    integration: true
  }
);

test('Question Information With Narration Hints Explanation Media', function(
  assert
) {
  var question = Ember.Object.create({
    id: '56a120483b6e7b090501d3e7',
    text: 'Resource 1',
    narration: 'this is a narration',
    mediaUrl:
      'http://qacdn.gooru.org/qalive//f000/2441/3253/9b5b8543-c8af-4f01-a76f-fa3a7e749636.JPG',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation: 'explanation',
    hasNarration: true,
    hasMedia: true
  });
  this.set('question', question);

  this.render(
    hbs`{{reports/class-assessment/gru-question-information question=question}}`
  );

  const $component = this.$();
  const $questionInformation = $component.find('.gru-question-information');
  T.exists(
    assert,
    $questionInformation,
    'Missing question information component'
  );
  T.exists(
    assert,
    $questionInformation.find('.narration'),
    'Narration should be visible'
  );
  T.exists(
    assert,
    $questionInformation.find('.narration span'),
    'Missing narration'
  );
  T.exists(
    assert,
    $questionInformation.find('.question'),
    'Question should be visible'
  );
  T.exists(
    assert,
    $questionInformation.find('.question h3'),
    'Missing Question Title'
  );
  T.exists(
    assert,
    $questionInformation.find('.question span'),
    'Missing Question Text'
  );
  T.exists(
    assert,
    $questionInformation.find('.question img'),
    'Missing Question Image'
  );
  T.exists(
    assert,
    $questionInformation.find('.hints'),
    'Hints should be visible'
  );
  assert.equal(
    $questionInformation.find('.hints span').length,
    question.hints.length,
    'Incorrect number of hints'
  );
  T.exists(
    assert,
    $questionInformation.find('.explanation'),
    'Explanation should be visible'
  );
  T.exists(
    assert,
    $questionInformation.find('.explanation span'),
    'Missing explanation'
  );
});

test('Question Information Without Narration Hints Explanation Media', function(
  assert
) {
  var question = Ember.Object.create({
    id: '56a120483b6e7b090501d3e7',
    text: 'Resource 1',
    hasNarration: false,
    hasMedia: false
  });
  this.set('question', question);

  this.render(
    hbs`{{reports/class-assessment/gru-question-information question=question}}`
  );

  const $component = this.$();
  const $questionInformation = $component.find('.gru-question-information');
  T.notExists(
    assert,
    $questionInformation.find('.narration'),
    'Narration should be hidden'
  );
  T.notExists(
    assert,
    $questionInformation.find('.question img'),
    'Missing Question Image'
  );
  T.notExists(
    assert,
    $questionInformation.find('.hints'),
    'Hints should be hidden'
  );
  T.notExists(
    assert,
    $questionInformation.find('.explanation'),
    'Explanation should be hidden'
  );
});
test('Question Information Anonymous', function(assert) {
  var question = Ember.Object.create({
    id: '56a120483b6e7b090501d3e7',
    text: 'Resource 1',
    narration: 'this is a narration',
    mediaUrl:
      'http://qacdn.gooru.org/qalive//f000/2441/3253/9b5b8543-c8af-4f01-a76f-fa3a7e749636.JPG',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation: 'explanation',
    hasNarration: true,
    hasMedia: true
  });
  var anonymous = true;
  this.set('question', question);
  this.set('anonymous', anonymous);

  this.render(
    hbs`{{reports/class-assessment/gru-question-information question=question anonymous=anonymous}}`
  );

  const $component = this.$();
  const $questionInformation = $component.find('.gru-question-information');
  T.notExists(
    assert,
    $questionInformation.find('.hints'),
    'Hints should not be visible'
  );
  T.notExists(
    assert,
    $questionInformation.find('.explanation'),
    'Explanation should not be visible'
  );
});
