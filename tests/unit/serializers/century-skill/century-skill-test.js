import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:century-skill/century-skill',
  'Unit | Serializer | century-skill/century-skill'
);

test('normalizeCenturySkills', function(assert) {
  const serializer = this.subject();
  const centurySkillsPayload = {
    '21_century_skills': {
      'Key Cognitive Skills and Strategies': [
        {
          id: '1',
          conley_four_keys_model: false,
          hewlett_deep_learning_model: true,
          national_research_center_model: false,
          p21_framework_model: true,
          label: 'Problem Formulation'
        }
      ],
      'Key Content Knowledge': [
        {
          id: '2',
          conley_four_keys_model: false,
          hewlett_deep_learning_model: false,
          national_research_center_model: false,
          p21_framework_model: true,
          label: 'Master Core Academic Content'
        }
      ],
      'Key Learning Skills and Techniques': [
        {
          id: '3',
          conley_four_keys_model: true,
          hewlett_deep_learning_model: true,
          national_research_center_model: true,
          p21_framework_model: true,
          label: 'Goal Setting and Progress Monitoring'
        }
      ],
      categories: [
        'Hewlett Deep Learning Model',
        'Conley Four Key',
        'P21 Framework',
        'National Research Center for Life and Work'
      ]
    }
  };

  const normalizedCenturySkills = serializer.normalizeCenturySkills(
    centurySkillsPayload
  );
  assert.equal(normalizedCenturySkills.length, 3, 'Wrong century skills');
  assert.equal(
    normalizedCenturySkills[0].get('group'),
    'Key Cognitive Skills and Strategies',
    'Wrong group'
  );
  assert.equal(
    normalizedCenturySkills[0].get('label'),
    'Problem Formulation',
    'Wrong label'
  );
  assert.equal(
    normalizedCenturySkills[0].get('hewlettDeepLearningModel'),
    true,
    'Wrong Hewlett Deep Learning Model'
  );
  assert.equal(
    normalizedCenturySkills[0].get('nationalResearchCenterModel'),
    false,
    'Wrong National Research Center'
  );
  assert.equal(
    normalizedCenturySkills[0].get('p21FrameworkModel'),
    true,
    'Wrong P21 Framework'
  );

  assert.equal(
    normalizedCenturySkills[1].get('group'),
    'Key Content Knowledge',
    'Wrong group'
  );
  assert.equal(
    normalizedCenturySkills[1].get('label'),
    'Master Core Academic Content',
    'Wrong label'
  );
  assert.equal(
    normalizedCenturySkills[1].get('hewlettDeepLearningModel'),
    false,
    'Wrong Hewlett Deep Learning Model'
  );
  assert.equal(
    normalizedCenturySkills[1].get('nationalResearchCenterModel'),
    false,
    'Wrong National Research Center'
  );
  assert.equal(
    normalizedCenturySkills[1].get('p21FrameworkModel'),
    true,
    'Wrong P21 Framework'
  );

  assert.equal(
    normalizedCenturySkills[2].get('group'),
    'Key Learning Skills and Techniques',
    'Wrong group'
  );
  assert.equal(
    normalizedCenturySkills[2].get('label'),
    'Goal Setting and Progress Monitoring'
  );
  assert.equal(
    normalizedCenturySkills[2].get('hewlettDeepLearningModel'),
    true,
    'Wrong Hewlett Deep Learning Model'
  );
  assert.equal(
    normalizedCenturySkills[2].get('nationalResearchCenterModel'),
    true,
    'Wrong National Research Center'
  );
  assert.equal(
    normalizedCenturySkills[2].get('p21FrameworkModel'),
    true,
    'Wrong P21 Framework'
  );
});

test('normalizeReadCenturySkillInfo', function(assert) {
  const serializer = this.subject();

  const centurySkillPayload = {
    id: '1',
    conley_four_keys_model: false,
    hewlett_deep_learning_model: true,
    national_research_center_model: false,
    p21_framework_model: true,
    label: 'Problem Formulation'
  };

  const normalizedCenturySkill = serializer.normalizeReadCenturySkillInfo(
    centurySkillPayload,
    'Key Cognitive Skills and Strategies'
  );
  assert.equal(normalizedCenturySkill.get('id'), '1', 'Wrong id');
  assert.equal(
    normalizedCenturySkill.get('group'),
    'Key Cognitive Skills and Strategies',
    'Wrong group'
  );
  assert.equal(
    normalizedCenturySkill.get('label'),
    'Problem Formulation',
    'Wrong label'
  );
  assert.equal(
    normalizedCenturySkill.get('hewlettDeepLearningModel'),
    true,
    'Wrong Hewlett Deep Learning Model'
  );
  assert.equal(
    normalizedCenturySkill.get('nationalResearchCenterModel'),
    false,
    'Wrong National Research Center'
  );
  assert.equal(
    normalizedCenturySkill.get('p21FrameworkModel'),
    true,
    'Wrong P21 Framework'
  );
});
