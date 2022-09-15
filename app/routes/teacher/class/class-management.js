import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: {
    googleConnect: {
      refreshModel: true
    }
  },

  /**
   * @property {Ember.Service} Service to do retrieve language
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Boolean} isLevelDropdown
   */
  isLevelDropdown: false,

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  fluencyService: Ember.inject.service('api-sdk/fluency'),

  session: Ember.inject.service('session'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Methods

  model(params) {
    const route = this;
    if (params.googleConnect) {
      const data = {
        eventName: 'close'
      };
      window.opener.postMessage(data, '*');
      window.close();
    }
    const currentClass = route.modelFor('teacher.class').class;
    route.setTitle('Class Settings', currentClass.title);
    const subject = currentClass.get('preference.subject');
    let filters = {
      subject: subject
    };
    let fwkCode = currentClass.get('preference.framework');
    if (fwkCode) {
      filters.fw_code = fwkCode;
    }
    const fluData = {
      subject_code: subject,
      fw_id: fwkCode,
      tenant_id: this.get('session.tenantId')
    };
    let taxonomyService = route.get('taxonomyService');
    return Ember.RSVP.hash({
      languages: route.get('lookupService').getLanguages(),
      subjectTaxonomyGrades: subject
        ? route.get('taxonomyService').fetchGradesBySubject(filters)
        : [],
      class: currentClass,
      gradeSubjectFWK: subject ? taxonomyService.fetchSubject(subject) : [],
      frameworks: subject ? taxonomyService.fetchSubjectFWKs(subject) : [],
      fluencyDropdownValue:
        route.isShowFluencyLevel() && subject && fwkCode
          ? route.get('fluencyService').getFluencyLevel(fluData)
          : null
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   */
  setupController: function(controller, model) {
    controller.resetValues();
    controller.loadSecondaryClassList();
    controller.set('languages', model.languages);
    controller.set('subjectTaxonomyGrades', model.subjectTaxonomyGrades);
    let mathLevels = this.parseMathlevel(
      model.class,
      model.subjectTaxonomyGrades
    );
    if (!mathLevels.length) {
      controller.set('isLevelDropdown', true);
    }
    controller.set('levelItems', mathLevels);
    controller.set('class', model.class);
    controller.set('gradeSubjectFWK', model.gradeSubjectFWK);
    controller.set('frameworks', model.frameworks);
    controller.set('tempClass', model.class.copy());
    controller.set('tempClass.preference', controller.get('class.preference'));
    controller.set('tempClass.setting', controller.get('class.setting'));
    controller.get('classController').selectMenuItem('class-management');

    if (model.fluencyDropdownValue) {
      let f_data = Ember.A();
      model.fluencyDropdownValue.fluency.forEach(item => {
        item.fluency_display_title = `${item.fluency_display_code} - ${item.fluency_description}`;
        f_data.push(Ember.Object.create(item));
      });
      controller.set('fluencyDropdownValue', f_data);
    }
    controller.setupDisplayProperties();

    window.addEventListener(
      'message',
      function(event) {
        if (event.data && event.data.eventName === 'close') {
          controller.updateGoogleClassroom();
        }
      },
      false
    );

    controller.callTenantSettings();
  },
  parseMathlevel(classData, subjectTaxonomyGrades) {
    const controller = this;
    let levelItems = Ember.A();
    subjectTaxonomyGrades &&
      subjectTaxonomyGrades.forEach(grade => {
        if (grade.levels) {
          levelItems = levelItems.concat(grade.levels);
        }
      });
    controller.set('levelItems', levelItems);
    return levelItems;
  },
  isShowFluencyLevel() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }
});
