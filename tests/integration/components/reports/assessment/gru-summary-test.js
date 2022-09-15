import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Collection from 'gooru-web/models/collection/collection';
import QuestionResult from 'gooru-web/models/result/question';
import QuestionResource from 'gooru-web/models/resource/question';
import ResourceResource from 'gooru-web/models/resource/resource';
import ResourceResult from 'gooru-web/models/result/resource';
import AssessmentResult from 'gooru-web/models/result/assessment';

moduleForComponent(
  'reports/assessment/gru-summary',
  'Integration | Component | reports/assessment/gru summary',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');
    }
  }
);

test('it renders for assessment', function(assert) {
  const date = new Date(2010, 1, 20);
  date.setSeconds(10);
  date.setMinutes(15);
  date.setHours(11);

  let assessmentResult = AssessmentResult.create({
    resourceId: '600',
    resourceResults: Ember.A([
      QuestionResult.create({
        resourceId: '601',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      }),
      QuestionResult.create({
        resourceId: '602',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      }),
      QuestionResult.create({
        resourceId: '603',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      })
    ]),
    submittedAt: date,
    totalAttempts: 4
  });

  const collection = Collection.create({
    isAssessment: true,
    resources: Ember.A([
      QuestionResource.create({
        id: '601',
        title: 'OE',
        questionType: 'OE'
      }),
      QuestionResource.create({
        id: '602',
        title: 'MC',
        questionType: 'MC'
      })
    ]),
    title: 'collection'
  });

  assessmentResult.merge(collection);
  this.set('assessmentResult', assessmentResult);
  this.set('areQuestionLinksHidden', false);
  assessmentResult.set('score', 100);
  this.render(hbs`
    {{reports/assessment/gru-summary
      assessmentResult=assessmentResult
      areQuestionLinksHidden=areQuestionLinksHidden
      showReactionBar=true
    }}`);

  var $component = this.$('.reports.assessment.gru-summary'); //component dom element
  assert.ok($component.length, 'Component does not have the component classes');

  var $gradeContainer = $component.find('.summary-container .grade');
  assert.ok($gradeContainer.length, 'Grade container is missing');
  assert.ok(
    $gradeContainer.attr('style').indexOf('color:') >= 0,
    'Missing grade color'
  );

  var $percentage = $gradeContainer.find('.percentage');
  assert.ok($percentage.length, 'Percentage container is missing');
  assert.equal($percentage.text().trim(), '100%', 'Incorrect percentage text');

  var $attempts = $gradeContainer.find('.attempts');
  assert.ok(
    $attempts.find('.attempt-selector'),
    'Attempts dropdown should be visible'
  );
  assert.notOk(
    $attempts.find('.current').length,
    'Current attempt label should not be visible'
  );
  assert.notOk(
    $attempts.find('.latest').length,
    'Latest attempt label should not be visible'
  );

  var $overviewContainer = $component.find('.summary-container .overview');
  var $reactionContainer = $component.find('.summary-container .reactions');
  assert.ok($overviewContainer.length, 'Overview container is missing');
  assert.ok($overviewContainer.find('h5').length, 'Header element is missing');
  assert.equal(
    $overviewContainer
      .find('h5')
      .text()
      .trim(),
    'collection',
    'Incorrect header text'
  );

  // Attempt
  var $overviewSection = $overviewContainer.find('.information .attempt');
  assert.ok(
    $overviewSection.find('title'),
    'Header element for \'attempt\' section in overview is missing'
  );
  assert.equal(
    $overviewSection
      .find('.dropdown button')
      .text()
      .trim(),
    '4',
    'Current attempt value is incorrect'
  );
  assert.equal(
    $overviewSection.find('.dropdown-menu li').length,
    4,
    'Incorrect number of attempts in dropdown menu'
  );
  assert.equal(
    $overviewSection
      .find('.total-attempts')
      .text()
      .trim(),
    '4',
    'Incorrect number of total attempts'
  );

  // Time
  $overviewSection = $overviewContainer.find('.information .time');
  assert.equal(
    $overviewSection
      .find('span')
      .text()
      .trim(),
    '40s',
    'Incorrect time value'
  );

  // Reaction

  var $reactionSection = $reactionContainer.find('.reaction');

  assert.ok(
    $reactionSection.find('.emotion').hasClass('emotion-2'),
    'Emotion icon should have the class \'emotion-2\''
  );

  // Links to questions
  var $questionLinks = $overviewContainer.find('.gru-bubbles');
  assert.equal(
    $questionLinks.find('li').length,
    0,
    'Incorrect number of question links'
  );

  this.set('areQuestionLinksHidden', true);
  assert.notOk(
    $overviewContainer.find('.gru-bubbles').length,
    'Question links hidden'
  );
});

