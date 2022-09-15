import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import Resource from 'gooru-web/models/content/resource';
import Collection from 'gooru-web/models/content/collection';
import EditResourceValidations from 'gooru-web/validations/edit-resource';
import CreateResourceValidations from 'gooru-web/validations/create-resource';
import CenturySkillModel from 'gooru-web/models/century-skill/century-skill';

const taxonomyServiceStub = Ember.Service.extend({
  getSubjects(category) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!category) {
        reject({ status: 500 });
      } else {
        resolve({
          subjects: [
            {
              id: 'GDF.K12.CS',
              title: 'Computer Science',
              description: null,
              code: 'GDF.K12.CS',
              standard_framework_id: 'GDF'
            }
          ]
        });
      }
    });
  },

  getCategories: function() {
    const c1 = Ember.Object.create({
      id: 'k_12',
      code: 'K12',
      title: 'K12'
    });

    const c2 = Ember.Object.create({
      id: 'higher_education',
      code: 'HE',
      title: 'Higher Education'
    });

    const c3 = Ember.Object.create({
      id: 'professional_learning',
      code: 'PL',
      title: 'Professional Development'
    });

    return new Ember.RSVP.resolve([c1, c2, c3]);
  }
});

const ConfigurationService = Ember.Service.extend({
  configuration: Ember.Object.create({
    player: {
      resources: {
        pdf: {
          googleDriveEnable: true,
          googleDriveUrl: 'https://docs.google.com/gview?url='
        }
      }
    }
  })
});

moduleForComponent(
  'gru-resource-edit',
  'Integration | Component | content/resources/gru resource edit',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.register('service:taxonomy', taxonomyServiceStub);
      this.inject.service('taxonomy');
      this.register('service:configuration', ConfigurationService);
      this.inject.service('configuration');
      this.register('service:popover', Ember.Service.extend({}));
      this.inject.service('popover');
    }
  }
);

skip('it has header and main sections', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource Title',
      url: 'http://example.com/image.png'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-edit');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('> .actions').length, 'Header actions');
  assert.equal(
    $header.find('> .actions > button').length,
    4,
    'Number of header actions'
  );
  assert.ok(
    $container.find('.actions button.delete').length,
    'Missing Delete Button'
  );
  assert.ok(
    $container.find('.actions button.gru-share-pop-over').length,
    'Missing Share Button'
  );
  assert.ok(
    $container.find('.actions button.copy').length,
    'Missing Copy To Button'
  );
  assert.ok(
    $container.find('.actions button.preview').length,
    'Missing preview Button'
  );

  assert.ok($header.find('> nav').length, 'Header navigation');
  assert.equal(
    $header.find('> nav > a').length,
    3,
    'Number of header navigation links'
  );
  assert.notOk(
    $header.find('.back-to').length,
    'Should not have the option Back to Collection'
  );

  assert.equal(
    $container.find('> section').length,
    3,
    'Number of edit sections'
  );
  assert.ok($container.find('> section#resource').length, 'Resource section');
  assert.ok(
    $container.find('> section#information').length,
    'Information section'
  );
  assert.ok(
    $container.find('> section#settings').length,
    'Information section'
  );
});

test('Header when comes from content builder', function(assert) {
  var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Collection Title',
    id: '123445566'
  });
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource Title',
      url: 'http://example.com/image.png'
    }
  );

  this.set('resource', resource);
  this.set('collection', collection);
  this.render(
    hbs`{{content/resources/gru-resource-edit resource=resource collection=collection}}`
  );

  var $container = this.$('article.content.resources.gru-resource-edit');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok(
    $header.find('.back-to').length,
    'Should have the option Back to collection'
  );
});

test('Layout of preview section for youtube video', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Youtube Video',
      format: 'video',
      url: 'https://www.youtube.com/watch?v=hFAOXdXZ5TM'
    }
  );
  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-youtube-resource')
      .length,
    'YouTube component'
  );
  assert.ok(
    $settingsSection.find(
      '.panel.preview .panel-body .gru-youtube-resource iframe'
    ).length,
    'YouTube iframe'
  );
});

test('Layout of preview section for vimeo video', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Vimeo Video',
      format: 'video',
      url: 'https://vimeo.com/channels/staffpicks/107094723'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-vimeo-resource')
      .length,
    'Vimeo component'
  );
  assert.ok(
    $settingsSection.find(
      '.panel.preview .panel-body .gru-vimeo-resource iframe'
    ).length,
    'Vimeo iframe'
  );
});

