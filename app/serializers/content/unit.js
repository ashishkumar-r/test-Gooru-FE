import Ember from 'ember';
import Lesson from 'gooru-web/models/content/lesson';
import Unit from 'gooru-web/models/content/unit';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { TAXONOMY_LEVELS } from 'gooru-web/config/config';
import { serializeEtlSec } from 'gooru-web/utils/utils';

/**
 * Serializer to support the Unit CRUD operations
 *
 * @typedef {Object} UnitSerializer
 */
export default Ember.Object.extend({
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

  /**
   * Serialize a Content/Unit object into a JSON representation required by the Create Unit endpoint
   *
   * @param unitModel - The unit model to be serialized
   * @returns {Object} JSON Object representation of the unit model
   */
  serializeCreateUnit: function(unitModel) {
    return this.serializeUpdateUnit(unitModel);
  },

  /**
   * Serialize a Content/Unit object into a JSON representation required by the Update Unit endpoint
   *
   * @param unitModel - The unit model to be serialized
   * @returns {Object} JSON Object representation of the unit model
   */
  serializeUpdateUnit: function(unitModel) {
    const serializer = this;
    let serializedUnit = {
      title: unitModel.get('title'),
      big_ideas: unitModel.get('bigIdeas'),
      essential_questions: unitModel.get('essentialQuestions'),
      taxonomy: serializer
        .get('taxonomySerializer')
        .serializeTaxonomy(unitModel.get('taxonomy'))
    };
    if (unitModel.get('author_etl_secs')) {
      serializedUnit.author_etl_secs =
        unitModel.get('author_etl_secs') === '0'
          ? null
          : unitModel.get('author_etl_secs');
    }
    return serializedUnit;
  },

  /**
   * Normalize a unit response
   * @param unitData - The endpoint response in JSON format
   * @returns {Content/Unit} unit model
   */
  normalizeUnit: function(payload) {
    var serializer = this;
    const etlSeconds = serializeEtlSec(payload.author_etl_secs);
    const computedEtlSec = serializeEtlSec(payload.computed_etl_secs);
    return Unit.create(Ember.getOwner(this).ownerInjection(), {
      children: (function() {
        var lessons = [];
        if (payload.lesson_summary) {
          lessons = payload.lesson_summary.map(function(lessonData) {
            let assessmentCount = lessonData.assessment_count
              ? lessonData.assessment_count
              : 0;
            let externalAssessmentCount = lessonData.external_assessment_count
              ? lessonData.external_assessment_count
              : 0;
            let collectionCount = lessonData.collection_count
              ? lessonData.collection_count
              : 0;
            let externalCollectionCount = lessonData.external_collection_count
              ? lessonData.external_collection_count
              : 0;
            let lessonEtlSeconds = lessonData.author_etl_secs
              ? lessonData.author_etl_secs
              : 0;
            const lessonEtlHoursMin = serializeEtlSec(lessonEtlSeconds);
            return Lesson.create(Ember.getOwner(serializer).ownerInjection(), {
              assessmentCount: assessmentCount + externalAssessmentCount,
              collectionCount: collectionCount + externalCollectionCount,
              id: lessonData.lesson_id,
              sequence: lessonData.sequence_id,
              title: lessonData.title,
              author_etl_secs: lessonEtlSeconds,
              gutCode: lessonData.aggregated_gut_codes,
              guidingQuestions: lessonData.guiding_questions,
              description: lessonData.description,
              etlHrs:
                lessonEtlHoursMin.etlHours === '0 hr'
                  ? ''
                  : lessonEtlHoursMin.etlHours,
              etlMins:
                lessonEtlHoursMin.etlMinutes === '0 min'
                  ? ''
                  : lessonEtlHoursMin.etlMinutes,
              unit_id: payload.unit_id
            });
          });
        }
        return lessons;
      })(),
      bigIdeas: payload.big_ideas,
      essentialQuestions: payload.essential_questions,
      id: payload.unit_id,
      lessonCount:
        payload.lesson_summary && Ember.isArray(payload.lesson_summary)
          ? payload.lesson_summary.length
          : payload.lesson_count
            ? payload.lesson_count
            : 0,
      sequence: payload.sequence_id,
      title: payload.title,
      taxonomy: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyObject(payload.taxonomy, TAXONOMY_LEVELS.DOMAIN),
      author_etl_secs: payload.author_etl_secs,
      expectedhours: etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
      expectedminutes:
        etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes,
      computedHours:
        computedEtlSec.etlHours === '0 hr' ? '' : computedEtlSec.etlHours,
      computedMinutes:
        computedEtlSec.etlMinutes === '0 min' ? '' : computedEtlSec.etlMinutes
    });
  },
  normalizeUnits: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      let unitUiSequence = 1;
      return payload.map(function(unit) {
        let sunit = serializer.normalizeUnit(unit);
        sunit.set('ui_sequence', unitUiSequence);
        unitUiSequence++;
        return sunit;
      });
    } else {
      return [];
    }
  },

  /**
   * Serialize reorder unit
   * @param {string[]} lessonIds
   */
  serializeReorderUnit: function(lessonIds) {
    const values = lessonIds.map(function(id, index) {
      return {
        id: id,
        sequence_id: index + 1
      };
    });

    return {
      order: values
    };
  }
});