test('Assessment attempts on real time', function(assert) {
  const date = new Date(2010, 1, 20);
  date.setSeconds(10);
  date.setMinutes(15);
  date.setHours(11);

  const assessmentResult = AssessmentResult.create({
    id: 501,
    resourceResults: [
      QuestionResult.create({
        resourceId: 601,
        correct: false,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: 602,
        correct: true,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: 603,
        correct: true,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: 604 //non answered
      })
    ],
    submittedAt: date,
    totalAttempts: 4,
    isRealTime: true
  });

  const collection = Collection.create({
    isAssessment: true,
    resources: Ember.A([
      QuestionResource.create({
        id: 601,
        title: 'MC',
        questionType: 'MC'
      }),
      QuestionResource.create({
        id: 602,
        title: 'MA',
        questionType: 'MA'
      }),
      QuestionResource.create({
        id: 603,
        title: 'MA',
        questionType: 'MA'
      }),
      QuestionResource.create({
        id: 604,
        title: 'MA',
        questionType: 'MA'
      })
    ]),
    title: 'collection'
  });

  assessmentResult.merge(collection);
  this.set('assessmentResult', assessmentResult);
  this.set('areQuestionLinksHidden', false);
  this.set('showAttempts', false);
  this.set('isRealTime', true);

  this.render(hbs`
    {{reports/assessment/gru-summary
      assessmentResult=assessmentResult
      areQuestionLinksHidden=areQuestionLinksHidden
      showAttempts=showAttempts
      isRealTime=isRealTime
    }}`);

  var $component = this.$('.reports.assessment.gru-summary'); //component dom element

  var $gradeContainer = $component.find(
    '.summary-container .grade[style~="background-color:"]'
  );

  var $attempts = $gradeContainer.find('.attempts');
  assert.ok(
    $attempts.find('.current'),
    'Current attempt label should be visible'
  );
  assert.notOk(
    $attempts.find('.attempt-selector').length,
    'Attempts dropdown should not be visible'
  );
  assert.notOk(
    $attempts.find('.latest').length,
    'Latest attempt label should not be visible'
  );
});

test('Assessment attempts on static report', function(assert) {
  const date = new Date(2010, 1, 20);
  date.setSeconds(10);
  date.setMinutes(15);
  date.setHours(11);

  const assessmentResult = AssessmentResult.create({
    id: 501,
    resourceResults: [
      QuestionResult.create({
        resourceId: 601,
        correct: false,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: 603,
        correct: true,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: 602,
        resource: {
          order: 2
        },
        correct: true,
        timeSpent: 20000,
        reaction: 2
      })
    ],
    submittedAt: date,
    totalAttempts: 4
  });

  const collection = Collection.create({
    isAssessment: true,
    resources: Ember.A([
      QuestionResource.create({
        id: '601',
        title: 'MA',
        questionType: 'MA'
      }),
      QuestionResource.create({
        id: '602',
        title: 'MC',
        questionType: 'MC'
      })
    ]),
    title: 'collection'
  });

  assessmentResult.merge(collection);
  this.set('assessmentResult', assessmentResult);
  this.set('areQuestionLinksHidden', false);
  this.set('showAttempts', false);

  this.render(hbs`
    {{reports/assessment/gru-summary
      assessmentResult=assessmentResult
      areQuestionLinksHidden=areQuestionLinksHidden
      showAttempts=showAttempts

    }}`);

  var $component = this.$('.reports.assessment.gru-summary'); //component dom element

  var $gradeContainer = $component.find(
    '.summary-container .grade[style~="background-color:"]'
  );

  var $attempts = $gradeContainer.find('.attempts');
  assert.ok(
    $attempts.find('.latest'),
    'latest attempt label should be visible'
  );
  assert.notOk(
    $attempts.find('.attempt-selector').length,
    'Attempts dropdown should not be visible'
  );
  assert.notOk(
    $attempts.find('.current').length,
    'Current attempt label should not be visible'
  );
});

