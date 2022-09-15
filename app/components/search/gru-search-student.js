import Ember from 'ember';
import { ROLES, KEY_CODES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['search-student', 'gru-search-student'],

  // -------------------------------------------------------------------------
  // Dependencies
  profileService: Ember.inject.service('api-sdk/profile'),

  classService: Ember.inject.service('api-sdk/class'),

  i18n: Ember.inject.service(),

  /**
   * @property {Service} TenantService service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.inputHandler();
    component.resetProperties();
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  willDestroyElement() {
    const component = this;
    component.resetProperties();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when select a student
    onSelectStudent(student) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_SELECT_STUDENT);
      const selectedStudents = component.get('selectedStudents');
      const selectedStudentPos = selectedStudents.indexOf(student);
      if (selectedStudentPos >= 0) {
        selectedStudents.removeObject(student);
        student.set('isSelected', false);
      } else {
        selectedStudents.pushObject(student);
        student.set('isSelected', true);
      }
    },

    //Action triggered when hit Add button
    onAddStudents() {
      const component = this;
      const selectedStudents = component.get('selectedStudents');
      selectedStudents.forEach(item => {
        const context = {
          classId: item.id,
          email: item.email
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.ADD_STUDENT_CLASS_SETTING,
          context
        );
      });
      component.sendAction('onAddStudents', selectedStudents);
      component.resetProperties();
    },

    //Action triggered when toggle search criteria dropdown
    onToggleSearchCriteria(component = this) {
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_SEARCH_BY);
      component
        .$('.search-type-selector-container .search-type-list-container')
        .slideToggle(400, function() {
          if (component.$(this).is(':visible')) {
            component.$(this).css('display', 'inline-block');
          }
        });
      component.toggleProperty('isSearchCriteriaExpanded');
    },

    //Action triggered when select a search criteria
    onSelectSearchCriteria(searchCriteria) {
      const component = this;
      if (component.get('activeCriteria.type') !== searchCriteria.get('type')) {
        const searchCriterias = component.get('searchCriterias');
        searchCriterias.filter(searchCriteria => {
          searchCriteria.set('isActive', false);
        });
        searchCriteria.set('isActive', true);
        component.actions.onToggleSearchCriteria(component);
        component.sendAction('onAddMultiStudents', searchCriteria.type);
      }
    },

    //Action triggered when click search icon
    onSearchStudents() {
      const component = this;
      component.set('filteredStudents', Ember.A([]));
      component.loadStudents();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String} searchTerm
   * Property for entered search term
   */
  searchTerm: '',

  /**
   * @property {Array} filteredStudents
   * Property for filtered student list
   */
  filteredStudents: Ember.A([]),

  /**
   * @property {Array} selectedStudents
   * Property for selected student list
   */
  selectedStudents: Ember.A([]),

  /**
   * @property {Boolean} isEnableAdd
   * Property to enable/disable Add button
   */
  isEnableAdd: Ember.computed.gt('selectedStudents.length', 0),

  /**
   * @property {Array} classMembers
   * Property for active class members
   */
  classMembers: Ember.A([]),

  /**
   * @property {Boolean} isAddStundentByEmail
   * Property help to add bulk student by email or username
   */
  isAddStundentByEmail: Ember.computed('tenantSettingsObj', function() {
    let tenantSetting = this.get('tenantSettingsObj');
    return !(
      tenantSetting &&
      tenantSetting.ui_element_visibility_settings &&
      tenantSetting.ui_element_visibility_settings.add_students_by ===
        'username'
    );
  }),
  /**
   * @property {Array} searchCriterias
   * Property for list of student search criterias
   */
  searchCriterias: Ember.computed(function() {
    const component = this;
    return Ember.A([
      Ember.Object.create({
        type: 'email',
        label: component.get('i18n').t('sign-up.email'),
        isActive: component.get('isMulitAddStud')
          ? !!component.get('isAddStundentByEmail')
          : true
      }),
      Ember.Object.create({
        type: 'username',
        label: component.get('i18n').t('sign-up.username'),
        isActive: component.get('isMulitAddStud')
          ? !component.get('isAddStundentByEmail')
          : false
      })
    ]);
  }),

  /**
   * @property {Object} activeCriteria
   * Property for active search criteria
   */
  activeCriteria: Ember.computed('searchCriterias.@each.isActive', function() {
    return this.get('searchCriterias').findBy('isActive', true);
  }),

  /**
   * @property {Boolean} isSearchCriteriaExpanded
   * Property for search criteria expanded/collapsed view
   */
  isSearchCriteriaExpanded: false,

  /**
   * @property {Boolean} isNoStudentsFound
   * Property to check whether students found or not
   */
  isNoStudentsFound: false,

  /**
   * @property {Boolean} isLoading
   */
  isLoading: false,

  // -------------------------------------------------------------------------
  // Methods
  /**
   * @function inputTypeHandler
   * Method to handle the input key event
   */
  inputHandler() {
    const component = this;
    component
      .$('.search-student-input-container .search-student')
      .keyup(function(event) {
        let searchTerm = component.get('searchTerm');
        if (
          searchTerm &&
          event.keyCode === KEY_CODES.ENTER &&
          searchTerm.length >= 3
        ) {
          component.set('filteredStudents', Ember.A([]));
          component.loadStudents();
        }
      });
  },

  /**
   * @function loadStudents
   * Method to load student according to enabled search criteria
   */
  loadStudents() {
    const component = this;
    component.set('isLoading', true);
    component.set('isNoStudentsFound', false);
    component
      .fetchStudentProfiles()
      .then(function(userProfiles) {
        component.callTenantSettings();
        if (!component.isDestroyed) {
          const studentProfiles = userProfiles.filter(user => {
            return user.get('role') === ROLES.STUDENT;
          });
          const classMembers = component.get('classMembers');
          studentProfiles.map(student => {
            if (!classMembers.findBy('id', student.get('id'))) {
              component.get('filteredStudents').pushObject(student);
            }
          });
          component.set(
            'filteredStudents',
            component.get('filteredStudents').sortBy('lastName')
          );
          component.set('isLoading', false);
        }
      })
      .catch(function() {
        component.set('isNoStudentsFound', true);
        component.set('isLoading', false);
      });
  },

  callTenantSettings() {
    const component = this;
    component
      .get('tenantService')
      .getActiveTenantSetting()
      .then(function(tenantSettings) {
        component.set('tenantSettings', tenantSettings);
        component.set(
          'tenantClassSettings',
          tenantSettings.class_settings_show_student_info
        );
      });
  },

  /**
   * @function fetchStudentProfiles
   * @return {Promise}
   * Method to fetch student profiles based on enabled search term and criteria
   */
  fetchStudentProfiles() {
    const component = this;
    const searchType = component.get('activeCriteria.type');
    const searchTerm = component.get('searchTerm');
    const searchCriteria = {};
    searchCriteria[`${searchType}`] = searchTerm;
    return component.get('profileService').searchUserProfiles(searchCriteria);
  },

  /**
   * @function resetProperties
   * Method to reset active properties
   */
  resetProperties() {
    const component = this;
    component.set('filteredStudents', Ember.A([]));
    component.set('selectedStudents', Ember.A([]));
    component.set('searchTerm', '');
  }
});
