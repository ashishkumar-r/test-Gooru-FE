import Ember from 'ember';
import {
  DEFAULT_IMAGES,
  CONTENT_TYPES,
  PATH_TYPE
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Object.extend(ConfigurationMixin, {
  /**
   * @return {Array} Unit0 content list items
   **/
  normalizeUnit0(payload) {
    const unit0Content = payload.unit0 ? payload.unit0 : [];
    const results = Ember.A([]);
    unit0Content.forEach(unit => {
      const unitContent = {
        milestone_id: unit.milestone_id,
        milestoneSequence: unit.unit_sequence,
        milestoneTitle: unit.milestone_title || unit.unit_title,
        isUnit0: true,
        lessons: this.normalizeLessonUnit0(unit),
        children: this.normalizeLessonUnit0(unit),
        id: unit.unit_id,
        title: unit.unit_title
      };
      results.pushObject(Ember.Object.create(unitContent));
    });
    return results;
  },

  /**
   * @return {Array} serialize lessons
   **/
  normalizeLessonUnit0(payload) {
    const unitItem = payload || null;
    const lessons = unitItem.lessons || [];
    const lessonsItem = Ember.A([]);
    lessons.forEach((lesson, index) => {
      const lessonObj = {
        lesson_id: lesson.lesson_id,
        id: lesson.lesson_id,
        lessonSequence: index,
        lesson_title: lesson.lesson_title,
        tx_domain_name: unitItem.unit_title,
        title: lesson.lesson_title,
        unit_id: unitItem.unit_id,
        unitTitle: unitItem.unit_title,
        unitSequence: unitItem.unit_sequence,
        collections: this.normalizeCollections(lesson),
        children: this.normalizeCollections(lesson),
        gutCodes: null,
        assessmentCount: lesson.assessment_count || 0,
        collectionCount: lesson.collection_count || 0
      };
      lessonsItem.pushObject(Ember.Object.create(lessonObj));
    });
    return lessonsItem;
  },

  /**
   * @return {Array} serialize collections
   **/
  normalizeCollections(payload) {
    const collections = payload.collections || [];
    const results = Ember.A([]);
    const appRootPath = this.get('appRootPath');
    collections.forEach(collection => {
      const defaultImage = collection.collection_type.includes(
        CONTENT_TYPES.COLLECTION
      )
        ? DEFAULT_IMAGES.COLLECTION
        : DEFAULT_IMAGES.ASSESSMENT;
      const thumbnailUrl = appRootPath + defaultImage;

      const collectionResponse = Ember.Object.create({
        id: collection.collection_id,
        collectionSequence: collection.collectionSequence,
        format: collection.collection_type,
        pathId: collection.path_id || 0,
        ctxPathType: PATH_TYPE.UNIT0,
        pathType: PATH_TYPE.UNIT0,
        title: collection.collection_title,
        isCollection: collection.collection_type.includes(
          CONTENT_TYPES.COLLECTION
        ),
        thumbnailUrl,
        visible: true,
        gutCode: null,
        resourceCount: collection.resource_count || 0,
        questionCount: collection.question_count || 0,
        oeQuestionCount: collection.oe_question_count || 0
      });
      results.push(collectionResponse);
    });
    return results;
  }
});
