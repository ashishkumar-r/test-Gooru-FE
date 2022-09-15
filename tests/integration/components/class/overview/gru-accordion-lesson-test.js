//import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import T from 'gooru-web/tests/helpers/assert';
import tHelper from 'ember-i18n/helper';

moduleForComponent(
  'class/overview/gru-accordion-lesson',
  'Integration | Component | class/overview/gru accordion lesson',
  {
    integration: true,
    beforeEach: function() {
      this.register(
        'service:api-sdk/course-location',
        Ember.Service.extend({})
      );
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.registry.register('helper:t', tHelper);
    }
  }
);

test('it renders', function(assert) {
  const context = this;

  // Class with no collections per stub
  const currentClass = Ember.Object.create({
    id: '111-111-111',
    courseId: '999-999-999'
  });

  // Lesson model
  const lesson = Ember.Object.create({
    id: '888-000',
    title: 'Lesson Title',
    completed: 5,
    total: 10,
    assessmentCount: 1,
    collectionCount: 2
  });

  this.set('currentClass', currentClass);
  this.set('unitId', '777-999');
  this.set('lesson', lesson);
  this.set('index', 0);

  this.render(hbs`{{class/overview/gru-accordion-lesson
                    currentClass=currentClass
                    unitId=unitId
                    model=lesson
                    index=index }}`);

  const $component = this.$('.gru-accordion-lesson');
  assert.ok($component.length, 'Component does not have the component class');
  assert.ok(
    $component.hasClass('panel'),
    'Component should have the class panel'
  );
  assert.ok(
    $component.hasClass('panel-default'),
    'Component should have the class panel-default'
  );

  const $lessonHeading = $component.find('> .panel-heading');
  assert.ok($lessonHeading.length, 'Panel heading element is missing');

  const $lessonTitle = $lessonHeading.find('> .panel-title');
  assert.ok($lessonTitle.length, 'Panel title element is missing');

  const $lessonTitleAnchor = $lessonTitle.find('> a.title');
  assert.ok($lessonTitleAnchor.length, 'Title anchor element is missing');
  assert.ok(
    $lessonTitleAnchor.hasClass('collapsed'),
    'Panel should be collapsed by default'
  );
  assert.equal(
    T.text($lessonTitleAnchor),
    'Lesson 1Lesson Title',
    'Wrong title text'
  );

  const $lessonInfo = $lessonHeading.find('> .info');
  assert.ok($lessonInfo.length, 'Panel info element is missing');

  const $lessonContentCount = $lessonInfo.find('> .content-count');
  assert.equal(
    T.text($lessonContentCount.find('.assessment-count')),
    '1',
    'Wrong text assessment count'
  );
  assert.equal(
    T.text($lessonContentCount.find('.collection-count')),
    '2',
    'Wrong text collection count'
  );

  const $lessonPlayButton = $lessonInfo.find('.play-btn button');
  assert.ok($lessonPlayButton.length, 'Play button is missing');

  const $lessonPerformance = $lessonInfo.find(
    '.performance-container .gru-performance-chart'
  );
  assert.ok(
    $lessonPerformance.length,
    'lesson performance chart component is missing'
  );

  const $collapsePanel = $component.find('> .panel-collapse');
  assert.ok($collapsePanel.length, 'Panel element is missing');
  assert.ok(
    $collapsePanel.hasClass('collapse'),
    'Panel is missing class collapse'
  );
  assert.ok(
    !$collapsePanel.hasClass('in'),
    'Panel should not be visible by default'
  );
  assert.equal(
    `#${$collapsePanel.attr('id')}`,
    $lessonTitleAnchor.attr('href'),
    'Panel element should be tied to the title anchor element'
  );

  const $panelBody = $collapsePanel.find('> .panel-body');
  assert.ok($panelBody.length, 'Panel body element is missing');

  const $collectionsContainer = $panelBody.find('> .collections');
  assert.ok(
    $collectionsContainer.length,
    'Container for collections and assessments is missing'
  );

  // Content for collections/assessments is not available because the call to get data has not been made yet
  assert.equal(
    $collectionsContainer.text().trim(),
    context.get('i18n').t('common.contentUnavailable').string,
    'Content for collections/assessments should not be available'
  );
});