test('Layout of preview section for image', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Image',
      format: 'image',
      url: 'http://example.com/image.png'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-image-resource')
      .length,
    'Image component'
  );
  assert.ok(
    $settingsSection.find(
      '.panel.preview .panel-body .gru-image-resource .panel-heading img'
    ).length,
    'Image tag'
  );
});

test('Layout of preview section for audio resource', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Audio',
      format: 'audio',
      url: 'http://example.com/test.mp3'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-url-resource')
      .length,
    'URL resource component'
  );
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-url-resource iframe')
      .length,
    'URL resource iframe'
  );
});

test('Layout of preview section for webpage', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Webpage',
      format: 'webpage',
      url: 'http://example.com/sample.html'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-url-resource')
      .length,
    'URL resource component'
  );
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-url-resource iframe')
      .length,
    'URL resource iframe'
  );
});

test('Layout of preview section for interactive', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Interactive',
      format: 'interactive',
      url: 'http://example.com/sample.swf'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-url-resource')
      .length,
    'URL resource component'
  );
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-url-resource iframe')
      .length,
    'URL resource iframe'
  );
});

test('Layout of preview section for text', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Text resource',
      format: 'text',
      url: 'http://example.com/sample.pdf'
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#resource');
  assert.ok($settingsSection.find('.header h2').length, 'Section title');
  assert.ok($settingsSection.find('.panel.preview').length, 'Preview panel');
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-pdf-resource')
      .length,
    'PDF resource component'
  );
  assert.ok(
    $settingsSection.find('.panel.preview .panel-body .gru-pdf-resource iframe')
      .length,
    'PDF resource iframe'
  );
});

test('Layout of preview section for a link out resource', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Text resource',
      format: 'text',
      url: 'http://example.com/sample.pdf',
      displayGuide: true
    }
  );

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-edit');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  const $panel = $container.find('.not-iframe');
  assert.ok($panel.length, 'Missing not-iframe panel');

  assert.ok(
    $panel.find('.panel-header').length,
    'panel-header of not-iframe panel'
  );
  assert.ok(
    $panel.find('.panel-body').length,
    'panel-body of not-iframe panel'
  );
  assert.ok(
    $panel.find('.panel-body .gru-resource-card').length,
    'Missing resource card'
  );
  assert.ok(
    $panel.find('.panel-body .gru-resource-card a.play-btn').length,
    'Missing play button'
  );
  assert.ok(
    $panel.find('.panel-footer').length,
    'panel-footer of not-iframe panel'
  );
});

test('Layout of the information section', function(assert) {
  var ResourceValidation = Resource.extend(EditResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource for testing',
      format: 'video',
      url: '//content.gooru.org/content/f000/2441/3377/FromAtoZinc.pdf',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      standards: [
        {
          id: 'NGSS.K12.SC-K.2-ED-02',
          code: 'K-2-ETS1-2',
          parentTitle: 'Science',
          description: '',
          frameworkCode: 'NGSS'
        }
      ]
    }
  );

  this.set('resource', resource);

  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $informationSection = this.$('#information');
  assert.ok(
    $informationSection.find('.header h2').length,
    'Information title missing'
  );
  assert.ok(
    $informationSection.find('.panel-body .title label b').length,
    'Missing title label'
  );
  assert.ok(
    $informationSection.find('.panel-body .publisher label b').length,
    'Missing publisher label'
  );
  assert.ok(
    $informationSection.find('.panel-body .type label b').length,
    'Missing type label'
  );
  assert.ok(
    $informationSection.find('.panel-body .license label b').length,
    'Missing license label'
  );
  assert.ok(
    $informationSection.find('.panel-body .description label b').length,
    'Missing description label'
  );

  var $standardsLabel = $informationSection.find(
    '.panel-body .standards label span'
  );

  assert.ok($standardsLabel.length, 'Missing standards label');
  assert.equal(
    $standardsLabel.text(),
    this.get('i18n').t('common.standards').string,
    'Incorrect standards label text'
  );
  assert.ok(
    $informationSection.find('.panel-body .gru-taxonomy-tag-list').length,
    'Missing taxonomy content'
  );
  assert.equal(
    $informationSection.find('.panel-body .gru-taxonomy-tag').length,
    1,
    'Missing taxonomy tag'
  );
});

