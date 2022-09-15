import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import { ASSESSMENT_SHOW_VALUES } from 'gooru-web/config/config';

moduleForComponent(
  'player/gru-viewer',
  'Unit | Component | player/gru viewer',
  {
    integration: false,
    needs: ['service:configuration']
  }
);

test('resourceComponentSelected for non valid resource type', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      resourceType: 'any-non-valid-value'
    })
  });

  assert.ok(
    !component.get('resourceComponentSelected'),
    'It should return false|undefined'
  );
});

test('resourceComponentSelected for image resource type', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      isImageResource: true
    })
  });

  assert.equal(
    component.get('resourceComponentSelected'),
    'player.resources.gru-image-resource',
    'Wrong component name'
  );
});

test('resourceComponentSelected for text/pdf resource type', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      resourceType: 'handouts'
    })
  });

  assert.equal(
    component.get('resourceComponentSelected'),
    'player.resources.gru-pdf-resource',
    'Wrong component name'
  );
});

test('resourceComponentSelected for youtube resource type', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      resourceType: 'video/youtube'
    })
  });

  assert.equal(
    component.get('resourceComponentSelected'),
    'player.resources.gru-youtube-resource',
    'Wrong component name'
  );
});
test('resourceComponentSelected for vimeo resource type', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      resourceType: 'vimeo/video'
    })
  });

  assert.equal(
    component.get('resourceComponentSelected'),
    'player.resources.gru-vimeo-resource',
    'Wrong component name'
  );
});

test('resourceComponentSelected for youtube resource type', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      resourceType: 'resource/url'
    })
  });

  assert.equal(
    component.get('resourceComponentSelected'),
    'player.resources.gru-url-resource',
    'Wrong component name'
  );
});

test('buttonTextKey when is not the last resource, no showing feedback', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      id: 1,
      resourceType: 'resource/url'
    }),
    collection: Ember.Object.create({
      isLastResource: function() {
        return false;
      },
      showFeedback: ASSESSMENT_SHOW_VALUES.NEVER
    })
  });

  assert.equal(
    component.get('buttonTextKey'),
    'common.save-next',
    'Wrong button text key'
  );
});

test('buttonTextKey when is the last resource and assessment, no showing feedback', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      id: 1,
      resourceType: 'resource/url'
    }),
    collection: Ember.Object.create({
      isLastResource: function() {
        return true;
      },
      isAssessment: true,
      showFeedback: ASSESSMENT_SHOW_VALUES.NEVER
    })
  });

  assert.equal(
    component.get('buttonTextKey'),
    'common.save-submit',
    'Wrong button text key'
  );
});

test('buttonTextKey when is the last resource and collection, no showing feedback', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      id: 1,
      resourceType: 'resource/url'
    }),
    collection: Ember.Object.create({
      isLastResource: function() {
        return true;
      },
      isAssessment: false,
      showFeedback: ASSESSMENT_SHOW_VALUES.NEVER
    })
  });

  assert.equal(
    component.get('buttonTextKey'),
    'common.save-finish',
    'Wrong button text key'
  );
});

test('buttonTextKey when is student and showing feedback and answer submitted and is last result', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      id: 1,
      resourceType: 'resource/url'
    }),
    resourceResult: Ember.Object.create({
      submittedAnswer: true
    }),
    collection: Ember.Object.create({
      isLastResource: function() {
        return true;
      },
      showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
    }),
    isTeacher: false
  });

  assert.equal(
    component.get('buttonTextKey'),
    'common.finish',
    'Wrong button text key'
  );
});

test('buttonTextKey when is student and showing feedback and answer submitted and is not last result', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      id: 1,
      resourceType: 'resource/url'
    }),
    resourceResult: Ember.Object.create({
      submittedAnswer: true
    }),
    collection: Ember.Object.create({
      isLastResource: function() {
        return false;
      },
      showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
    }),
    isTeacher: false
  });

  assert.equal(
    component.get('buttonTextKey'),
    'common.next',
    'Wrong button text key'
  );
});

test('buttonTextKey when is student and showing feedback and answer is not submitted', function(assert) {
  assert.expect(1);

  var component = this.subject({
    resource: Ember.Object.create({
      id: 1,
      resourceType: 'resource/url'
    }),
    resourceResult: Ember.Object.create({
      submittedAnswer: false
    }),
    collection: Ember.Object.create({
      isLastResource: function() {
        return true;
      },
      showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
    }),
    isTeacher: false
  });

  assert.equal(
    component.get('buttonTextKey'),
    'common.submit',
    'Wrong button text key'
  );
});

test('showFeedback using collection setting', function(assert) {
  assert.expect(1);

  var component = this.subject({
    showQuestionFeedback: undefined,
    collection: Ember.Object.create({
      showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
    }),
    isStudent: true
  });

  assert.ok(component.get('showFeedback'), 'Should be true');
});

test('showFeedback using show question feedback setting', function(assert) {
  assert.expect(1);

  var component = this.subject({
    collection: Ember.Object.create({
      showFeedback: ASSESSMENT_SHOW_VALUES.NEVER
    }),
    isStudent: true,
    showQuestionFeedback: true
  });

  assert.ok(component.get('showFeedback'), 'Should be true');
});

test('showFeedback using showQuestionFeedback when collection setting is true', function(assert) {
  assert.expect(1);

  var component = this.subject({
    showQuestionFeedback: false,
    collection: Ember.Object.create({
      showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
    }),
    isStudent: true
  });

  assert.ok(!component.get('showFeedback'), 'Should be false');
});
