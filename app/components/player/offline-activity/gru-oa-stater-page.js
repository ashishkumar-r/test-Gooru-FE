import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { ROLES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // ---------------------------------------------------------------
  // Attributes

  classNames: ['gru-oa-stater-page'],

  /**
   * Maintains the session object.
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  /**
   * Function to triggered once when the component element is after rendered
   */
  didRender() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action get triggered when rubric attachment preview got close
     */
    filePreviewClose(user) {
      this.$(`.rubric-file-preview-container.${user}`).fadeOut('slow');
    },

    /**
     * Action get triggered when rubric attachment preview got open
     */
    filePreviewOpen(user) {
      this.$(`.rubric-file-preview-container.${user}`)
        .css('visibility', 'visible')
        .hide()
        .fadeIn('slow');
    },
    //Action triggered when click on start player
    onStartPlayer() {
      const component = this;
      component.sendAction('onStartPlayer');
    },

    //Action triggered when click on close player
    onClosePlayer() {
      const component = this;
      component.sendAction('onClosePlayer');
    },

    //Aciton triggered when toggle teacher/student rubric categories container
    onToggleRubricContainer(containerSection) {
      const component = this;
      if (containerSection === ROLES.STUDENT) {
        component.toggleProperty('isStudentCategoriesExpanded');
      } else {
        component.toggleProperty('isTeacherCategoriesExpanded');
      }
      component.$(`.${containerSection}.categories-container`).slideToggle();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} activityTasks
   * Property for list of tasks associated with the offline activity
   */
  activityTasks: Ember.computed.alias('offlineActivity.tasks'),

  /**
   * @property {Array} activityReferences
   * Property for list references associated with the offline activity
   */
  activityReferences: Ember.computed.alias('offlineActivity.references'),

  /**
   * @property {Array} oaTaxonomies
   * Property for list of taxonomies associated with the offline activity
   */
  oaTaxonomies: Ember.computed('offlineActivity.standards.[]', function() {
    var standards = this.get('offlineActivity.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
    }
    return TaxonomyTag.getTaxonomyTags(standards);
  }),

  /**
   * @property {Array} activityTeacherRubric
   * Property for list of teacher rubrics
   */
  activityTeacherRubric: Ember.computed('offlineActivity.rubrics', function() {
    const component = this;
    const oaRubrics = component.get('offlineActivity.rubric');
    return oaRubrics.findBy('gradeType', ROLES.TEACHER);
  }),

  /**
   * @property {Array} teacherRubricCategories
   * Property for list of teacher rubric categories
   */
  teacherRubricCategories: Ember.computed('activityTeacherRubric', function() {
    const component = this;
    let activityTeacherRubric = component.get('activityTeacherRubric');
    let oaRubricTeacherCategories = Ember.A([]);
    let categories = activityTeacherRubric.get('categories') || Ember.A([]);
    oaRubricTeacherCategories = component.parseRubricCategories(
      oaRubricTeacherCategories,
      categories
    );
    return oaRubricTeacherCategories;
  }),

  /**
   * @property {Array} activityStudentRubric
   * Property for list of student rubrics
   */
  activityStudentRubric: Ember.computed('offlineActivity.rubrics', function() {
    const component = this;
    const oaRubrics = component.get('offlineActivity.rubric');
    return oaRubrics.findBy('gradeType', ROLES.STUDENT);
  }),

  /**
   * @property {Array} studentRubricCategories
   * Property for list of student rubric categories
   */
  studentRubricCategories: Ember.computed('activityStudentRubric', function() {
    const component = this;
    let activityStudentRubric = component.get('activityStudentRubric');
    let oaRubricStudentCategories = Ember.A([]);
    let categories = activityStudentRubric.get('categories') || Ember.A([]);
    oaRubricStudentCategories = component.parseRubricCategories(
      oaRubricStudentCategories,
      categories
    );
    return oaRubricStudentCategories;
  }),
  /**
   * @property {Boolean} isStudent
   */
  isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),
  /**
   * property used to show student title
   */
  studentTitle: ROLES.STUDENT,
  /**
   * property used to show teacher title
   */
  teacherTitle: ROLES.TEACHER,
  /**
   * @property {studentActivityReferences[]} List of user reference details
   */
  studentActivityReferences: Ember.computed(
    'offlineActivity.references',
    function() {
      let reference = this.get('offlineActivity.references');
      if (reference && reference.length) {
        let filtercontent = reference.filterBy('userType', ROLES.STUDENT);
        return Ember.Object.create({
          references: filtercontent
        });
      }
      return {};
    }
  ),
  /**
   * @property {teacherActivityReferences[]} List of teacher reference details
   */
  teacherActivityReferences: Ember.computed(
    'offlineActivity.references',
    function() {
      let reference = this.get('offlineActivity.references');
      if (reference && reference.length) {
        let filtercontent = reference.filterBy('userType', ROLES.TEACHER);
        return Ember.Object.create({
          references: filtercontent
        });
      }
      return {};
    }
  ),
  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function parseRubricCategories
   * Method to parse rubric categories
   */
  parseRubricCategories(oaRubricCategories, categories) {
    categories.map(category => {
      let levels = category.get('levels');
      if (levels) {
        if (category.get('allowsLevels') && category.get('allowsScoring')) {
          levels = levels.sortBy('score');
        }
        category.set('levels', levels);
      }
      oaRubricCategories.pushObject(category);
    });
    return oaRubricCategories;
  }
});