test('Information section - Competency Label', function(assert) {
  var ResourceValidation = Resource.extend(EditResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource for testing',
      format: 'video',
      url: '//content.gooru.org/content/f000/2441/3377/FromAtoZinc.pdf',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      standards: [
        {
          id: 'NGSS.K12.SC-K.2-ED-02',
          code: 'K-2-ETS1-2',
          parentTitle: 'Science',
          description: '',
          frameworkCode: 'NGSS'
        }
      ]
    }
  );

  this.set('resource', resource);

  this.render(
    hbs`{{content/resources/gru-resource-edit resource=resource standardLabel=false}}`
  );

  var $informationSection = this.$('#information');
  var $competencyLabel = $informationSection.find(
    '.panel-body .standards label span'
  );

  assert.ok($competencyLabel.length, 'Missing competency label');
  assert.equal(
    $competencyLabel.text(),
    this.get('i18n').t('common.competencies').string,
    'Incorrect competency label text'
  );
});

test('Layout of the information section on edit mode', function(assert) {
  var ResourceValidation = Resource.extend(EditResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource for testing',
      format: 'video',
      url: '//content.gooru.org/content/f000/2441/3377/FromAtoZinc.pdf',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      displayGuide: true
    }
  );

  this.set('resource', resource);

  this.render(
    hbs`{{content/resources/gru-resource-edit resource=resource tempResource=resource isEditing=true}}`
  );
  var $informationSection = this.$('#information');
  assert.ok(
    $informationSection.find('.header h2').length,
    'Information title missing'
  );
  assert.ok(
    $informationSection.find('.panel-body label .gru-input.title').length,
    'Missing title label'
  );
  assert.ok(
    $informationSection.find('.panel-body .publisher label input[type=text]')
      .length,
    'Missing publisher label'
  );
  assert.ok(
    $informationSection.find(
      '.panel-body .publisher label input[type=checkbox]'
    ).length,
    'Missing I\'m publisher checkbox'
  );
  assert.ok(
    $informationSection.find('.panel-body .type .btn-group .dropdown-toggle')
      .length,
    'Missing type dropdown'
  );
  assert.ok(
    $informationSection.find('.panel-body .license label select').length,
    'Missing license select'
  );
  assert.ok(
    $informationSection.find('.panel-body .description label textarea').length,
    'Missing description textarea'
  );
  assert.ok(
    $informationSection.find('.panel-body .link-out label .gru-switch').length,
    'Missing link out switch'
  );
});

skip('Update Resource Information', function(assert) {
  assert.expect(1);
  var newTitle = 'Edited resource for testing';
  var ResourceValidation = Resource.extend(EditResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource for testing',
      format: 'video',
      url: 'http://example.com',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      displayGuide: false,
      centurySkills: [1, 5]
    }
  );

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

  this.set('resource', resource);
  this.set('centurySkills', centurySkills);
  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource centurySkills=centurySkills}}`
  );

  const $component = this.$('.gru-resource-edit');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val(newTitle);
  $titleField.find('input').trigger('blur');

  var $linkOutCheck = $component.find('.link-out .gru-switch .switch a input');

  Ember.run(() => {
    $linkOutCheck.click();
  });

  return wait().then(function() {
    const $save = $component.find('#information .actions .save');
    $save.click();
    return wait().then(function() {
      assert.equal(
        $component.find('.title label b').text(),
        newTitle,
        'The resource title should be updated'
      );
      // assert.equal(
      //   $component.find('.link-out label b').text(),
      //   '',
      //   'The link out should be true'
      // );
    });
  });
});

skip('Edit resource with incorrect URL', function(assert) {
  assert.expect(1);
  var newTitle = 'Edited resource for testing';
  var ResourceValidation = Resource.extend(EditResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Resource for testing',
      format: 'video',
      url: '//content.gooru.org/content/f000/2441/3377/FromAtoZinc.pdf',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      centurySkills: [1, 5]
    }
  );

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

  this.set('resource', resource);
  this.set('centurySkills', centurySkills);
  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource centurySkills=centurySkills}}`
  );

  const $component = this.$('.gru-resource-edit');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val(newTitle);
  $titleField.find('input').trigger('blur');

  const $save = $component.find('#information .actions .save');
  $save.click();
  return wait().then(function() {
    assert.equal(
      $component.find('.title label b').text(),
      newTitle,
      'The resource title should be updated'
    );
  });
});

test('Validate if the resource title field is left blank', function(assert) {
  assert.expect(3);
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: null,
      url: 'http://example.com',
      subject: 'CCSS.K12.Math',
      category: 'k_12'
    }
  );
  this.set('resource', resource);
  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource}}`
  );

  const $component = this.$('.gru-resource-edit #information');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );

  $titleField.find('input').trigger('blur');

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Title error should be visible'
    );
    $titleField.find('input').val('Resource Name');

    $titleField.find('input').trigger('blur');

    return wait().then(function() {
      assert.notOk(
        $titleField.find('.error-messages .error').length,
        'Title error message was hidden'
      );
    });
  });
});

test('Validate if the Resource Title field has only whitespaces', function(assert) {
  assert.expect(3);
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: null,
      url: 'http://example.com/image.png',
      subject: 'CCSS.K12.Math',
      category: 'k_12'
    }
  );
  this.set('resource', resource);

  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource}}`
  );

  const $component = this.$('.gru-resource-edit');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Resource Title error message not visible'
  );

  $titleField.find('input').trigger('blur');

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Resource Title error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val(' ');
    $titleField.find('input').trigger('blur');

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Resource Title error message should be visible'
      );
    });
  });
});