test('it renders correctly when there are no collections/assessments to load after clicking on the lesson name', function(assert) {
  assert.expect(7);

  const context = this;

  // Class with no lessons per stub
  const currentClass = Ember.Object.create({
    id: '111-111-111',
    courseId: '999-999-999'
  });

  // Lesson model
  const lesson = Ember.Object.create({
    id: 'lesson-with-out-collections-id',
    title: 'Lesson Title',
    completed: 5,
    total: 10
  });

  this.on('externalAction', function() {
    assert.ok(true, 'This should be called');
  });

  this.set('currentClass', currentClass);
  this.set('unitId', '777-999');
  this.set('lesson', lesson);
  this.set('index', 0);

  this.render(hbs`{{class/overview/gru-accordion-lesson
                    currentClass=currentClass
                    unitId=unitId
                    model=lesson
                    index=index
                    onSelectLesson=(action 'externalAction') }}`);

  const $component = this.$('.gru-accordion-lesson');
  const $lessonTitleAnchor = $component.find('> .panel-heading a.title');

  const $collapsePanel = $component.find('> .panel-collapse');
  assert.ok(!$collapsePanel.hasClass('in'), 'Panel should not be visible');

  const $collectionsContainer = $collapsePanel.find('.collections');

  // Content for lessons is not available because the call to get data has not been made yet
  assert.equal(
    $collectionsContainer.text().trim(),
    context.get('i18n').t('common.contentUnavailable').string,
    'Content for collections/assessments should not be available'
  );

  // Click on the lesson name
  Ember.run(() => {
    $lessonTitleAnchor.click();
  });
  return wait().then(function() {
    assert.ok($collapsePanel.hasClass('in'), 'Panel should be visible');

    return wait().then(function() {
      const $loadingSpinner = $collapsePanel.find('.three-bounce-spinner');
      assert.ok(
        !$loadingSpinner.length,
        'Loading spinner should have been hidden'
      );

      const $items = $collapsePanel.find('.collections .panel');
      assert.equal($items.length, 0, 'Incorrect number of collections listed');
      assert.equal(
        $collectionsContainer.text().trim(),
        context.get('i18n').t('common.contentUnavailable').string,
        'Incorrect message when there are no collections to load'
      );
    });
  });
});
test('Study now', function(assert) {
  assert.expect(6);

  this.on('parentAction', function(type, item) {
    assert.ok(type, 'Should have type');
    assert.ok(item, 'Should have item');
  });

  const currentClass = Ember.Object.create({
    id: '111-111-111',
    courseId: '999-999-999'
  });

  const lesson = Ember.Object.create({
    id: 'lesson-with-out-collections-id',
    title: 'Lesson Title',
    completed: 5,
    total: 10
  });

  this.on('externalAction', function() {
    assert.ok(true, 'This should be called');
  });

  this.set('currentClass', currentClass);
  this.set('unitId', '777-999');
  this.set('lesson', lesson);
  this.set('index', 0);
  this.set('currentResource', '123');
  this.set(
    'items',
    Ember.A([
      Ember.Object.create({
        id: '123',
        title: 'Equations',
        visible: true,
        performance: Ember.Object.create({
          hasTrophy: true
        }),
        isAssessment: true
      })
    ])
  );

  this.render(hbs`{{class/overview/gru-accordion-lesson
                    currentClass=currentClass
                    unitId=unitId
                    model=lesson
                    index=index
                    showLocation=false
                    items=items
                    isLessonSelected=isLessonSelected
                    onStudyNow=(action 'parentAction')
                    onSelectLesson=(action 'externalAction')}}`);

  var $component = this.$();
  const $lessonTitleAnchor = $component.find('.panel-heading a.title');
  const $collapsePanel = $component.find('.panel-collapse');
  Ember.run(() => {
    $lessonTitleAnchor.click();
  });
  return wait().then(function() {
    assert.ok($collapsePanel.hasClass('in'), 'Panel should be visible');
    assert.ok($collapsePanel.find('li'), 'Missing item');
    return wait().then(function() {
      var $studyNowButton = $component.find('.info .btn.study-now:eq(0)');
      assert.ok($studyNowButton.length, 'Missing study now button');
      $studyNowButton.click();
    });
  });
});