test('it renders for collection with questions', function(assert) {
  const date = new Date(2010, 1, 20);
  date.setSeconds(10);
  date.setMinutes(15);
  date.setHours(11);

  let assessmentResult = AssessmentResult.create({
    resourceId: '600',
    resourceResults: Ember.A([
      ResourceResult.create({
        resourceId: 601,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: '602',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      }),
      QuestionResult.create({
        resourceId: '603',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      })
    ]),
    submittedAt: date,
    totalAttempts: 4
  });

  const collection = Collection.create({
    isAssessment: false,
    resources: Ember.A([
      ResourceResource.create({
        id: '601'
      }),
      QuestionResource.create({
        id: '602',
        title: 'MC',
        questionType: 'MC'
      })
    ]),
    title: 'collection'
  });

  assessmentResult.set('score', 100);
  assessmentResult.merge(collection);

  this.set('assessmentResult', assessmentResult);

  this.render(
    hbs`{{reports/assessment/gru-summary assessmentResult=assessmentResult showReactionBar=true}}`
  );

  var $component = this.$('.reports.assessment.gru-summary'); //component dom element
  assert.ok($component.length, 'Component does not have the component classes');

  var $gradeContainer = $component.find('.summary-container .grade');
  assert.ok($gradeContainer.length, 'Grade container should be visible');

  var $thumbnailContainer = $component.find('.summary-container .thumbnail');
  assert.notOk(
    $thumbnailContainer.length,
    'thumbnail container should not be visible'
  );

  var $overviewContainer = $component.find('.summary-container .overview');
  var $reactionContainer = $component.find('.summary-container .reactions');
  assert.ok($overviewContainer.length, 'Overview container is missing');
  assert.ok($overviewContainer.find('h5').length, 'Header element is missing');
  assert.equal(
    $overviewContainer
      .find('h5')
      .text()
      .trim(),
    'collection',
    'Incorrect header text'
  );

  // Attempt
  var $overviewSection = $overviewContainer.find('.information .attempt');
  assert.ok(
    !$overviewSection.length,
    '\'attempt\' section should not be visible'
  );

  // Time
  $overviewSection = $overviewContainer.find('.information .time');
  assert.equal(
    $overviewSection
      .find('span')
      .text()
      .trim(),
    '20s',
    'Incorrect time value'
  );

  // Reaction
  var $reactionSection = $reactionContainer.find('.reaction');

  assert.ok(
    $reactionSection.find('.emotion').hasClass('emotion-2'),
    'Emotion icon should have the class \'emotion-2\''
  );

  // Reaction
  var $questionLinks = $overviewContainer.find('.gru-bubbles');
  assert.equal(
    $questionLinks.find('li').length,
    0,
    'Incorrect number of resource links'
  );
});

test('it renders for collection with only resources and open ended questions', function(
  assert
) {
  const date = new Date(2010, 1, 20);
  date.setSeconds(10);
  date.setMinutes(15);
  date.setHours(11);

  const assessmentResult = AssessmentResult.create({
    id: 501,
    resourceResults: [
      ResourceResult.create({
        resourceId: 601,
        timeSpent: 20000,
        reaction: 2
      }),
      ResourceResult.create({
        resourceId: 603,
        timeSpent: 20000,
        reaction: 2
      }),
      ResourceResult.create({
        resourceId: 602,
        timeSpent: 20000,
        reaction: 2
      }),
      QuestionResult.create({
        resourceId: 602,
        correct: true,
        timeSpent: 20000,
        reaction: 2
      })
    ],
    submittedAt: date,
    totalAttempts: 4
  });

  const collection = Collection.create({
    isAssessment: false,
    resources: Ember.A([
      QuestionResource.create({
        id: '601',
        title: 'MC',
        questionType: 'MC'
      }),
      QuestionResource.create({
        id: '602',
        title: 'OE',
        questionType: 'OE'
      })
    ]),
    title: 'collection'
  });

  assessmentResult.merge(collection);
  this.set('assessmentResult', assessmentResult);
  this.set('areQuestionLinksHidden', false);

  this.render(hbs`
  {{reports/assessment/gru-summary
    assessmentResult=assessmentResult
    areQuestionLinksHidden=areQuestionLinksHidden
  }}`);

  var $component = this.$('.reports.assessment.gru-summary'); //component dom element
  var $gradeContainer = $component.find(
    '.summary-container .grade[style~="background-color:"]'
  );
  assert.notOk(
    $gradeContainer.length,
    'Percentage container should not appear'
  );
  var $timeSpent = $component.find('.summary-container .thumbnail .time-spent');
  assert.ok($timeSpent.length, 'Time spent should appear');
});

test('it renders for assessment - do not show Reaction', function(assert) {
  const date = new Date(2010, 1, 20);
  date.setSeconds(10);
  date.setMinutes(15);
  date.setHours(11);

  let assessmentResult = AssessmentResult.create({
    resourceId: '600',
    resourceResults: Ember.A([
      QuestionResult.create({
        resourceId: '601',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      }),
      QuestionResult.create({
        resourceId: '602',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      }),
      QuestionResult.create({
        resourceId: '603',
        resourceType: 'question',
        correct: true,
        timeSpent: 20000,
        reaction: 2,
        score: 100
      })
    ]),
    submittedAt: date,
    totalAttempts: 4
  });

  const collection = Collection.create({
    isAssessment: true,
    resources: Ember.A([
      QuestionResource.create({
        id: '601',
        title: 'OE',
        questionType: 'OE'
      }),
      QuestionResource.create({
        id: '602',
        title: 'MC',
        questionType: 'MC'
      })
    ]),
    title: 'collection'
  });

  assessmentResult.merge(collection);
  this.set('assessmentResult', assessmentResult);
  this.set('areQuestionLinksHidden', false);

  this.render(hbs`
    {{reports/assessment/gru-summary
      assessmentResult=assessmentResult
      areQuestionLinksHidden=areQuestionLinksHidden
      showReactionBar=false
    }}`);

  var $component = this.$('.reports.assessment.gru-summary'); //component dom element
  var $overviewContainer = $component.find('.summary-container .overview');

  // Reaction
  var $overviewSection = $overviewContainer.find('.information .reaction');
  assert.notOk(
    $overviewSection.find('.emotion').hasClass('emotion-2'),
    'Emotion icon should not have the class \'emotion-2\''
  );
});
