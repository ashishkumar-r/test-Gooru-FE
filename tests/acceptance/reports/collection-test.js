/*global SockJS:true*/
import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | reports/collection', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'player-token',
      user: {
        gooruUId: 'player-token-user-id'
      }
    });
  }
});

skip('Layout', function(assert) {
  assert.expect(2);
  visit(
    '/reports/class/just-a-class/collection/all-question-types-assessment-id'
  );

  let createSocket = () => {
    return {
      heartbeat: {},
      connect: (headers, connectCallback) => connectCallback(),
      subscribe: () => {
        //So it doesn't fail when the function is called from quizzes-addon
      }
    };
  };
  Stomp.over = () => createSocket();
  SockJS = () => () => {
    //So it doesn't fail when the function is called from quizzes-addon
  };

  let done = assert.async();
  andThen(function() {
    assert.equal(
      currentURL(),
      '/reports/class/just-a-class/collection/all-question-types-assessment-id'
    );
    const $reportContainer = find('.reports.qz-class-assessment-report');
    T.exists(assert, $reportContainer, 'Missing quizzes reports component');
    done();
  });
});
