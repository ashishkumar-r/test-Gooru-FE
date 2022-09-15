import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import CenturySkillModel from 'gooru-web/models/century-skill/century-skill';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'century-skills/gru-century-skills-content',
  'Integration | Component | century-skills/gru century skills content',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
    }
  }
);

test('Century skills content Layout - select/unselect skills', function(
  assert
) {
  var centurySkills = [
    CenturySkillModel.create({
      id: 1,
      label: 'Problem Formulation',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Cognitive Skills and Strategies'
    }),
    CenturySkillModel.create({
      id: 2,
      label: 'Research: Access and Evaluate Information',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Cognitive Skills and Strategies'
    }),
    CenturySkillModel.create({
      id: 3,
      label: 'Global Awareness',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Content Knowledge'
    }),
    CenturySkillModel.create({
      id: 4,
      label: 'Building of Persistence',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Learning Skills and Techniques'
    }),
    CenturySkillModel.create({
      id: 5,
      label: 'Leadership',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Learning Skills and Techniques'
    })
  ];

  var selectedCenturySkills = [1, 5];

  this.set('centurySkills', centurySkills);
  this.set('selectedCenturySkills', selectedCenturySkills);

  this.render(hbs`{{
    century-skills/gru-century-skills-content
      centurySkills=centurySkills
      selectedCenturySkills=selectedCenturySkills}}`);

  var $component = this.$('.gru-century-skills-content');
  assert.ok($component.length, 'Component');

  var $cognitiveSkillsColumn = $component.find('.column.cognitive-skills');
  var $contentSkillsColumn = $component.find('.column.content-skills');
  var $learningSkillsColumn = $component.find('.column.learning-skills');

  assert.equal(
    $component.find('.column').length,
    3,
    'Number of skills columns'
  );
  assert.ok($cognitiveSkillsColumn.length, 'cognitive-skills column');
  assert.ok($contentSkillsColumn.length, 'content-skills column');
  assert.ok($learningSkillsColumn.length, 'learning-skills column');
  assert.equal(
    $cognitiveSkillsColumn.find('li').length,
    2,
    'Number of skill items in the cognitive-skills columns'
  );
  assert.equal(
    $contentSkillsColumn.find('li').length,
    1,
    'Number of skill items in the content-skills columns'
  );
  assert.equal(
    $learningSkillsColumn.find('li').length,
    2,
    'Number of skill items in the learning-skills columns'
  );
  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing cancel button'
  );
  assert.ok(
    $component.find('.actions .select').length,
    'Missing select button'
  );

  //Content of the first Skill Item
  var $skillCategories = $cognitiveSkillsColumn.find('li:eq(0) .categories');
  assert.ok($skillCategories.length, 'cognitive-skill categories');
  assert.ok(
    $skillCategories.find('.circle.hewlett').length,
    'cognitive-skill hewlett category'
  );
  assert.ok(
    $skillCategories.find('.circle.framework').length,
    'cognitive-skill framework category'
  );

  //Skill Items selected
  assert.ok(
    $cognitiveSkillsColumn.find('li:eq(0) .title.selected').length,
    'first cognitive-skill selected'
  );
  assert.ok(
    $learningSkillsColumn.find('li:eq(1) .title.selected').length,
    'second learning-skill selected'
  );

  $learningSkillsColumn.find('li:eq(1) .title.selected').click();
  return wait().then(function() {
    assert.notOk(
      $learningSkillsColumn.find('li:eq(1) .title').hasClass('selected'),
      'second learning-skill should not be selected'
    );
  });
});
