import Ember from 'ember';
import { getWpmIcon } from 'gooru-web/utils/utils';
import TenantSettingsMixin from '../tenant-settings-mixin';

export default Ember.Mixin.create(TenantSettingsMixin, {
  courseService: Ember.inject.service('api-sdk/course'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  fetchReadingContent() {
    const component = this;
    const classId = component.get('class.id');
    const collectionId = component.get('collections.id');
    const sourceType = 'LJ';
    const courseService = component.get('courseService');
    const childrens =
      component.get('collections.children') ||
      component.get('collections.resources');
    const questionsList = childrens.filter(
      question =>
        ['SERP_WPM', 'serp_words_per_minute'].indexOf(question.type) !== -1
    );

    const params = {
      classId,
      collectionId,
      source: sourceType
    };
    const wpmReadPromise = Ember.RSVP.hash({
      readContexts: courseService.getReadActivity(params),
      notLinkedActivity: courseService.NotLinkedActivity(params)
    });

    wpmReadPromise.then(({ readContexts, notLinkedActivity }) => {
      const wpmFlag = readContexts.wpm_flags || [];
      const notLinked = notLinkedActivity.wpm_flags || [];
      const readContextItems = [...wpmFlag, ...notLinked];
      component.set('readContexts', readContextItems);
      component.getActiveQuestion(readContextItems, questionsList);
    });
  },

  getActiveQuestion(readContexts, questions) {
    const component = this;
    const profileId = component.get('profile.id');
    if (questions) {
      questions.forEach(question => {
        const questionId = question.id;
        const metadata = question.metadata;
        const hasLinkContent = !!(metadata && metadata.linked_content);
        const activeContext = readContexts.find(item => {
          return (
            [
              item.question_id,
              item.second_read_question_id,
              item.first_read_question_id
            ].indexOf(questionId) !== -1
          );
        });
        let activeStudent = activeContext
          ? component.getStudentReadCount(
            hasLinkContent,
            activeContext,
            profileId
          )
          : null;
        question.setProperties({
          wpmResource: activeStudent,
          hasLinkContent
        });
      });
    }
  },

  getStudentReadCount(hasLinkContent, wpmDetails, studentId) {
    const component = this;
    const activeStudent = wpmDetails.students.find(
      student => student.user_id === studentId
    );
    const wpmKey = component.get('wpmKey');
    const rangetext = (count, val) => getWpmIcon(count, val);
    if (hasLinkContent) {
      activeStudent.firstRangeText = rangetext(
        activeStudent.first_read_wpm_count,
        wpmKey
      );
      activeStudent.secondRangeText = rangetext(
        activeStudent.second_read_wpm_count,
        wpmKey
      );
    } else {
      activeStudent.countRangeText = rangetext(activeStudent.wpm_count, wpmKey);
    }
    return activeStudent;
  }
});
