import {
  skip
} from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import {
  authenticateSession
} from 'gooru-web/tests/helpers/ember-simple-auth';
//import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | Edit Question', {
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
/*
test('Click share button and check clipboard functionality', function (assert) {
  visit('/content/questions/edit/123');

  andThen(function () {
    assert.equal(currentURL(), '/content/questions/edit/123');
    var $shareButton = find(".gru-share-pop-over");

    click($shareButton);
    andThen(function () {
      var $popOverContent = find(".gru-share-pop-over-content");

      T.exists(assert, $popOverContent.find('p'), "Missing share description");
      T.exists(assert, $popOverContent.find('.share-actions #question-popover-input'), "Missing readonly input");
      var $copyBtn = $popOverContent.find('.share-actions .copy-btn');
      T.exists(assert, $copyBtn, "Missing copy button");
    });
  });
});
*/
skip('Delete Question', function(assert) {
  visit('/content/questions/edit/1');
  andThen(function() {
    assert.equal(currentURL(), '/content/questions/edit/1');
    var $deleteButton = find('header .actions .delete');
    click($deleteButton);
    andThen(function() {
      var $deleteContentModal = find('.gru-modal .gru-delete-question');
      var $deleteButton = $deleteContentModal.find('button.delete');
      click($deleteButton);
      andThen(function() {
        assert.equal(currentURL(), '/library-search?profileId=id-for-pochita&type=my-content');
      });
    });
  });
});
