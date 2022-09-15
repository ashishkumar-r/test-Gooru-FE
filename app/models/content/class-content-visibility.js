import Ember from 'ember';
import Class from 'gooru-web/models/content/class';
/**
 * ClassContentVisibility model
 * typedef {Object} ClassContentVisibility
 */
const ClassContentVisibility = Ember.Object.extend({
  /**
   * @property {string}
   */
  contentVisibility: null,

  /**
   * Sample:
   {
    'content_visibility': 'visible_collections',
     'course': {
        'id': '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
        'units': [{
            'id': '6354b8ad-2d32-48e8-9588-2883dbd97152',
            'lessons': [{
                'id': '176a137d-22c8-4e71-826a-39c2592de889',
                'assessments': [{
                    'id': '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                    'visible': 'on'
                }],
                'collections': [{
                    'id': '781b8add-31a4-4186-912a-31f735180805',
                    'visible': 'off'
                    }, {
                    'id': '86e5e705-66b0-470a-9ff0-f00472adeb0b',
                    'visible': 'on'
                }]
          }]
     }]
  }
}

   * @property { id: number, units: [] }
   */
  course: null,

  /**
   * Contains the count totals for all levels
   *
   * {
   *   units: {
   *     unit-id-1 : {
   *       collections: number,
   *       assessments: number,
   *       lessons: {
   *         lesson-id-1: {
   *           collections: number,
   *           assessments: number,
   *         },
   *         lesson-id-1: {
   *           collections: number,
   *           assessments: number,
   *         }
   *       }
   *     },
   *     unit-id-2: { ... }
   *   }
   * }
   *
   * @property {*}
   */
  totals: null,

  /**
   * All assessments ids
   * @property [string]
   */
  assessments: Ember.A([]),

  /**
   * All collections ids
   * @property [string]
   */
  collections: Ember.A([]),

  /**
   * Indicates if all content within this class is visible
   * @property {boolean}
   */
  isAllContentVisible: Ember.computed('contentVisibility', function() {
    return this.get('contentVisibility') === Class.VISIBLE_ALL;
  }),

  /**
   * Indicates if all collections within this class is visible
   * @property {boolean}
   */
  areCollectionsVisible: Ember.computed('contentVisibility', function() {
    return (
      this.get('contentVisibility') === Class.VISIBLE_COLLECTIONS ||
      this.get('isAllContentVisible')
    );
  }),

  // Events
  onInit: Ember.on('init', function() {
    this.set('totals', this.getTotals());
    this.set('assessments', this.getAssessments());
    this.set('collections', this.getCollections());
  }),

  // Methods
  /**
   * Return a list of visible or non visible assessments
   */
  getAssessments: function() {
    let units = this.get('course.units') || Ember.A([]);
    let assessments = Ember.A([]);
    let lessons = Ember.A([]);
    units.forEach(function(unit) {
      lessons.addObjects(unit.lessons);
      lessons.forEach(function(lesson) {
        if (lesson.assessments) {
          assessments.addObjects(lesson.assessments);
        }
      });
    });
    return assessments;
  },
  /**
   * Return a list of visible or non visible collections
   */
  getCollections: function() {
    let units = this.get('course.units') || Ember.A([]);
    let collections = Ember.A([]);
    let lessons = Ember.A([]);
    units.forEach(function(unit) {
      lessons.addObjects(unit.lessons);
      lessons.forEach(function(lesson) {
        if (lesson.collections) {
          collections.addObjects(lesson.collections);
        }
      });
    });
    return collections;
  },
  /**
   * Find assessment visibility by assessment id
   */
  findAssessmentVisibilityById: function(assessmentId) {
    let assessments = this.get('assessments');
    return assessments.findBy('id', assessmentId);
  },
  /**
   * Find collection visibility by collectionId
   */
  findCollectionVisibilityById: function(collectionId) {
    let collections = this.get('collections');
    return collections.findBy('id', collectionId);
  },
  /**
   * Set assessment visibility
   */
  setAssessmentVisibility: function(assessmentId, visibility) {
    let assessments = this.get('assessments');
    let assessment = assessments.findBy('id', assessmentId);
    if (assessment) {
      assessment.visible = visibility;
    }
    return assessment;
  },
  /**
   * Return true if the content is visible
   */
  isVisible: function(contentId) {
    let isAllVisible = this.get('isAllContentVisible');
    let contentItem = this.findAssessmentVisibilityById(contentId);
    if (!contentItem) {
      contentItem = this.findCollectionVisibilityById(contentId);
      if (!contentItem) {
        Ember.Logger.warn(`No content visibility found for id: ${contentId}`);
      }
    }

    //
    // if content is not found in either bucket, we let visibility be ON as fallback
    //
    let enabled = !contentItem || (contentItem && contentItem.visible === 'on');
    let disabled = contentItem && contentItem.visible === 'off';

    return (
      (isAllVisible && enabled) ||
      (isAllVisible && !disabled) ||
      (!isAllVisible && enabled) ||
      (!isAllVisible && !disabled)
    );
  },

  /**
   * Return the content total counts
   * @returns {*}
   */
  getTotals: function() {
    const units = this.get('course.units') || [];
    const totals = Ember.Object.create({
      units: Ember.Object.create()
    });
    units.forEach(function(unit) {
      const unitId = unit.id;
      const unitTotals = Ember.Object.create({
        assessments: 0,
        collections: 0,
        lessons: Ember.Object.create({})
      });
      totals.get('units').set(unitId, unitTotals);

      const lessons = unit.lessons || [];
      lessons.forEach(function(lesson) {
        const lessonId = lesson.id;
        const assessments = (lesson.assessments || []).length;
        const collections = (lesson.collections || []).length;
        unitTotals.get('lessons').set(
          lessonId,
          Ember.Object.create({
            assessments: assessments,
            collections: collections
          })
        );
        unitTotals.set(
          'assessments',
          unitTotals.get('assessments') + assessments
        );
        unitTotals.set(
          'collections',
          unitTotals.get('collections') + collections
        );
      });
    });
    return totals;
  },

  /**
   * Retrieves the total assessments per lesson
   * @param unitId
   * @param lessonId
   */
  getTotalAssessmentsByUnitAndLesson: function(unitId, lessonId) {
    return (
      this.get(`totals.units.${unitId}.lessons.${lessonId}.assessments`) || 0
    );
  },
  /**
   * Retrieves the total assessments per unit
   * @param unitId
   */
  getTotalAssessmentsByUnit: function(unitId) {
    return this.get(`totals.units.${unitId}.assessments`) || 0;
  },

  /**
   * Retrieves the total collections per lesson
   * @param unitId
   * @param lessonId
   */
  getTotalCollectionsByUnitAndLesson: function(unitId, lessonId) {
    return (
      this.get(`totals.units.${unitId}.lessons.${lessonId}.collections`) || 0
    );
  },
  /**
   * Retrieves the total collections per unit
   * @param unitId
   */
  getTotalCollectionsByUnit: function(unitId) {
    return this.get(`totals.units.${unitId}.collections`) || 0;
  }
});

export default ClassContentVisibility;
