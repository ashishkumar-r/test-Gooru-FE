import Ember from 'ember';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { DEFAULT_IMAGES, TAXONOMY_LEVELS } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
/**
 * Serializer to support the Featured Courses CRUD operations for API 3.0
 *
 * @typedef {Object} FeaturedCoursesSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  normalizeIndependentCourseList(payload) {
    const courseList = payload ? payload.courses : [];
    const independentCourseList = Ember.A([]);
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    if (courseList.length) {
      courseList.map(payload => {
        const thumbnailUrl = payload.thumbnail
          ? basePath + payload.thumbnail
          : appRootPath + DEFAULT_IMAGES.COURSE;
        let course = Ember.Object.create({
          id: payload.id,
          collaborator: payload.collaborator ? payload.collaborator : [],
          hasJoined: payload.has_joined || false,
          originalCourseId: payload.original_course_id,
          originalCreatorId: payload.original_creator_id,
          description: payload.description,
          defaultGradeLevel: payload.default_grade_level,
          isPublished:
            payload.publish_status && payload.publish_status === 'published',
          isVisibleOnProfile:
            typeof payload.visible_on_profile !== 'undefined'
              ? payload.visible_on_profile
              : true,
          ownerId: payload.owner_id,
          subject: payload.subject_bucket,
          summary: payload.summary,
          taxonomy: serializer
            .get('taxonomySerializer')
            .normalizeTaxonomyObject(payload.taxonomy, TAXONOMY_LEVELS.COURSE),
          thumbnailUrl: thumbnailUrl,
          title: payload.title,
          publisherStatus: payload.publisher_info || null,
          publisherInfo: payload.publisher_info || null,
          aggregatedTaxonomy: payload.aggregated_taxonomy
            ? payload.aggregated_taxonomy
            : null,
          learnerCount: payload.learner_count,
          primaryLanguage: payload.primary_language,
          sequence: payload.sequence_id,
          additionalInfo: payload.settings.additional_info,
          subProgramId: payload.navigator_sub_program_id,
          navigatorProgramInfo: payload.navigator_program_info,
          settings: Ember.Object.create({
            forceCalculateIlp: payload.settings.force_calculate_ilp,
            framework: payload.settings.framework,
            gradeLowerBound: payload.settings.grade_lower_bound,
            gradeUpperBound: payload.settings.grade_upper_bound,
            instructorId: payload.settings.instructor_id,
            route0Applicable: payload.settings.route0_applicable,
            gradeCurrent: payload.settings.grade_current,
            isDiagnosticApplicable: payload.settings.is_diagnostic_applicable
          })
        });
        independentCourseList.pushObject(course);
      });
    }
    return independentCourseList;
  },

  normalizeCourseGradeLevels(payload) {
    const gradeList = payload ? payload.grades : [];
    return gradeList;
  }
});
