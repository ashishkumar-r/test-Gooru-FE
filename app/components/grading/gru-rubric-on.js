import Ember from 'ember';
import GradeCategoryScore from 'gooru-web/models/rubric/grade-category-score';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-rubric-on'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * @function showCategory
     * Expand/collapse a category
     */
    showCategory: function(category) {
      category.set('selected', !category.get('selected'));
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.updateCategories();
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Rubric to grade
   * @property {Rubric} rubric
   */
  rubric: null,

  /**
   * Categories from grade
   * @property {Map} gradeCategories
   */
  gradeCategories: Ember.computed(
    'grade.categoriesScore.@each.levelObtained',
    'title',
    function() {
      return this.get(
        'grade.categoriesScore'
      ).reduce((categoriesMap, category) => {
        categoriesMap[category.get('title')] = category;
        return categoriesMap;
      }, {});
    }
  ),

  /**
   * Categories from rubric
   * @property {RubricCategory[]} rubricCategories
   */
  rubricCategories: Ember.computed.alias('rubric.categories'),

  /**
   * Student grade results
   * @property {RubricGrade} grade
   */
  grade: null,

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Maintain categories updated when changing students
   */
  observeGrade: Ember.observer('grade', function() {
    this.updateCategories();
  }),
  // -------------------------------------------------------------------------
  // Methods

  /**
   * Update categories to show, create object from rubric and student's grade
   */
  updateCategories: function() {
    let rubricCategories = this.get('rubricCategories');
    let gradeCategories = this.get('gradeCategories');
    this.set(
      'categories',
      rubricCategories.map(rubricCategory => {
        let gradeCategory = gradeCategories[rubricCategory.get('title')];
        // If the grade doesn't exist for the category, create one
        if (!gradeCategory) {
          gradeCategory = GradeCategoryScore.create(
            Ember.getOwner(this).ownerInjection(),
            {
              title: rubricCategory.get('title'),
              levelObtained: null,
              levelScore: null,
              levelMaxScore: rubricCategory.get('totalPoints')
            }
          );
          gradeCategories[rubricCategory.get('title')] = gradeCategory;
          this.set('grade.categoriesScore', Object.values(gradeCategories));
        }
        // Create list of levels to show in dropdown
        let levels = rubricCategory.get('levels').map(level => ({
          id: level.name,
          name: level.name
        }));
        levels = [{ id: null, name: '' }].concat(levels);
        // Create Object class for showing grading/category info
        let CategoryInfo = Ember.Object.extend({
          // Observer to update levelScore when levelObtained is changed
          levelSelectedOberver: Ember.observer(
            'grade.levelObtained',
            function() {
              let grade = this.get('grade');
              let levelName = this.get('grade.levelObtained');
              let info = this.get('info')
                .get('levels')
                .findBy('name', levelName);
              grade.set('levelScore', info ? info.score : null);
            }
          )
        });
        return CategoryInfo.create(Ember.getOwner(this).ownerInjection(), {
          info: rubricCategory,
          grade: gradeCategory,
          selected: false,
          levels
        });
      })
    );
  }
});
