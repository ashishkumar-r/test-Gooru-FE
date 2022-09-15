import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import Rubric from 'gooru-web/models/rubric/rubric';
import { RUBRIC_OFF_OPTIONS } from 'gooru-web/config/config';

export default Ember.Component.extend(ModalMixin, {
  /**
   * @property {Service} rubric service
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @property {Ember.Service} Service to do retrieve language
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  isAddRubric: false,

  teacherRubrics: Ember.A(),

  studentRubrics: Ember.A(),

  actions: {
    /**
     * Action to save maxScore
     */
    updateContent: function() {
      this.get('updateContent')(this.get('tempModel'));
    },

    updateQuantity(val) {
      val = parseInt(val);
      if (val >= 0) {
        this.set('tempModel.maxScore', val);
        this.send('updateContent');
      } else {
        this.set('tempModel.maxScore', 0);
      }
    },

    inputTyping(val) {
      val = parseInt(val);
      if (val >= 0) {
        this.set('tempModel.maxScore', val);
      } else {
        this.set('tempModel.maxScore', 0);
      }
    },

    cancelChanges: function() {
      let maxScore = this.get('activityModel').maxScore;
      this.set('tempModel.maxScore', maxScore);
    },
    /**
     * Show modal with rubrics to choose one and associate it to the OA
     */
    showAddRubricModal: function(rubricsFor) {
      let component = this;
      const userId = component.get('session.userId');

      return component
        .get('rubricService')
        .getUserRubrics(userId)
        .then(function(rubrics) {
          return {
            oaId: component.get('tempModel.id'),
            userId,
            rubrics,
            rubricsFor: rubricsFor,
            callback: {
              success: function(oaRubric) {
                if (rubricsFor === 'teacher') {
                  component.teacherSuccessRubricCB(oaRubric);
                } else {
                  component.studentSuccessRubricCB(oaRubric);
                }
              }
            }
          };
        })
        .then(model =>
          component.send(
            'showModal',
            'content.modals.gru-add-rubric-to-oa',
            model,
            null,
            null
          )
        );
    },

    /**
     * Action after selecting an option for maximum points
     */
    onMaxScoreChange: function(newValue) {
      this.set('tempModel.maxScore', parseInt(newValue));
    },
    /**
     * Route to Rubric  edit with backurl in query params.
     */
    rubricEdit: function(rubricsId) {
      let queryParams = {
        backUrl: this.get('router.url')
      };
      this.get('router').transitionTo('content.rubric.edit', rubricsId, {
        queryParams
      });
    },

    updateLanguage: function(language) {
      this.set('tempModel.primaryLanguage', language.id);
      this.set('selectedLanguage', language);
      this.send('updateContent');
    },

    /**
     * Disassociates the rubric from the question
     */
    removeRubric: function(associatedRubric, isTeacher) {
      let component = this;
      let tempModel = component.get('tempModel');
      component
        .get('rubricService')
        .deleteRubric(associatedRubric.id)
        .then(function() {
          if (isTeacher) {
            let teachRubric = component
              .get('tempModel.rubric')
              .filter(item => item.grader === 'Teacher');
            component.get('tempModel.rubric').removeObjects(teachRubric);
            component.set('teacherRubrics', null);
          } else {
            let studentRubric = component
              .get('tempModel.rubric')
              .filter(item => item.grader === 'Self');
            component.get('tempModel.rubric').removeObjects(studentRubric);
            component.set('studentRubrics', null);
          }
          if (tempModel && tempModel.rubric && tempModel.length === 0) {
            component.set('isAddRubric', false);
          }
        });
    },

    /**
     * Route to Rubric Question edit with backurl in query params.
     */
    rubricQuestionEdit: function(rubricsId) {
      let queryParams = {
        backUrl: this.get('router.url'),
        primaryLanguage: this.get('course.primaryLanguage')
      };
      this.get('router').transitionTo('content.rubric.edit', rubricsId, {
        queryParams
      });
    }
  },

  teacherSuccessRubricCB(oaRubric) {
    const component = this;
    if (component.get('teacherRubrics')) {
      component.get('teacherRubrics').set('title', oaRubric.SourceRubric.title);
      component.get('teacherRubrics').set('id', oaRubric.NewRubricId);
    } else {
      let teacherRubric = Rubric.create(
        Ember.getOwner(component).ownerInjection(),
        {
          title: oaRubric.SourceRubric.title,
          id: oaRubric.NewRubricId,
          grader: 'Teacher'
        }
      );

      let studentRubric = component.get('studentRubrics');
      let rubric;
      if (studentRubric) {
        rubric = Ember.A([teacherRubric, studentRubric]);
      } else {
        rubric = Ember.A([teacherRubric]);
      }
      component.set('tempModel.rubric', rubric);
      component.teacherRubricList();
    }
  },

  studentSuccessRubricCB(oaRubric) {
    const component = this;
    if (component.get('studentRubrics')) {
      component.get('studentRubrics').set('title', oaRubric.SourceRubric.title);
      component.get('studentRubrics').set('id', oaRubric.NewRubricId);
    } else {
      let studentRubric = Rubric.create(
        Ember.getOwner(component).ownerInjection(),
        {
          title: oaRubric.SourceRubric.title,
          id: oaRubric.NewRubricId,
          grader: 'Self'
        }
      );

      let teacherRubric = component.get('teacherRubrics');
      let rubric;
      if (teacherRubric) {
        rubric = Ember.A([teacherRubric, studentRubric]);
      } else {
        rubric = Ember.A([studentRubric]);
      }
      component.set('tempModel.rubric', rubric);
      component.studentRubricList();
    }
  },

  teacherRubricList: function() {
    var component = this;
    if (
      component.get('tempModel.rubric') &&
      component.get('tempModel.rubric').findBy('grader', 'Teacher')
    ) {
      let teachRubric = component
        .get('tempModel.rubric')
        .findBy('grader', 'Teacher');
      component.set('teacherRubrics', teachRubric);
    }
  },

  studentRubricList: function() {
    var component = this;
    if (
      component.get('tempModel.rubric') &&
      component.get('tempModel.rubric').findBy('grader', 'Self')
    ) {
      let studentRubric = component
        .get('tempModel.rubric')
        .findBy('grader', 'Self');
      component.set('studentRubrics', studentRubric);
    }
  },

  /**
   * Toggle Options for the Advanced Edit button
   * @property {Ember.Array}
   */
  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.yes',
      value: true
    }),
    Ember.Object.create({
      label: 'common.no',
      value: false
    })
  ]),

  // -------------------------------------------------------------------------
  // Events
  init: function() {
    var component = this;
    component._super(...arguments);
    component.fetchLanguage();
    if (
      component.get('tempModel.rubric') &&
      this.get('tempModel.rubric').length
    ) {
      this.set('isAddRubric', true);
    }
    component.teacherRubricList();
    component.studentRubricList();
  },

  fetchLanguage() {
    const controller = this;
    controller
      .get('lookupService')
      .getLanguages()
      .then(function(languages) {
        let languageLists = languages.filter(
          language => language.id === controller.get('course.primaryLanguage')
        );
        controller.set(
          'selectedLanguage',
          languageLists && languageLists.length ? languageLists[0] : null
        );
        controller.set('languageList', languages);
      });
  },

  /**
   * Options for maximum points
   * @property {Array}
   */
  maximumOptions: Ember.computed(function() {
    let options = [];
    for (let i = 1; i <= RUBRIC_OFF_OPTIONS.MAX_SCORE; i += 1) {
      options.push({
        id: i,
        name: i
      });
    }
    return options;
  })
});