test('Validate the character limit in the Resource title field', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: null,
      url: 'http://example.com/image.png',
      subject: 'CCSS.K12.Math',
      category: 'k_12'
    }
  );
  this.set('resource', resource);

  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource}}`
  );

  const maxLenValue = this.$('.gru-resource-edit .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});

test('Validate that settings component is present', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Resource Title',
    url: 'http://example.com/image.png',
    subject: 'CCSS.K12.Math',
    category: 'k_12'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-edit resource=resource}}`);

  var $settingsSection = this.$('#settings');
  assert.ok($settingsSection.length, 'Section component exists');
});

test('Validate if the I am the publisher checkbox is checked', function(assert) {
  assert.expect(2);
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: null,
      url: 'http://example.com/image.png',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      amIThePublisher: false
    }
  );

  var session = Ember.Object.create({
    isAnonymous: false,
    userData: { username: 'jperez' }
  });

  this.set('resource', resource);
  this.set('session', session);

  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource session=session}}`
  );

  const $component = this.$('.gru-resource-edit');
  const $imPublisher = $component.find(
    '.checkbox-inline input[type="checkbox"]:checked'
  );

  assert.equal(
    $imPublisher.length,
    0,
    'imPublisher checkbox should not be checked'
  );

  $component.find('.checkbox-inline input').click();

  return wait().then(function() {
    const $publisherField = $component.find('.gru-input.publisher input');
    assert.equal(
      $publisherField.val(),
      session.userData.username,
      'The publisher field should be the user logged'
    );
  });
});

test('Validate if the I am the publisher checkbox is unchecked', function(assert) {
  assert.expect(2);
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: null,
      url: 'http://example.com/image.png',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      amIThePublisher: 'true'
    }
  );
  this.set('resource', resource);

  this.render(
    hbs`{{content/resources/gru-resource-edit isEditing=true resource=resource tempResource=resource}}`
  );

  const $component = this.$('.gru-resource-edit');
  const $imPublisher = $component.find(
    '.checkbox-inline input[type="checkbox"]:checked'
  );

  assert.equal(
    $imPublisher.length,
    1,
    'imPublisher checkbox should be checked'
  );

  $component.find('.checkbox-inline input').click();

  return wait().then(function() {
    const $publisherField = $component.find('.gru-input.publisher');
    assert.equal(
      $publisherField.val(),
      '',
      'The publisher field should be blank'
    );
  });
});

test('Editing a video resource should disable the type dropdown', function(assert) {
  var ResourceValidation = Resource.extend(EditResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: 'Video resource for testing',
      format: 'video',
      url: 'https://www.youtube.com/watch?v=wZZ7oFKsKzY&',
      subject: 'Nyan Cat',
      category: 'NC_1',
      displayGuide: true
    }
  );

  this.set('resource', resource);

  this.render(
    hbs`{{content/resources/gru-resource-edit resource=resource tempResource=resource isEditing=true}}`
  );
  var $informationSection = this.$('#information');
  assert.equal(
    $informationSection.find('.content button[data-toggle=dropdown].disabled')
      .length,
    2,
    'Both type dropdown buttons should be disabled when editing a video.'
  );
});

test('Information section - Century skills Label', function(assert) {
  var ResourceValidation = Resource.extend(CreateResourceValidations);
  var resource = ResourceValidation.create(
    Ember.getOwner(this).ownerInjection(),
    {
      title: null,
      url: 'http://example.com/image.png',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      centurySkills: [1, 5]
    }
  );

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

  this.set('resource', resource);
  this.set('centurySkills', centurySkills);

  this.render(
    hbs`{{content/resources/gru-resource-edit resource=resource tempResource=resource centurySkills=centurySkills}}`
  );

  var $informationSection = this.$('#information');
  var $centurySkillsLabel = $informationSection.find('.century-skills label');

  assert.ok($centurySkillsLabel.length, 'Resource century-skills label');
  assert.equal(
    $centurySkillsLabel.find('.skills .gru-century-skill-tag').length,
    2,
    'Two gru-century-skill-tag components'
  );
});
