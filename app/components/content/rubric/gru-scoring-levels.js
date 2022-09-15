import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'rubric', 'gru-scoring-levels'],

  //// -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Delete Level
     */
    deleteLevel: function(level) {
      this.get('scoringLevels').removeObject(level);
    },
    /**
     * Delete Level
     */
    addLevel: function() {
      this.get('scoringLevels').addObject(
        Ember.Object.create({
          name: '',
          score: null
        })
      );
    },
    /**
     *Triggered when scoring switch change
     */
    onScoringChange: function(isChecked) {
      this.set('category.allowsScoring', isChecked);
    },
    /**
     *Triggered when level switch change
     */
    onLevelChange: function(isChecked) {
      this.set('category.allowsLevels', isChecked);
      if (!isChecked) {
        this.set('category.allowsScoring', false);
      }
    }
  },

  //// -------------------------------------------------------------------------
  // Properties

  /**
   *Category object to be edited
   *
   * @property {Category}
   */
  category: null,

  /**
   *Disabled Score Switch
   *
   * @property {Boolean}
   */
  disabledScoring: Ember.computed.not('category.allowsLevels'),

  /**
   * @property {[]} scoringLevels
   * Should have 4 levels as default
   */
  scoringLevels: Ember.A([
    {
      name: '',
      score: null
    },
    {
      name: '',
      score: null
    },
    {
      name: '',
      score: null
    },
    {
      name: '',
      score: null
    },
    {
      name: '',
      score: null
    }
  ]),

  /**
   *Show the score scale
   *
   * @property {Boolean}
   */
  showScore: Ember.computed.alias('category.allowsScoring'),

  /**
   *Show the level scale
   *
   * @property {Boolean}
   */
  showLevel: Ember.computed.alias('category.allowsLevels'),

  /**
   * @property {Boolean} preview
   */
  preview: false,

  /**
   * @property {Boolean} showNoLevelsError
   */
  showNoLevelsError: false,

  /**
   * List of options to show in the switch
   *
   * @property {Array}
   */
  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.on',
      value: true
    }),
    Ember.Object.create({
      label: 'common.off',
      value: false
    })
  ])
});
