import Ember from 'ember';

export default Ember.Component.extend({
  // --------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-create-class-popup'],

  classNameBindings: ['isNewClassCardOnly:class-card-only'],

  /**
   * @property {Service} taxonomy service API SDK
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @property {Service} Class service API SDK
   */
  classService: Ember.inject.service('api-sdk/class'),

  // -----------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} levelsList Holding level names
   */
  levelsList: ['category', 'subject', 'framework', 'grade'],

  /**
   * @property {Array} classCreationLevels Holding number of steps to finish create class
   */
  classCreationLevels: Ember.computed('levelsList', function() {
    let levelsList = this.get('levelsList').copy();
    levelsList = levelsList.map(level => {
      return Ember.Object.create({
        level,
        isActive: false,
        levelData: Ember.A([])
      });
    });
    return Ember.A(levelsList);
  }),

  /**
   * @property {Object} activeLevel Holding active level object
   */
  activeLevel: Ember.computed('classCreationLevels.@each.isActive', function() {
    return this.get('classCreationLevels').findBy('isActive', true);
  }),

  /**
   * @property {Array} selectedList Holding selected list
   */
  selectedList: Ember.computed(
    'classCreationLevels.@each.isActive',
    function() {
      return this.get('classCreationLevels')
        .mapBy('selectedItem')
        .filter(item => item);
    }
  ),

  /**
   * @property {Number} currentIndex Holding active index
   */
  currentIndex: Ember.computed(
    'classCreationLevels.@each.isActive',
    function() {
      return this.get('classCreationLevels').findIndex(level =>
        level.get('isActive')
      );
    }
  ),
  /**
   * @property {Object} selectedSubject Holding active subject
   */
  selectedSubject: Ember.computed(
    'classCreationLevels.@each.isActive',
    function() {
      let subject = this.get('classCreationLevels').findBy('level', 'subject');
      return subject.get('selectedItem') || null;
    }
  ),
  /**
   * @property {Object} selectedFramework Holding active framework
   */
  selectedFramework: Ember.computed(
    'classCreationLevels.@each.isActive',
    function() {
      let framework = this.get('classCreationLevels').findBy(
        'level',
        'framework'
      );
      return framework.get('selectedItem') || null;
    }
  ),

  /**
   * @property {Object} selectedGrade Holding active grade
   */
  selectedGrade: Ember.computed(
    'classCreationLevels.@each.isActive',
    function() {
      let grade = this.get('classCreationLevels').findBy('level', 'grade');
      return grade.get('selectedItem') || null;
    }
  ),

  /**
   * @property {String} activePanelTitle Holding active path
   */
  activePanelTitle: Ember.computed('selectedList', function() {
    let selectedItem = this.get('selectedList');
    return selectedItem.mapBy('title').join(' > ');
  }),

  /**
   * @property {Object} newClass
   * Property to hold new create class Name
   */
  newClass: null,

  /**
   * @property {Boolean} isShowCreateClassPop
   * Property help to show hide create class pop
   */
  isShowCreateClassPop: false,

  /**
   * @property {Boolean} isShowConfirmationPopup
   * Property help to show hide confirmation popup
   */
  isShowConfirmationPopup: false,

  // ---------------------------------------------------------------------------------------------
  // Hooks
  didInsertElement() {
    let firstLevel = this.get('classCreationLevels').get(0);
    firstLevel.set('isActive', true);
    this.categoryList();
  },

  // --------------------------------------------------------------------------------------------
  // Actions

  actions: {
    // Actions trigger when select any item from the panel
    onSelectLevel(item) {
      let currentLevel = this.get('activeLevel');
      let currentIndex = this.get('currentIndex');
      let nextIndex = currentIndex + 1;
      if (nextIndex <= this.get('classCreationLevels').length - 1) {
        currentLevel.setProperties({
          selectedItem: item,
          isActive: false
        });
        let nextLevel = this.get('classCreationLevels').get(nextIndex);
        nextLevel.set('isActive', true);
        this.onLoadAPI();
      } else {
        currentLevel.setProperties({
          selectedItem: item
        });
        this.set('selectedGrade', item);
        this.set('isShowConfirmationPopup', true);
      }
    },

    // Action trigger when click back button on the panel
    onSelectback() {
      this.set('isShowConfirmationPopup', false);
      let currentLevel = this.get('activeLevel');
      let currentIndex = this.get('currentIndex');
      let prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        currentLevel.setProperties({
          selectedItem: null,
          isActive: false,
          levelData: Ember.A([])
        });
        let prevLevel = this.get('classCreationLevels').get(prevIndex);
        prevLevel.setProperties({
          isActive: true,
          selectedItem: null
        });
      }
    },

    // Action trigger when click on close button of create class popup
    onClosePopup() {
      this.set('isShowCreateClassPop', false);
    },

    // Action trigger when click on close confirmation button on confirm popup
    onCloseConfirmation() {
      this.set('isShowConfirmationPopup', false);
    },

    // Action triggered when click confirmation button on confirm popup
    onConfirmation() {
      let component = this;
      let selectedSubject = component.get('selectedSubject');
      let selectedFramework = component.get('selectedFramework');
      let newClass = component.get('newClass');
      component
        .get('classService')
        .createClass(newClass)
        .then(newClass => {
          if (selectedSubject) {
            const preferenceSettings = {
              subject: selectedSubject.get('id'),
              framework: selectedFramework
                ? selectedFramework.get('frameworkId')
                : null
            };
            component
              .get('classService')
              .updatePreference(newClass.id, preferenceSettings)
              .then(() => {
                let selectedGrade = component.get('selectedGrade');
                if (selectedGrade) {
                  let grade = component
                    .get('classCreationLevels')
                    .findBy('level', 'grade');
                  let initialGrade = grade.get('levelData').get(0);
                  const settings = {
                    grade_lower_bound: initialGrade.get('id'),
                    grade_current: component.get('selectedGrade.id'),
                    force_calculate_ilp: true,
                    preference: preferenceSettings
                  };
                  component
                    .get('classService')
                    .classSettings(newClass.id, settings)
                    .then(() => {
                      component.gotoClassSettings(newClass);
                    });
                } else {
                  component.gotoClassSettings(newClass);
                }
              });
          } else {
            component.gotoClassSettings(newClass);
          }
        });
    }
  },

  // --------------------------------------------------------------------------------------------
  // Methods

  // Method used to fetch category list
  categoryList() {
    this.get('taxonomyService')
      .fetchCategories()
      .then(categories => {
        this.set('activeLevel.levelData', categories);
      });
  },
  // Method help to fetch subject list
  subjectList() {
    let category = this.get('classCreationLevels').findBy('level', 'category');
    let categoryId = category.get('selectedItem.id') || 'k_12';
    let filter = {
      filter: 'hasgrade'
    };
    this.get('taxonomyService')
      .fetchSubjects(categoryId, filter)
      .then(subject => {
        subject = subject.filter(item => item.get('frameworks').length);
        this.set('activeLevel.levelData', subject);
      });
  },
  // Methods help to fetch framework list
  frameworkList() {
    let subject = this.get('classCreationLevels').findBy('level', 'subject');
    let frameworks = subject.get('selectedItem.frameworks');
    if (frameworks) {
      this.set('activeLevel.levelData', frameworks);
    }
  },
  // Method help to fetch grade list
  gradeList() {
    let selectedSubject = this.get('selectedSubject');
    let selectedFramework = this.get('selectedFramework');
    let filter = {
      subject: selectedSubject.get('id'),
      fw_code: selectedFramework.get('frameworkId')
    };
    this.get('taxonomyService')
      .fetchGradesBySubject(filter)
      .then(grades => {
        this.set('activeLevel.levelData', grades);
      });
  },

  // Method help to identify and call the api based on active level
  onLoadAPI() {
    let activeLevel = this.get('activeLevel');
    switch (activeLevel.get('level')) {
    case 'category':
      this.categoryList();
      break;
    case 'subject':
      this.subjectList();
      break;
    case 'framework':
      this.frameworkList();
      break;
    case 'grade':
      this.gradeList();
      break;
    default:
      break;
    }
  },

  // Method help to go class activities page
  gotoClassActivity(newClass) {
    let component = this;
    component.set('isShowCreateClassPop', false);
    component.set('isShowConfirmationPopup', false);
    component
      .get('router')
      .transitionTo('teacher.class.class-activities', newClass.id);
  },

  gotoClassSettings(newClass) {
    let component = this;
    component.set('isShowCreateClassPop', false);
    component.set('isShowConfirmationPopup', false);
    component
      .get('router')
      .transitionTo('teacher.class.class-management', newClass.id);
  }
});
