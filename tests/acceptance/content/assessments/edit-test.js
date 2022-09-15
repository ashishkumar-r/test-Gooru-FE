import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';
import { KEY_CODES } from 'gooru-web/config/config';

moduleForAcceptance('Acceptance | Edit Assessment', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'profile-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

// TODO: Fix test per changes in 1149
/*test('Edit assessment information', function (assert) {
  visit('/content/assessments/edit/123');

  andThen(function () {
    assert.equal(currentURL(), '/content/assessments/edit/123');

    var newTitle = 'New Assessment Name';
    var newLearningObjectives = 'Learning objectives ...';

    var $container = find(".controller.content.assessments.edit");
    var $headerActions = $container.find("#information .header .actions");
    var $content = $container.find('#information .content');

    assert.equal($content.find('.panel-body .title b').text(), 'Assessment Title', 'Title');
    assert.equal($content.find('.panel-body .learning-objectives b').text(), '', 'Learning objectives');

    click($headerActions.find('button.edit'));
    andThen(function () {
      var $contentPanel = $content.find('.panel-body');
      var $title = $contentPanel.find('.title input');
      var $objectives = $contentPanel.find('.learning-objectives .ember-text-area');

      fillIn($title, '');
      triggerEvent($title, 'blur');

      click($headerActions.find('button.save'));
      andThen(function () {

        var $errorMessage = $contentPanel.find('.validation.title .error');

        assert.equal($errorMessage.text().trim(), 'Please enter the assessment title.', 'Validation message missing');

        fillIn($title, newTitle);
        fillIn($objectives, newLearningObjectives);
        // validations update on focus-out
        triggerEvent($title, 'blur');
        triggerEvent($objectives, 'blur');

        click($headerActions.find('button.save'));
        andThen(function () {
          assert.equal($contentPanel.find('.title b').text(), newTitle, 'Title updated');
          assert.equal($contentPanel.find('.learning-objectives b').text(), newLearningObjectives, 'Learning objectives updated');
        });
      });
    });
  });
});*/

skip('Click share button and check clipboard functionality', function(assert) {
  visit('/content/assessments/edit/all-question-types-assessment-id');

  andThen(function() {
    //editing all-question-types-assessment-id assessment, see assessment-endpoint.json
    assert.equal(
      currentURL(),
      '/content/assessments/edit/all-question-types-assessment-id'
    );
    var $shareButton = find('.gru-share-pop-over');

    click($shareButton);
    andThen(function() {
      var $popOverContent = find('.gru-share-pop-over-content');

      T.exists(assert, $popOverContent.find('p'), 'Missing share description');
      const $input = $popOverContent.find(
        '.share-actions #assessment-popover-input'
      );
      T.exists(assert, $input, 'Missing readonly input');
      assert.ok(
        $input
          .val()
          .indexOf('/player/all-question-types-assessment-id?type=assessment'),
        'Wrong share url'
      );
      var $copyBtn = $popOverContent.find('.share-actions .copy-btn');
      T.exists(assert, $copyBtn, 'Missing copy button');
    });
  });
});

skip('Click preview button', function(assert) {
  visit('/content/assessments/edit/all-question-types-assessment-id');

  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/assessments/edit/all-question-types-assessment-id'
    );
    var $previewButton = find('.actions .preview');

    click($previewButton);
    andThen(function() {
      assert.equal(
        currentURL(),
        '/player/all-question-types-assessment-id?resourceId=image-resource-id&role=teacher&type=assessment',
        'Wrong url'
      );
    });
  });
});

skip('Delete Assessment', function(assert) {
  visit('/content/assessments/edit/all-question-types-assessment-id');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/assessments/edit/all-question-types-assessment-id'
    );
    var $deleteButton = find('header .actions .delete');
    click($deleteButton);
    andThen(function() {
      var $deleteContentModal = find('.gru-modal .gru-delete-content');
      var $check1 = $deleteContentModal.find('ul li:eq(0) input');
      click($check1);
      andThen(function() {
        var $check2 = $deleteContentModal.find('ul li:eq(1) input');
        click($check2);
        andThen(function() {
          var $check3 = $deleteContentModal.find('ul li:eq(2) input');
          click($check3);
          andThen(function() {
            var $input = $deleteContentModal.find('.delete-input');
            $input.val('delete');
            $input.blur();
            keyEvent($input, 'keyup', KEY_CODES.ENTER);
            andThen(function() {
              var $deleteButton = $deleteContentModal.find('button.delete');
              click($deleteButton);
              andThen(function() {
                assert.equal(
                  currentURL(),
                  '/library-search?profileId=id-for-pochita&type=my-content'
                );
              });
            });
          });
        });
      });
    });
  });
});
skip('Add new question', function(assert) {
  visit('/content/assessments/edit/all-question-types-assessment-id');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/assessments/edit/all-question-types-assessment-id'
    );
    var $settings = find('#settings');
    assert.ok($settings.length, 'Missing settings section');
    var $addNewQuestionButton = find(
      '#builder .gru-collection-list .add-resource-question .add-new-question'
    );
    assert.ok($addNewQuestionButton.length, 'Missing add new question button');
    click($addNewQuestionButton);
    andThen(function() {
      var $newQuestionModal = find('.modal .gru-question-new');
      assert.ok($newQuestionModal.length, 'Missing question new modal');
      var $trueFalseType = $newQuestionModal.find('.question-type-T_F');
      assert.ok($trueFalseType.length, 'Missing true false question type');
      click($trueFalseType);
      andThen(function() {
        var $create = $newQuestionModal.find('.actions.question-new .add');
        assert.ok($create.length, 'Missing create button');
        click($create);
        andThen(function() {
          var $assessmentSettings = find('.nav-score-settings');
          assert.ok($assessmentSettings.length, 'Missing assessment settings');
        });
      });
    });
  });
});