test('Go Live', function(assert) {
  assert.expect(6);

  this.on('parentAction', function(collectionId) {
    assert.ok(collectionId, 'collectionId is passed');
  });

  const currentClass = Ember.Object.create({
    id: '111-111-111',
    courseId: '999-999-999'
  });

  const lesson = Ember.Object.create({
    id: 'lesson-with-out-collections-id',
    title: 'Lesson Title',
    completed: 5,
    total: 10
  });

  this.on('externalAction', function() {
    assert.ok(true, 'This should be called');
  });

  this.on('newExternalAction', function(collection) {
    assert.ok(collection, 'This should be called');
  });

  this.on('otherExternalAction', function(collectionId) {
    assert.ok(collectionId, 'This should be called');
  });

  this.set('currentClass', currentClass);
  this.set('unitId', '777-999');
  this.set('lesson', lesson);
  this.set('index', 0);
  this.set('currentResource', '123');

  this.set(
    'items',
    Ember.A([
      Ember.Object.create({
        id: '123',
        title: 'Equations',
        visible: true,
        performance: Ember.Object.create({
          hasTrophy: true
        }),
        isAssessment: true
      })
    ])
  );
  this.render(hbs`{{class/overview/gru-accordion-lesson
                    currentClass=currentClass
                    unitId=unitId
                    model=lesson
                    index=index
                    showLocation=false
                    isTeacher=true
                    items=items
                    isLessonSelected=isLessonSelected
                    onGoLive=(action 'parentAction')
                    onSelectLesson=(action 'externalAction')
                    onLaunchOnAir=(action 'otherExternalAction')
                    onSelectResource=(action 'newExternalAction')}}`);

  var $component = this.$();
  const $lessonTitleAnchor = $component.find('.panel-heading a.title');
  const $collapsePanel = $component.find('.panel-collapse');
  Ember.run(() => {
    $lessonTitleAnchor.click();
  });
  return wait().then(function() {
    assert.ok($collapsePanel.hasClass('in'), 'Panel should be visible');
    assert.ok($collapsePanel.find('li'), 'Missing item');
    return wait().then(function() {
      var $goLiveButton = $component.find('.on-air');
      assert.ok($goLiveButton.length, 'Missing Go Live button');
      $goLiveButton.click();
    });
  });
});
test('Show trophy', function(assert) {
  assert.expect(4);

  const currentClass = Ember.Object.create({
    id: '111-111-111',
    courseId: '999-999-999',
    minScore: 10
  });

  const lesson = Ember.Object.create({
    id: 'lesson-with-out-collections-id',
    title: 'Lesson Title',
    completed: 5,
    total: 10
  });

  this.on('selectLesson', function() {
    assert.ok(true, 'This should be called');
  });

  this.set('currentClass', currentClass);
  this.set('unitId', '777-999');
  this.set('lesson', lesson);
  this.set('index', 0);
  this.set('currentResource', '123');
  this.set(
    'items',
    Ember.A([
      Ember.Object.create({
        id: '123-testing',
        title: 'Equations',
        visible: true,
        performance: Ember.Object.create({
          hasTrophy: true
        }),
        isAssessment: true,
        showTrophy: true
      }),
      Ember.Object.create({
        id: '123',
        title: 'Equations',
        visible: true,
        isAssessment: true
      })
    ])
  );
  this.render(hbs`{{class/overview/gru-accordion-lesson
                    currentClass=currentClass
                    unitId=unitId
                    model=lesson
                    index=index
                    showLocation=false
                    items=items
                    isStudent=true
                    isLessonSelected=isLessonSelected
                    onSelectLesson=(action 'selectLesson')}}`);

  var $component = this.$();
  const $lessonTitleAnchor = $component.find('.panel-heading a.title');
  const $collapsePanel = $component.find('.panel-collapse');
  Ember.run(() => {
    $lessonTitleAnchor.click();
  });
  return wait().then(function() {
    assert.ok($collapsePanel.hasClass('in'), 'Panel should be visible');
    assert.ok($collapsePanel.find('li'), 'Missing item');
    return wait().then(function() {
      assert.ok(
        $component.find('li.assessment:first-child .trophy').length,
        'Missing trophy'
      );
    });
  });
});
test('Non visible - Assessment', function(assert) {
  assert.expect(5);

  const currentClass = Ember.Object.create({
    id: '111-111-111',
    courseId: '999-999-999',
    minScore: 10
  });

  const lesson = Ember.Object.create({
    id: 'lesson-with-out-collections-id',
    title: 'Lesson Title',
    completed: 5,
    total: 10
  });

  this.on('selectLesson', function() {
    assert.ok(true, 'This should be called');
  });

  this.set('currentClass', currentClass);
  this.set('unitId', '777-999');
  this.set('lesson', lesson);
  this.set('index', 0);
  this.set('currentResource', '123');
  this.set(
    'items',
    Ember.A([
      Ember.Object.create({
        id: '123',
        title: 'Equations',
        visible: false,
        isAssessment: true
      })
    ])
  );
  this.render(hbs`{{class/overview/gru-accordion-lesson
                    currentClass=currentClass
                    unitId=unitId
                    model=lesson
                    index=index
                    showLocation=false
                    items=items
                    isStudent=true
                    isLessonSelected=isLessonSelected
                    onSelectLesson=(action 'selectLesson')}}`);

  var $component = this.$();
  const $lessonTitleAnchor = $component.find('.panel-heading a.title');
  const $collapsePanel = $component.find('.panel-collapse');
  Ember.run(() => {
    $lessonTitleAnchor.click();
  });
  return wait().then(function() {
    assert.ok($collapsePanel.hasClass('in'), 'Panel should be visible');
    assert.ok($collapsePanel.find('li'), 'Missing item');
    return wait().then(function() {
      assert.ok(
        $component.find('li.assessment:first-child').hasClass('item-disabled'),
        'Assessment should have the class item-disabled'
      );
      var $goLiveButton = $component.find('li.assessment:first-child .on-air');
      assert.notOk($goLiveButton.length, 'Missing Go Live button');
    });
  });
});
