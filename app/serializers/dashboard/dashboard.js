import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { DEFAULT_IMAGES, DIAGNOSTIC_LEVELS } from 'gooru-web/config/config';
import ClassActivitySerializer from 'gooru-web/serializers/content/class-activity';
import { QUESTION_CONFIG } from 'gooru-web/config/question';

export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  i18n: Ember.inject.service(),

  /**
   * @property {ClassActivitySerializer} classActivitySerializer
   */
  classActivitySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'classActivitySerializer',
      ClassActivitySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  normalizePerformanceStats(payload) {
    const data = payload.data ? payload.data : [];
    const results = Ember.A();
    data.forEach(item => {
      let performance = Ember.Object.create({
        assessmentTimespent: item.assessment_timespent || 0,
        caTimespent: item.ca_timespent || 0,
        classId: item.class_id,
        collectionTimespent: item.collection_timespent || 0,
        destinationETA: item.destination_eta || 0,
        ljTimespent: item.lj_timespent || 0,
        totalTimespent: item.total_timespent || 0
      });
      results.pushObject(performance);
    });
    return results;
  },

  normalizeLessonStats(payload) {
    const lessons = payload.data ? payload.data : [];
    const results = Ember.A([]);
    lessons.forEach(lesson => {
      let item = Ember.Object.create({
        classId: lesson.class_id,
        totalLessons: lesson.total_lessons || 0,
        completedLessons: lesson.completed_lessons || 0
      });
      results.pushObject(item);
    });
    return results;
  },

  normalizeSuggestionStats(payload) {
    const suggestions = payload.data ? payload.data : [];
    const results = Ember.A([]);
    suggestions.forEach(suggestion => {
      let item = Ember.Object.create({
        classId: suggestion.class_id,
        acceptedSuggestions: suggestion.accepted_suggestions || 0,
        totalSuggestions: suggestion.total_suggestions || 0
      });
      results.pushObject(item);
    });
    return results;
  },

  normalizeMasteredStats(payload) {
    const masteredStats = payload.data ? payload.data : [];
    const results = Ember.A([]);
    masteredStats.forEach(mastered => {
      let item = Ember.Object.create({
        classId: mastered.class_id,
        totalMastered: mastered.comp_scored_more_than_90 || 0
      });
      results.pushObject(item);
    });
    return results;
  },

  normalizeStreakStats(payload) {
    const streakStats = payload.data ? payload.data : [];
    const results = Ember.A([]);
    streakStats.forEach(streak => {
      let item = Ember.Object.create({
        classId: streak.class_id,
        streakCompetencies: streak.streak_competencies || 0
      });
      results.pushObject(item);
    });
    return results;
  },

  normalizeMilestoneStats(payload) {
    const milestones = payload.milestones ? payload.milestones : [];
    const results = Ember.A();
    milestones.forEach((milestone, index) => {
      let milestoneData = {
        milestoneId: milestone.milestone_id,
        gradeId: milestone.grade_id,
        gradeName: milestone.grade_name,
        gradeSeq: milestone.grade_seq,
        domainCount: milestone.domain_count,
        topicCount: milestone.topic_count,
        competencyCount: milestone.competency_count,
        students: this.normalizeMilestoneStudent(milestone.students),
        title: `${this.get('i18n')
          .t('common.milestone')
          .toString()} ${index + 1}`
      };
      results.pushObject(Ember.Object.create(milestoneData));
    });
    return results;
  },

  normalizeMilestoneStudent(payload) {
    let students = payload ? payload : [];
    const results = Ember.A();
    const basePath = this.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    students.forEach(student => {
      const thumbnailUrl = student.thumbnail
        ? basePath + student.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      let studentData = {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        thumbnailUrl,
        completedCompetencies: student.completed_competencies,
        totalCompetencies: student.total_competencies,
        averageScore: student.average_score,
        highestCompetency: student.highest_competency,
        competencyTitle: student.highest_competency_title
      };
      results.pushObject(Ember.Object.create(studentData));
    });
    return results;
  },

  normalizeDiagnasticStats(payload) {
    const domainsList = payload.domains ? payload.domains : [];
    const results = Ember.A([]);
    domainsList.forEach(domain => {
      let domainData = {
        code: domain.code,
        title: domain.title,
        sequenceId: domain.sequence_id,
        students: this.normalizeDiagnasticStudents(domain.students)
      };
      results.pushObject(domainData);
    });
    return results;
  },

  normalizeDiagnasticStudents(payload) {
    const students = payload ? payload : [];
    const results = Ember.A();
    const basePath = this.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    students.forEach(student => {
      const thumbnailUrl = student.thumbnail
        ? basePath + student.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      let level = -1;
      if (student.level !== null) {
        level = this.get('i18n')
          .t(DIAGNOSTIC_LEVELS[student.level])
          .toString();
      }
      let studentData = {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        startingCompetency: student.starting_competency,
        level,
        thumbnailUrl
      };
      results.pushObject(Ember.Object.create(studentData));
    });
    return results;
  },

  normalizeReminders(payload) {
    const caReminders = payload.ca_reminders ? payload.ca_reminders : null;
    const classContents = caReminders ? caReminders.class_contents : [];
    const pendingCaCount = caReminders ? caReminders.pending_ca_count : 0;
    const results = Ember.A();
    classContents.forEach(content => {
      let parsedContent = this.get(
        'classActivitySerializer'
      ).normalizeClassActivity(content, null);
      results.pushObject(parsedContent);
    });
    return Ember.Object.create({
      results,
      pendingCaCount
    });
  },
  normalizeFetchAssessment(payload) {
    if (payload.diagnostics.length) {
      payload.diagnostics.map(diagItem => {
        const createdDate = moment(diagItem.created_at).format(
          'MMM DD YYYY, h:mm a'
        );
        diagItem.createdDate = createdDate;
        diagItem.questions.map((question, index) => {
          question.questionNumber = index + 1;
        });
        if (diagItem.students) {
          diagItem.students.map(diagStudent => {
            diagStudent.questions = JSON.parse(
              JSON.stringify(diagItem.questions)
            );
            if (diagStudent.questions) {
              diagStudent.questions.forEach(studentQuestion => {
                const isChild = diagStudent.responses.find(value => {
                  return value.question_id === studentQuestion.question_id;
                });
                if (isChild) {
                  isChild.answer.map(ans => {
                    ans.id = window.btoa(encodeURIComponent(ans.text));
                    if (isChild.answer.length > 1) {
                      isChild.userAnswer = isChild.answer;
                    } else {
                      isChild.userAnswer = ans.id;
                    }
                  });
                  const basePath = this.get('session.cdnUrls.user');
                  const qr = {
                    first_name: diagStudent.first_name,
                    last_name: diagStudent.last_name,
                    id: diagStudent.id,
                    thumbnail: diagStudent.thumbnail
                      ? basePath + diagStudent.thumbnail
                      : null,
                    response: isChild
                  };
                  studentQuestion.children = qr;

                  diagItem.questions.map(qsn => {
                    let config = Object.values(QUESTION_CONFIG).findBy(
                      'apiType',
                      qsn.type
                    );
                    const qsnType = Object.keys(QUESTION_CONFIG).find(
                      key => QUESTION_CONFIG[key] === config
                    );
                    qsn.questionType = qsnType;
                    qsn.answers = this.getAnswerObject(qsn.options);
                    if (qsn.question_id === studentQuestion.question_id) {
                      qsn.status = isChild.attempt_status;
                    }
                  });
                }
                diagStudent.responses.map(res => {
                  if (res.question_id === studentQuestion.question_id) {
                    studentQuestion.status = res.attempt_status;
                    res.answer.map(ans => {
                      studentQuestion.options.map(crtAns => {
                        if (crtAns.answer_text === ans.text) {
                          crtAns.isshowAnswer = ans.status;
                        }
                      });
                    });
                  }
                });
              });
            }
          });
        }
      });
    }
    return payload.diagnostics;
  },
  getAnswerObject(options) {
    const resultData = Ember.A([]);
    if (options) {
      options.map(item => {
        item.id = window.btoa(encodeURIComponent(item.answer_text));
        item.answerId = item.id;
        item.text = item.answer_text;
        item.isCorrect = item.is_correct === 1;

        resultData.pushObject(Ember.Object.create(item));
      });
    }
    return resultData;
  }
});
