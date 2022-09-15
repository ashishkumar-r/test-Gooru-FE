import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import Category from 'gooru-web/models/rubric/rubric-category';

moduleForComponent(
  'content/rubric/gru-scoring-levels',
  'Integration | Component | content/rubric/gru scoring levels',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    allowsLevels: true,
    allowsScoring: true
  });
  this.set('category', category);

  let levels = Ember.A([
    {
      name: '',
      score: null
    },
    {
      name: '',
      score: null
    }
  ]);
  this.set('scoringLevels', levels);

  this.render(
    hbs`{{content/rubric/gru-scoring-levels scoringLevels=scoringLevels category=category}}`
  );
  var $component = this.$();
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels').length,
    'Missing scoring levels component'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .level span').length,
    'Missing levels title'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .level .gru-switch')
      .length,
    'Missing levels switch'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .level .levels .scale')
      .length,
    'Missing scale'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .scale span.best'
    ).length,
    'Missing best label'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .scale .line'
    ).length,
    'Missing line'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .scale .arrow-down'
    ).length,
    'Missing arrow'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .scale .worst'
    ).length,
    'Missing worst label'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .scale .worst'
    ).length,
    'Missing worst label'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .level-list'
    ).length,
    'Missing level list'
  );
  assert.equal(
    $component.find(
      '.content.rubric.gru-scoring-levels .level .levels .level-list .gru-input'
    ).length,
    2,
    'Should have 2 levels'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .level .btn-new-level')
      .length,
    'Missing add new level button'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .points').length,
    'Missing points section'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .points span').length,
    'Missing points title'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .points .gru-switch')
      .length,
    'Missing points switch'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .points .point-list')
      .length,
    'Missing points list'
  );
  assert.equal(
    $component.find(
      '.content.rubric.gru-scoring-levels .points .point-list .gru-input'
    ).length,
    2,
    'Should have 2 point inputs'
  );
});

test('Delete Scoring Level', function(assert) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    allowsLevels: true,
    allowsScoring: true
  });
  this.set('category', category);

  let levels = Ember.A([
    {
      name: '',
      score: null
    },
    {
      name: '',
      score: null
    }
  ]);
  this.set('scoringLevels', levels);
  this.render(
    hbs`{{content/rubric/gru-scoring-levels scoringLevels=scoringLevels category=category}}`
  );
  var $component = this.$();
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels').length,
    'Missing scoring levels component'
  );
  assert.equal(
    $component.find(
      '.content.rubric.gru-scoring-levels .points .point-list .gru-input'
    ).length,
    2,
    'Should have 2 delete buttons'
  );
  var $firstLevelDeleteBtn = $component.find(
    '.content.rubric.gru-scoring-levels .point-list div:eq(0) .btn.delete'
  );
  //Ember.run(function () {
  $firstLevelDeleteBtn.click();
  //});
  return wait().then(function() {
    assert.equal(
      $component.find(
        '.content.rubric.gru-scoring-levels .points .point-list .gru-input'
      ).length,
      1,
      'Should have 1 levels'
    );
  });
});

test('Disabled scoring', function(assert) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    allowsLevels: true,
    allowsScoring: true
  });
  this.set('category', category);

  this.render(hbs`{{content/rubric/gru-scoring-levels category=category}}`);
  var $component = this.$();
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels').length,
    'Missing scoring levels component'
  );
  var $scoringSwitch = $component.find(
    '.content.rubric.gru-scoring-levels .points .gru-switch a input'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .level .levels').length,
    'Levels should appear'
  );
  $scoringSwitch.prop('checked', false);
  return wait().then(function() {
    $scoringSwitch.change();
    return wait().then(function() {
      assert.notOk(
        $component.find(
          '.content.rubric.gru-scoring-levels .points .point-list .gru-input'
        ).length,
        'Scoring should not appear'
      );
      assert.ok(
        $component.find('.content.rubric.gru-scoring-levels .level .levels')
          .length,
        'Levels should appear'
      );
    });
  });
});

test('Disabled level', function(assert) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    allowsLevels: true,
    allowsScoring: true
  });
  this.set('category', category);

  this.render(hbs`{{content/rubric/gru-scoring-levels category=category}}`);
  var $component = this.$();
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels').length,
    'Missing scoring levels component'
  );
  var $levelSwitch = $component.find(
    '.content.rubric.gru-scoring-levels .level .gru-switch a input'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .level .levels').length,
    'Levels should appear'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .points .point-list .gru-input'
    ).length,
    'Scoring should appear'
  );
  var $deleteBtn = $component.find(
    '.content.rubric.gru-scoring-levels .point-list div .btn.delete'
  );
  assert.ok($deleteBtn.length, 'Missing delete buttons');
  $levelSwitch.prop('checked', false);
  return wait().then(function() {
    $levelSwitch.change();
    return wait().then(function() {
      assert.notOk(
        $component.find('.content.rubric.gru-scoring-levels .level .levels')
          .length,
        'Levels should not appear'
      );
      assert.notOk(
        $component.find(
          '.content.rubric.gru-scoring-levels .points .point-list .gru-input'
        ).length,
        'Scoring should not appear'
      );
      var $deleteBtn = $component.find(
        '.content.rubric.gru-scoring-levels .point-list div .btn.delete'
      );
      assert.notOk($deleteBtn.length, 'Delete buttons should not appear');
    });
  });
});

test('Layout-Preview Mode', function(assert) {
  var category = Category.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Category for test',
    allowsLevels: true,
    allowsScoring: true
  });
  this.set('category', category);

  let levels = Ember.A([
    {
      name: 'Level 1',
      score: null
    },
    {
      name: 'Level 2',
      score: null
    }
  ]);
  this.set('scoringLevels', levels);

  this.render(
    hbs`{{content/rubric/gru-scoring-levels scoringLevels=scoringLevels preview=true category=category}}`
  );
  var $component = this.$();
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels').length,
    'Missing scoring levels component'
  );
  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .preview.level .legend')
      .length,
    'Missing levels title'
  );

  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .preview.level .levels .level-list'
    ).length,
    'Missing level list'
  );
  assert.equal(
    $component.find(
      '.content.rubric.gru-scoring-levels .preview.level .levels .level-list .value'
    ).length,
    2,
    'Should have 2 levels'
  );

  assert.ok(
    $component.find('.content.rubric.gru-scoring-levels .preview.points')
      .length,
    'Missing points section'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .preview.points .legend'
    ).length,
    'Missing points title'
  );
  assert.ok(
    $component.find(
      '.content.rubric.gru-scoring-levels .preview.points .point-list'
    ).length,
    'Missing points list'
  );
  assert.equal(
    $component.find(
      '.content.rubric.gru-scoring-levels .preview.points .point-list .value'
    ).length,
    2,
    'Should have 2 point values'
  );
});
