import Ember from 'ember';
import BuilderMixin from 'gooru-web/mixins/content/builder';
import {
  CONTENT_TYPES,
  RUBRIC_OFF_OPTIONS,
  ROLES,
  SERP_ENCODING_QUESTION_TYPE,
  SERP_PREFIX,
  SCIENTIFIC_TYPES
} from 'gooru-web/config/config';
import ModalMixin from 'gooru-web/mixins/modal';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';
import ScientificFillInTheBlank from 'gooru-web/utils/question/scientific-fill-in-the-blank';
import {
  replaceMathExpression,
  removeHtmlTags,
  generateUUID
} from 'gooru-web/utils/utils';
import Rubric from 'gooru-web/models/rubric/rubric';
import Answer from 'gooru-web/models/content/answer';
import { QUESTION_TYPES } from 'gooru-web/config/question';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 * Collection List
 *
 * Component responsible for listing a set of resources/questions
 *
 * @module
 * @augments content/courses/gru-accordion-course
 *
 */
export default Ember.Component.extend(
  BuilderMixin,
  ModalMixin,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @requires service:api-sdk/resource
     */
    resourceService: Ember.inject.service('api-sdk/resource'),

    /**
     * @requires service:api-sdk/question
     */
    questionService: Ember.inject.service('api-sdk/question'),

    /**
     * @requires service:api-sdk/media
     */
    mediaService: Ember.inject.service('api-sdk/media'),

    /**
     * @property {Service} profile service
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @property {Service} rubric service
     */
    rubricService: Ember.inject.service('api-sdk/rubric'),

    /**
     * @requires service:notifications
     */
    notifications: Ember.inject.service(),

    /**
     * @requires service:i18n
     */
    i18n: Ember.inject.service(),

    /**
     * @property {Service} session
     */
    session: Ember.inject.service('session'),

    /**
     * @property {Boolean} isStudent
     */
    isStudent: Ember.computed.equal('session.role', ROLES.STUDENT),

    strugglingCompetencyService: Ember.inject.service(
      'api-sdk/struggling-competency'
    ),
    /**
     * @property answerDetails
     */
    answerDetails: Ember.computed('model', function() {
      const component = this;
      if (component.get('model.answerDetails')) {
        let answerResult = component.get('model.answerDetails');
        return answerResult.map(function(choice) {
          let data = Ember.Object.create({
            answer_text: choice.answer_text,
            answer_category: choice.answer_category,
            answer_type: 'text',
            correct_answer: ''
          });

          if (
            choice.answer_text.indexOf('[]') !== -1 &&
            choice.correct_answer.length > 0
          ) {
            let answerText = choice.answer_text.split('[]');
            let correctAnswer = choice.correct_answer;
            let values = '';
            answerText.forEach(function(item, index) {
              if (correctAnswer[index]) {
                values += `${item}[${correctAnswer[index]}]`;
              }
            });

            data.set('answer_text', values);
          }

          return data;
        });
      } else {
        let array = Ember.A(Object.values(SCIENTIFIC_TYPES));
        return array.map(function(choice) {
          let data = Ember.Object.create({
            answer_text: 'enter question with [answer]',
            answer_type: 'text',
            correct_answer: '',
            answer_category: choice
          });

          return data;
        });
      }
    }),

    hintExplanationDetail: Ember.computed('model', function() {
      let hintDetails = this.get('model.hints');
      let hintData = Object.values(SCIENTIFIC_TYPES);
      let hintList = Ember.A([]);
      if (!Array.isArray(hintDetails)) {
        hintData.map(function(choice) {
          let data = Ember.Object.create({
            answer_category: choice,
            hints: hintDetails ? hintDetails[`${choice}_explanation`] : ''
          });
          hintList.pushObject(data);
        });
      } else {
        hintList = hintDetails;
      }
      return hintList;
    }),

    answerFreeResDetails: Ember.computed('question', function() {
      if (this.get('question.answerDetails')) {
        return this.get('question.answerDetails');
      } else {
        let array = Ember.A(Object.values(SCIENTIFIC_TYPES));
        return array.map(function(choice) {
          let data = Ember.Object.create({
            answer_type: 'text',
            answer_category: choice
          });
          return data;
        });
      }
    }),

    /**
     * @property {Boolean} isExemplarView
     */
    isExemplarView: false,

    /**
     * @property {Boolean} isSERPType
     */
    isSERPType: false,
    /**
     * @property {Boolean} isPause
     */
    isPause: false,
    /*
     * Hold the audio details
     */
    audioRecorder: null,

    isAudioUploadFail: false,

    selectedStruggle: Ember.A(),

    isComprehension: false,

    disableExemplar: Ember.computed('model', function() {
      let question = this.get('model');
      let types = ['SERP_VT', 'SERP_CS', 'SERP_IB'];
      return types.indexOf(question.type) !== -1;
    }),

    /**
     * @property {Object} baseQuestion it has comprehension question details
     */
    baseQuestion: null,

    isH5PContent: Ember.computed('model', function() {
      return this.get('model.type') === 'H5P_DAD';
    }),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      onShowPartialScore: function(isChecked) {
        if (isChecked) {
          this.set('tempModel.isPartialEnable', isChecked);
        } else {
          this.set('tempModel.isPartialEnable', isChecked);
        }
      },

      onShowEvidence: function(isChecked) {
        if (isChecked) {
          this.set('tempModel.isEvidenceEnabled', isChecked);
        } else {
          this.set('tempModel.isEvidenceEnabled', isChecked);
        }
      },

      onShowScore: function(isChecked) {
        if (isChecked) {
          this.set('tempModel.isScoreEnabled', isChecked);
        } else {
          this.set('tempModel.isScoreEnabled', isChecked);
        }
      },

      exemplarView: function() {
        this.set('isExemplarView', !this.isExemplarView);
      },
      /**
       * Remove selected collection item
       */
      deleteItem: function(builderItem) {
        let component = this;
        const collection = component.get('collection');
        var model = {
          content: builderItem,
          index: this.get('index'),
          parentName: this.get('collection.title'),
          callback: {
            success: function() {
              component.get('onRemoveCollectionItem')(builderItem);
            }
          }
        };
        var collectionItem = null;
        if (builderItem.get('format') === 'question') {
          collectionItem = {
            deleteMethod: function() {
              return this.get('questionService').deleteQuestion(
                this.get('model.id'),
                collection
              );
            }.bind(this),
            type: CONTENT_TYPES.QUESTION
          };
          this.actions.showModal.call(
            this,
            'content.modals.gru-quick-delete-content',
            $.extend(model, collectionItem),
            null,
            null,
            null,
            false
          );
        } else {
          collectionItem = {
            removeMethod: function() {
              return this.get('resourceService').deleteResource(
                this.get('model.id'),
                collection
              );
            }.bind(this),
            type: CONTENT_TYPES.RESOURCE
          };
          this.actions.showModal.call(
            this,
            'content.modals.gru-quick-remove-content',
            $.extend(model, collectionItem),
            null,
            null,
            null,
            false
          );
        }
      },
      copyTo: function(builderItem) {
        const component = this;
        if (
          component.get('collection').metadata &&
          component.get('collection').metadata.fluency
        ) {
          if (builderItem.metadata) {
            builderItem.set(
              'metadata.fluency',
              component.get('collection').metadata.fluency
            );
          } else {
            builderItem.metadata = component.get('collection').metadata;
          }
        }
        if (component.get('session.isAnonymous')) {
          component.send('showModal', 'content.modals.gru-login-prompt');
        } else {
          let assessmentsPromise = Ember.RSVP.resolve(null);
          if (builderItem.format === 'question') {
            assessmentsPromise = component
              .get('profileService')
              .readAssessments(component.get('session.userId'));
          }
          assessmentsPromise
            .then(function(assessments) {
              return component
                .get('profileService')
                .readCollections(component.get('session.userId'))
                .then(function(collections) {
                  return {
                    content: builderItem,
                    collections,
                    assessments
                  };
                });
            })
            .then(model =>
              component.send(
                'showModal',
                'content.modals.gru-add-to-collection',
                model,
                null,
                'add-to'
              )
            );
        }
      },

      /**
       * Route to Rubric Question edit with backurl in query params.
       */
      rubricQuestionEdit: function() {
        let queryParams = {
          backUrl: this.get('router.url')
        };
        this.get('router').transitionTo(
          'content.rubric.edit',
          this.get('tempModel.rubric.id'),
          {
            queryParams
          }
        );
      },

      /**
       * Route to edit with correct query params.
       */
      edit: function(item) {
        const component = this;
        if (item.get('format') !== 'question') {
          component.send('updateItem', item);
        }
        const route =
          item.get('format') === 'question'
            ? 'content.questions.edit'
            : 'content.resources.edit';
        const queryParams = {
          queryParams: {
            collectionId: component.get('collection.id'),
            isCollection: component.get('isCollection'),
            primaryLanguage: this.get('course.primaryLanguage')
          }
        };
        if (this.get('isPreviewReferrer')) {
          queryParams.queryParams.isPreviewReferrer = this.get(
            'isPreviewReferrer'
          );
        }
        if (item.get('format') !== 'question') {
          queryParams.queryParams.hasCollaborator = this.get('hasCollaborator');
        }
        component
          .get('router')
          .transitionTo(route, item.get('id'), queryParams);
      },

      copy: function(builderItem) {
        var model = {
          content: this.get('model'),
          collectionId: this.get('collection.id'),
          isCollection: this.get('isCollection'),
          onRemixSuccess: this.get('onRemixCollectionItem'),
          collection: this.get('collection')
        };
        if (builderItem.get('format') === 'question') {
          this.send('showModal', 'content.modals.gru-question-remix', model);
        } else {
          this.send('showModal', 'content.modals.gru-resource-remix', model);
        }
      },

      showStandards: function(availableStandards) {
        var standards = Ember.A([]);
        availableStandards.forEach(function(standardObj) {
          standards.push(standardObj.code);
        });

        this.set('key', standards);

        var component = this;
        component.$().popover({
          animation: false,
          placement: component.get('placement'),
          html: true,
          template: component.get('getTemplate')(),
          content: function() {
            return component.get('template');
          }
        });
      },

      editNarration: function() {
        var modelForEditing = this.get('model').copy();

        this.setProperties({
          tempModel: modelForEditing,
          isPanelExpanded: true,
          isEditingNarration: true
        });
      },

      editInline: function() {
        this.showInlinePanel();
      },

      updateItem: function(builderItem) {
        let component = this;
        let attachment = this.get('references');
        this.set('tempModel.exemplar_docs', attachment);
        var editedModel = this.get('tempModel');
        var commonModel = this.get('model');
        const collection = component.get('collection');
        if (commonModel.type === 'SERP_SO') {
          commonModel.hardText = editedModel.hardText;
          commonModel.softText = editedModel.softText;
        }
        if (editedModel.get('type') === 'SERP_CL') {
          let selectedAns = this.get('tempModel.answers').map(ans => {
            if (ans.correctAnswer.length === 0) {
              ans.set('isShowErrorMsg', true);
            }
            return ans.correctAnswer.length;
          });
          if (selectedAns.includes(0)) {
            return;
          }
        }
        if (editedModel.get('type') === SERP_ENCODING_QUESTION_TYPE) {
          component.set('isAudioUploadFail', false);
          let result = editedModel
            .get('answers')
            .filter(data => data.isRecorded);
          let promiseArray = result.map(data => {
            if (!component.get('isAudioUploadFail')) {
              return new Promise(resolve => {
                return component.uploadSelectedFile(data).then(
                  () => {
                    resolve();
                  },
                  function() {
                    component.set('isAudioUploadFail', true);
                    return;
                  }
                );
              });
            }
          });
          if (!component.get('isAudioUploadFail')) {
            Promise.all(promiseArray).then(function() {
              component.questionUpdate(editedModel, collection, builderItem);
              component.set('isAudioUploadFail', false);
            });
          } else {
            return;
          }
        } else if (
          editedModel.get('type') === QUESTION_TYPES.decodingAssessment
        ) {
          component.set('isAudioUploadFail', false);
          if (
            editedModel.get('rubric.rubricOn') &&
            !editedModel.get('rubric.title')
          ) {
            component.set('rubricError', true);
            return;
          }
          const qExemplars = [];
          let audioUrlPromises = component
            .get('references')
            .map(serpExemplar => {
              if (serpExemplar !== null) {
                return new Promise(resolve => {
                  if (
                    serpExemplar.blob &&
                    !component.get('isAudioUploadFail')
                  ) {
                    return component
                      .get('mediaService')
                      .uploadContentFile(serpExemplar.blob, true)
                      .then(fileUrl => {
                        if (fileUrl) {
                          qExemplars.push({
                            audio_url: fileUrl,
                            audio_text: serpExemplar.audio_text
                          });
                          return resolve(serpExemplar);
                        } else {
                          component.set('isAudioUploadFail', true);
                          return;
                        }
                      });
                  } else {
                    qExemplars.push({
                      audio_url: serpExemplar.audio_url,
                      audio_text: serpExemplar.audio_text
                    });
                    return resolve(serpExemplar);
                  }
                });
              }
            });
          if (!component.set('isAudioUploadFail')) {
            Promise.all(audioUrlPromises).then(() => {
              let exemplarResult = [];
              if (qExemplars.length) {
                editedModel.answers.map(data => {
                  var value = qExemplars.findBy('audio_text', data.text);
                  exemplarResult.push(value);
                });
              }
              editedModel.set('exemplar_docs', exemplarResult);
              component.questionUpdate(editedModel, collection, builderItem);
              component.set('isAudioUploadFail', false);
            });
          } else {
            return;
          }
        } else if (editedModel.get('type') === QUESTION_TYPES.sayOutLoud) {
          component.set('isExemplaravail', false);
          if (
            editedModel.get('rubric.rubricOn') &&
            !editedModel.get('rubric.title')
          ) {
            component.set('rubricError', true);
            return;
          }
          for (
            let index = 0;
            index < editedModel.get('exemplar_docs').length;
            index++
          ) {
            const element = editedModel.get('exemplar_docs')[index];
            if (!element.audio_url) {
              component.set('isExemplaravail', true);
              break;
            }
          }
          if (component.get('isExemplaravail')) {
            return;
          }
          if (!component.set('isAudioUploadFail')) {
            component.questionUpdate(editedModel, collection, builderItem);
            component.set('isAudioUploadFail', false);
          } else {
            return;
          }
        } else if (editedModel.get('type') === QUESTION_TYPES.identifyDigraph) {
          component.set('isAudioUploadFail', false);
          if (
            editedModel.get('rubric.rubricOn') &&
            !editedModel.get('rubric.title')
          ) {
            component.set('rubricError', true);
            return;
          }
          let audioUrlPromises = [];
          var Exemplaranswer = [];
          for (
            let index = 0;
            index < editedModel.get('answers').length;
            index++
          ) {
            const element = editedModel.get('answers')[index];
            if (!element.correctAnswer.length) {
              component.set('emptyUnderline', true);
              break;
            }
          }
          if (component.get('emptyUnderline')) {
            return null;
          }
          var exemplarLength = component.get('references').length;
          if (!exemplarLength || exemplarLength) {
            if (exemplarLength !== editedModel.answers.length) {
              component.set('exemplarError', true);
              return;
            }
          }

          component.get('references').map(underLineAns => {
            let correctanswer = [];
            Exemplaranswer.push({
              answer_text: underLineAns.answer_text,
              correct_answer: correctanswer
            });
            underLineAns = Ember.Object.create(underLineAns);
            return underLineAns.correct_answer.map(answerlist => {
              if (
                answerlist.isRecorded &&
                !component.set('isAudioUploadFail')
              ) {
                audioUrlPromises.push(
                  new Promise(resolve => {
                    return component
                      .get('mediaService')
                      .uploadContentFile(answerlist.audio.audioBlob, true)
                      .then(fileUrl => {
                        if (fileUrl) {
                          correctanswer.push({
                            audio_file_url: fileUrl,
                            text: answerlist.text,
                            seq: answerlist.seq
                          });
                          return resolve(underLineAns);
                        } else {
                          component.set('isAudioUploadFail', true);
                          return;
                        }
                      });
                  })
                );
              } else {
                correctanswer.push({
                  audio_file_url: answerlist.audio_file_url,
                  text: answerlist.text,
                  seq: answerlist.seq
                });
              }
            });
          });
          if (!component.set('isAudioUploadFail')) {
            Promise.all(audioUrlPromises).then(() => {
              Exemplaranswer.map(result => {
                result.correct_answer = result.correct_answer.sortBy('seq');
              });
              editedModel.set('exemplar_docs', Exemplaranswer);
              component.questionUpdate(editedModel, collection, builderItem);
              component.set('isAudioUploadFail', false);
            });
          } else {
            return;
          }
        } else {
          component.questionUpdate(editedModel, collection, builderItem);
        }
        this.set('isExemplarView', false);
      },

      cancel: function() {
        this.setProperties({
          isPanelExpanded: false,
          isEditingInline: false,
          isEditingNarration: false,
          editImagePicker: false,
          isAudioUploadFail: false
        });
        this.set('isExemplarView', false);
        this.get('references').map(firstResult => {
          let textType = '';
          let questionType = this.get('tempModel').type;
          if (questionType === QUESTION_TYPES.sayOutLoud) {
            if (firstResult) {
              textType = firstResult.audio_text;
            }
          } else if (questionType === QUESTION_TYPES.decodingAssessment) {
            textType = firstResult.audio_text;
            if (firstResult.blob) {
              this.get('references').removeObject(firstResult);
            }
          } else if (questionType === QUESTION_TYPES.identifyDigraph) {
            textType = firstResult.answer_text;
            if (firstResult.correct_answer[0].audio) {
              this.get('references').removeObject(firstResult);
            }
          } else {
            textType = firstResult.answer_text;
          }
          var removeText = this.get('tempModel').answers.findBy(
            'text',
            textType
          );
          if (!removeText) {
            this.get('references').removeObject(firstResult);
          }
        });
      },

      toggleImagePicker: function() {
        this.set('editImagePicker', true);
      },

      onShowAdvancedEditor: function(isChecked) {
        if (isChecked) {
          this.set('showAdvancedEditor', true);
        }
      },

      focusQuestionTextEditor: function() {
        this.scrollToFirstEditor();
      },

      /**
       * Action after selecting an option for maximum points
       */
      onMaxScoreChange: function(newValue) {
        this.set('tempModel.rubric.maxScore', parseInt(newValue));
      },

      /**
       * Action after selecting an option for increment
       */
      onIncrementChange: function(newValue) {
        this.set('tempModel.rubric.increment', parseFloat(newValue));
      },

      /**
       * Updates rubric to display the information of the associated rubric
       */
      updateAssociatedRubric: function(rubric) {
        this.set('model.rubric', rubric);

        let tempModel = this.get('tempModel');
        tempModel.set('rubric', rubric.copy());
      },

      /**
       * Disassociates the rubric from the question
       */
      removeRubric: function(associatedRubricId) {
        let component = this;
        let tempModel = component.get('tempModel');
        let rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
          increment: 0.5,
          maxScore: 1
        });

        component
          .get('rubricService')
          .deleteRubric(associatedRubricId)
          .then(function() {
            component.set('model.rubric', null);
            tempModel.set('rubric', rubric);

            component.setProperties({
              isPanelExpanded: true,
              isEditingInline: true,
              isEditingNarration: false,
              editImagePicker: false
            });
          });
      },

      /**
       * Show modal with rubrics to choose one and associate it to the question
       */
      showAddRubricModal: function() {
        let component = this;
        const userId = component.get('session.userId');
        let baseQuestion = component.get('baseQuestion');
        return component
          .get('rubricService')
          .getUserRubrics(userId)
          .then(function(rubrics) {
            return {
              questionId: component.get('tempModel.id'),
              userId,
              rubrics,
              baseQuestionId: baseQuestion ? baseQuestion.id : null,
              callback: {
                success: function(rubricAssociated) {
                  component.send('updateAssociatedRubric', rubricAssociated);
                }
              }
            };
          })
          .then(model =>
            component.send(
              'showModal',
              'content.modals.gru-add-rubric-to-question',
              model,
              null,
              null
            )
          );
      },

      onRecord(seq) {
        const component = this;
        const recorderInstance = component.get('recorderInstances')[seq];
        if (recorderInstance) {
          recorderInstance.stop().then(audio => {
            component
              .$(`.audio-recorder.exemplar-${seq}`)
              .removeClass('recording')
              .addClass('enable');
            const reference = component.get('references')[seq];
            Ember.set(reference, 'audio_url', audio.audioUrl);
            Ember.set(reference, 'blob', audio.audioBlob);
            Ember.set(
              reference,
              'duration',
              (window.performance.now() - recorderInstance.startTime) / 1000
            );
            component.get('references').splice(seq, 1, reference);
          });
          component.get('recorderInstances').splice(seq, 1);
        } else {
          component.recordAudio().then(recorder => {
            component
              .$(`.audio-recorder.exemplar-${seq}`)
              .removeClass('enable')
              .addClass('recording');
            recorder.startTime = window.performance.now();
            component.get('recorderInstances').pushObject(recorder);
            recorder.start();
          });
        }
      },

      onPlayAudio(seq) {
        const component = this;
        let _audio = component.get('audioRecorder');
        let url = component.get('references')[seq].audio_url;
        if (
          !_audio ||
          component.get('answerIndex') !== seq ||
          component.get('playerUrl') !== url
        ) {
          _audio = new Audio(url);
          component.set('answerIndex', seq);
          component.set('playerUrl', url);
        }
        component.set('audioRecorder', _audio);
        _audio.play();
        component.set('isPause', true);
        _audio.ontimeupdate = function() {
          const duration =
            _audio.duration === Infinity
              ? component.get('references')[seq].duration || _audio.duration
              : _audio.duration;
          component
            .$(
              `.decoding-exemplar .exemplar-${seq} .excercise-exemplar .audio-player .audio-progress .progress-filling`
            )
            .css('width', `${(_audio.currentTime / duration) * 100}%`);
        };
        _audio.addEventListener('ended', () => {
          component.set('isPause', false);
        });
      },
      //Action triggered when pause audio
      onPauseAudio() {
        const component = this;
        const audio = component.get('audioRecorder');
        audio.pause();
        component.set('isPause', false);
      },

      onAddExemplar() {
        var text = '';
        if (this.get('tempModel.answers').length > 0) {
          for (
            let index = 0;
            index < this.get('tempModel.answers').length;
            index++
          ) {
            const result = this.get('tempModel.answers')[index];
            var data = this.get('references').findBy('audio_text', result.text);
            if (!data) {
              text = result.text;
              break;
            }
          }
        }
        if (text) {
          this.get('references').pushObject({
            audio_url: null,
            audio_text: removeHtmlTags(text)
          });
        }
      },

      onRemoveExemplar(seq) {
        this.get('references').removeObject(this.get('references')[seq]);
      }
    },

    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['content', 'collections', 'gru-collection-list-item'],

    tagName: 'li',

    key: null,

    attributeBindings: ['data-id'],

    'data-id': Ember.computed.alias('model.id'),

    dataToggle: 'popover',

    placement: 'top',

    exemplarKey: function() {
      return `exemplar-key-${generateUUID()}`;
    }.property(),

    // -------------------------------------------------------------------------
    // Events
    template: Ember.computed('key', function() {
      return `<div class="gru-icon-popover-content">
    <span class='lead'><b>Standards</b></span>
    <p>To adjust, edit collection and or assessment standards</p>
      <p> ${this.get('key')}</p>
   </div>`;
    }),

    // Methods

    getTemplate: function() {
      return `<div class="gru-icon-popover-window popover" role="tooltip">
      <div class="arrow"></div>
      <h3 class="popover-title"></h3>
      <div class="popover-content"></div>
    </div>`;
    },

    willDestroyElement: function() {
      this.$().popover('destroy');
    },
    /**
     * DidInsertElement ember event
     */
    didInsertElement: function() {
      if (
        this.get('model').get('type') &&
        this.get('model')
          .get('type')
          .includes(SERP_PREFIX)
      ) {
        this.set('isSERPType', true);
      }

      this._super(...arguments);
      const component = this;
      var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0;

      if (isTouch) {
        component.$('.actions .item-actions button').tooltip('disable');
      }

      component.setProperties({
        isPanelExpanded: false,
        isEditingInline: false,
        isEditingNarration: false
      });

      if (component.get('model')) {
        const editingContent = component.get('editingContent');
        const editingSubContent = component.get('editingSubContent');
        const modelId = component.get('model.id');

        if (editingContent && modelId && editingContent === modelId) {
          component.showInlinePanel();
        }

        if (editingSubContent && modelId && editingSubContent === modelId) {
          component.showInlinePanel();
        }
      }
      if (
        this.get('model').get('type') === 'MA' ||
        this.get('model').get('type') === 'FIB' ||
        this.get('model').get('type') === 'HS_TXT' ||
        this.get('model').get('type') === 'SERP_IB' ||
        this.get('model').get('type') === 'SERP_EA' ||
        this.get('model').get('type') === 'SERP_VT' ||
        this.get('model').get('type') === 'SERP_CS' ||
        this.get('model').get('type') === 'SERP_SD' ||
        this.get('model').get('type') === 'SERP_SO' ||
        this.get('model').get('type') === 'SERP_CL' ||
        this.get('model').get('type') === 'SERP_IVSA' ||
        this.get('model').get('type') === 'HS_IMG' ||
        this.get('model').get('type') === 'HT_RO' ||
        this.get('model').get('type') === 'MTF'
      ) {
        this.get('model').set('isPartialScore', true);
      } else {
        this.get('model').set('isPartialScore', false);
      }

      let questionEvidenceVisibility = this.get('questionEvidenceVisibility');
      if (questionEvidenceVisibility) {
        let contentSubformat = this.get('model').get('content_subformat');
        let contentSubformatKeyCheck =
          contentSubformat in questionEvidenceVisibility;
        let contentSubformatCheck =
          questionEvidenceVisibility[contentSubformat];
        this.set('contentSubformatKeyCheck', contentSubformatKeyCheck);
        this.set('contentSubformatCheck', contentSubformatCheck);
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    isSerpDa: Ember.computed.equal('model.type', 'SERP_DA'),

    /**
     * If the user wants to edit the image
     * @property {Boolean}
     */
    editImagePicker: false,

    /**
     * If the image picker should be shown
     * @property {Boolean}
     */
    showImagePicker: Ember.computed.or('editImagePicker', 'model.thumbnail'),

    /**
     * @property {Number} remainingStandards - number of standards not displayed
     */
    remainingStandards: Ember.computed('visibleStandards', function() {
      return this.get('model.standards.length') - this.get('visibleStandards');
    }),

    /**
     * @property {Number} visibleStandards - number of standards that will be displayed
     */
    visibleStandards: 1,

    /**
     * @property {Object[]} visibleStandardsList - list of standards that will be displayed
     */
    visibleStandardsList: Ember.computed('visibleStandards', function() {
      var visibleStandards = this.get('visibleStandards');

      return this.get('model.standards').filter(function(item, index) {
        return index < visibleStandards;
      });
    }),

    /**
     * @property {Object[]} allStandardsList - list of all standards that will be displayed
     */
    allVisibleStandardsList: Ember.computed('visibleStandards', function() {
      var availableStandards = this.get('model.standards');
      return availableStandards;
    }),
    /**
     * Course model as instantiated by the route. This is the resource that have the assigned collection
     * @property {Collection}
     */
    collection: null,
    /**
     * @property {Boolean} isCollection - is this a listing for a collection or for an assessment
     */
    isCollection: null,

    /**
     * Copy of the resource/question model used for editing.
     * @property {Resource/Question }
     */
    tempModel: null,

    /**
     * @property {Boolean} isEditingInline
     */
    isEditingInline: false,

    /**
     * @property {Boolean} isEditingNarration
     */
    isEditingNarration: false,

    /**
     * @property {Boolean} isPanelExpanded
     */
    isPanelExpanded: false,

    /**
     * @property {String} Error message to display below the description
     */
    descriptionError: null,

    /**
     * @property {Boolean} Indicates if a Hot spot answer has images
     */
    hasNoImages: false,

    /**
     * @property {Boolean} Indicates if a correct answer is required
     */
    correctAnswerNotSelected: false,

    /**
     * If the advanced editor should be shown
     * @property {Boolean}
     */
    showAdvancedEditor: false,

    /**
     * If a rubric ON is not associated
     * @property {Boolean}
     */
    rubricError: false,

    /**
     * If a Exemplar is not associated for underline
     * @property {Boolean}
     */
    exemplarError: false,

    /**
     * If Answer is not Underline
     * @property {Boolean}
     */
    emptyUnderline: false,
    /**
   * If the advanced edit button should be shown
   @property {Boolean}
   */
    showAdvancedEditButton: Ember.computed(
      'model',
      'isEditingInline',
      function() {
        return (
          this.get('model.supportAnswerChoices') && this.get('isEditingInline')
        );
      }
    ),

    /**
     * Toggle Options for the Advanced Edit button
     * @property {Ember.Array}
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
    ]),

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
    }),

    /**
     * Options for increment
     * @property {Array}
     */
    incrementOptions: Ember.computed(function() {
      return RUBRIC_OFF_OPTIONS.INCREMENT;
    }),

    /**
     * Options for attachment
     * @property {Array}
     */
    references: Ember.computed('model.exemplarDocs', function() {
      return this.get('model.exemplarDocs') || Ember.A([]);
    }),

    recorderInstances: Ember.A([]),

    isH5PContentType: Ember.computed('model', function() {
      return this.get('model.format') === 'h5p';
    }),

    // ----------------------------

    // Methods

    /**
     * Save question content
     */
    saveQuestion: function() {
      const component = this;
      var editedQuestion = this.get('tempModel');
      var hintExplanationDetail = component.get('hintExplanationDetail');
      editedQuestion.set('text', replaceMathExpression(editedQuestion.text));
      var questionForValidate = editedQuestion.copy();
      var answersForValidate = questionForValidate.get('answers');
      var promiseArray = [];
      var answersPromise = null;
      if (editedQuestion.get('isFIB')) {
        editedQuestion.set(
          'answers',
          FillInTheBlank.getQuestionAnswers(editedQuestion)
        );
        component.updateQuestion(editedQuestion, component);
      } else if (editedQuestion.get('isScientificFIB')) {
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
        } else {
          var answerDetails = component.get('answerDetails');
          editedQuestion.set('answerDetails', answerDetails);
          let parsedAnswers = ScientificFillInTheBlank.getQuestionAnswers(
            answerDetails
          );
          parsedAnswers = parsedAnswers.map(parseAnswer => {
            return Answer.create(
              Ember.getOwner(this).ownerInjection(),
              parseAnswer
            );
          });
          editedQuestion.set('answers', parsedAnswers);

          editedQuestion.set('hints', hintExplanationDetail);
          component.updateQuestion(editedQuestion, component);
        }
      } else if (editedQuestion.get('isScientificFreeRes')) {
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
        } else {
          var freeResDetails = component.get('answerFreeResDetails');
          editedQuestion.set('answerDetails', answerDetails);
          let answerData = freeResDetails.map(function(data) {
            let values = Ember.Object.create({
              answer_category: data.answer_category,
              answer_type: data.answer_type,
              sequence: 0
            });
            return values;
          });
          editedQuestion.set('answers', answerData);
          editedQuestion.set('hints', hintExplanationDetail);
          component.updateQuestion(editedQuestion, component);
        }
      } else if (editedQuestion.get('isOpenEnded')) {
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
        } else {
          component.updateQuestion(editedQuestion, component);
        }
      } else if (editedQuestion.get('type') === SERP_ENCODING_QUESTION_TYPE) {
        component.set('isAudioUploadFail', false);
        let result = editedQuestion
          .get('answers')
          .filter(data => data.isRecorded);
        let promiseArray = result.map(data => {
          return new Promise(resolve => {
            return component.uploadSelectedFile(data).then(
              () => {
                resolve();
              },
              function() {
                component.set('isAudioUploadFail', true);
                return;
              }
            );
          });
        });

        if (!component.set('isAudioUploadFail')) {
          Promise.all(promiseArray).then(function() {
            component.updateQuestion(editedQuestion, component);
            component.set('isAudioUploadFail', false);
          });
        } else {
          return;
        }
      } else if (
        editedQuestion.get('type') === QUESTION_TYPES.decodingAssessment
      ) {
        component.set('isAudioUploadFail', false);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        const qExemplars = [];
        let audioUrlPromises = component.get('references').map(serpExemplar => {
          if (serpExemplar && !component.get('isAudioUploadFail')) {
            return new Promise(resolve => {
              if (serpExemplar.blob) {
                return component
                  .get('mediaService')
                  .uploadContentFile(serpExemplar.blob, true)
                  .then(fileUrl => {
                    if (fileUrl) {
                      qExemplars.push({
                        audio_url: fileUrl,
                        audio_text: serpExemplar.audio_text
                      });
                      return resolve(serpExemplar);
                    } else {
                      component.set('isAudioUploadFail', true);
                      return;
                    }
                  });
              } else {
                qExemplars.push({
                  audio_url: serpExemplar.audio_url,
                  audio_text: serpExemplar.audio_text
                });
                return resolve(serpExemplar);
              }
            });
          }
        });
        if (!component.get('isAudioUploadFail')) {
          Promise.all(audioUrlPromises).then(() => {
            let exemplarResult = [];
            if (qExemplars.length) {
              editedQuestion.answers.map(data => {
                var value = qExemplars.findBy('audio_text', data.text);
                exemplarResult.push(value);
              });
            }
            editedQuestion.set('exemplar_docs', exemplarResult);
            component.updateQuestion(editedQuestion, component);
            component.set('isAudioUploadFail', false);
          });
        } else {
          return;
        }
      } else if (editedQuestion.get('type') === QUESTION_TYPES.sayOutLoud) {
        component.set('isExemplaravail', false);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        for (
          let index = 0;
          index < editedQuestion.get('exemplar_docs').length;
          index++
        ) {
          const element = editedQuestion.get('exemplar_docs')[index];
          if (!element.audio_url) {
            component.set('isExemplaravail', true);
            break;
          }
        }
        if (component.get('isExemplaravail')) {
          return;
        }
        if (!component.get('isAudioUploadFail')) {
          component.updateQuestion(editedQuestion, component);
          component.set('isAudioUploadFail', false);
        } else {
          return;
        }
      } else if (
        editedQuestion.get('type') === QUESTION_TYPES.identifyDigraph
      ) {
        component.set('isAudioUploadFail', false);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        let audioUrlPromises = [];
        var Exemplaranswer = [];
        for (
          let index = 0;
          index < editedQuestion.get('answers').length;
          index++
        ) {
          const element = editedQuestion.get('answers')[index];
          if (!element.correctAnswer.length) {
            component.set('emptyUnderline', true);
            break;
          }
        }
        if (component.get('emptyUnderline')) {
          return null;
        }
        var exemplarLength = component.get('references').length;
        if (
          !exemplarLength &&
          exemplarLength !== editedQuestion.answers.length
        ) {
          component.set('exemplarError', true);
          return;
        }
        component.get('references').map(underLineAns => {
          let correctanswer = [];
          Exemplaranswer.push({
            answer_text: underLineAns.answer_text,
            correct_answer: correctanswer
          });
          underLineAns = Ember.Object.create(underLineAns);
          return underLineAns.correct_answer.map(answerlist => {
            if (answerlist.isRecorded && !component.set('isAudioUploadFail')) {
              audioUrlPromises.push(
                new Promise(resolve => {
                  return component
                    .get('mediaService')
                    .uploadContentFile(answerlist.audio.audioBlob, true)
                    .then(fileUrl => {
                      if (fileUrl) {
                        correctanswer.push({
                          audio_file_url: fileUrl,
                          text: answerlist.text,
                          seq: answerlist.seq
                        });
                        return resolve(underLineAns);
                      } else {
                        component.set('isAudioUploadFail', true);
                        return;
                      }
                    });
                })
              );
            } else {
              correctanswer.push({
                audio_file_url: answerlist.audio_file_url,
                text: answerlist.text,
                seq: answerlist.seq
              });
            }
          });
        });
        if (!component.get('isAudioUploadFail')) {
          Promise.all(audioUrlPromises).then(() => {
            Exemplaranswer.map(result => {
              result.correct_answer = result.correct_answer.sortBy('seq');
            });
            editedQuestion.set('exemplar_docs', Exemplaranswer);
            component.updateQuestion(editedQuestion, component);
            component.set('isAudioUploadFail', false);
          });
        } else {
          return;
        }
      } else {
        if (editedQuestion.get('answers')) {
          if (this.get('showAdvancedEditButton')) {
            for (var i = 0; i < editedQuestion.get('answers').length; i++) {
              var answer = editedQuestion.get('answers')[i];
              answer.set('text', replaceMathExpression(answer.get('text')));
            }
          }
          if (editedQuestion.get('isHotSpotImage')) {
            this.hasImages(editedQuestion.get('answers'));
            promiseArray = editedQuestion
              .get('answers')
              .map(component.getAnswerSaveImagePromise.bind(component));
            answersPromise = Ember.RSVP.Promise.all(promiseArray).then(function(
              values
            ) {
              for (var i = 0; i < editedQuestion.get('answers').length; i++) {
                editedQuestion.get('answers')[i].set('text', values[i]);
              }
              answersForValidate = editedQuestion.get('answers');
              return Ember.RSVP.Promise.all(
                answersForValidate.map(component.getAnswerValidatePromise)
              );
            });
          } else if (editedQuestion.get('isClassic')) {
            answersPromise = component.parseClassicImages(
              editedQuestion.get('answers')
            );
          } else if (
            editedQuestion.get('type') === QUESTION_TYPES.matchTheFollowing
          ) {
            answersPromise = component
              .parseMatchTheFollowingImages(editedQuestion.get('answers'))
              .then(function(values) {
                return Ember.RSVP.Promise.all(
                  values.map(component.getAnswerValidatePromise)
                );
              });
          } else {
            promiseArray = answersForValidate.map(
              component.getAnswerValidatePromise
            );
            answersPromise = Ember.RSVP.Promise.all(promiseArray);
          }
          answersPromise.then(function(values) {
            if (component.validateAnswers(values, editedQuestion)) {
              component.updateQuestion(editedQuestion, component);
            }
          });
        } else {
          component.updateQuestion(editedQuestion, component);
        }
      }
    },

    updateQuestion: function(editedQuestion, component) {
      let question = component.get('model');
      const collection = component.get('collection');

      editedQuestion.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          let imageIdPromise = new Ember.RSVP.resolve(
            editedQuestion.get('thumbnail')
          );
          if (
            editedQuestion.get('thumbnail') &&
            editedQuestion.get('thumbnail') !== question.get('thumbnail')
          ) {
            imageIdPromise = component
              .get('mediaService')
              .uploadContentFile(editedQuestion.get('thumbnail'));
          }
          var defaultTitle = component.get('i18n').t('common.new-question')
            .string;
          var defaultText = component.get('i18n').t('common.new-question-text')
            .string;
          var editedQuestionTitle = editedQuestion.title;
          var editedQuestionText = editedQuestion.text;
          var selectionDiv = document.createElement('div');
          selectionDiv.innerHTML = editedQuestionText;
          var aTag = selectionDiv.getElementsByTagName('a');
          if (
            editedQuestionTitle === defaultTitle &&
            aTag.length === 0 &&
            editedQuestionText !== defaultText &&
            editedQuestionText !== ''
          ) {
            editedQuestionText = $.trim(editedQuestionText);
            //Replace answer placeholder in the question title from [answer] into ____
            var newTitle = editedQuestionText
              .replace(/\[[^\]]+\]/g, '____')
              .substr(0, 50);
            editedQuestion.set('title', newTitle);
          }
          imageIdPromise.then(function(imageId) {
            editedQuestion.set('thumbnail', imageId);
            component
              .get('questionService')
              .updateQuestion(editedQuestion.id, editedQuestion, collection)
              .then(function() {
                let strugglesAnswers = component.get('selectedStruggle');
                if (editedQuestion.type === 'MC' && strugglesAnswers.length) {
                  component.struggleAnswers(strugglesAnswers);
                }
                if (editedQuestion.get('isScientificFreeRes')) {
                  editedQuestion.set('answers', Ember.A([]));
                }
                component.setProperties({
                  model: editedQuestion,
                  isPanelExpanded: false,
                  isEditingInline: false,
                  isEditingNarration: false,
                  editImagePicker: false
                });
                if (component.get('editingContent')) {
                  component.set('editingContent', null);
                  component.set('editingSubContent', null);
                }
                question.merge(editedQuestion, [
                  'title',
                  'narration',
                  'thumbnail',
                  'text',
                  'answers'
                ]);

                if (
                  (editedQuestion.get('isScientificFIB') ||
                    editedQuestion.get('isScientificFreeRes') ||
                    editedQuestion.get('isOpenEnded') ||
                    editedQuestion.get('isSerpSayOutLoud') ||
                    editedQuestion.get('isSerpEncoding') ||
                    editedQuestion.get('isSerpDecoding') ||
                    editedQuestion.get('isSerpUnderline') ||
                    editedQuestion.get('isSerpWPM')) &&
                  !editedQuestion.get('rubric.rubricOn')
                ) {
                  editedQuestion.set('rubric.title', null);
                }

                if (!question.get('rubric')) {
                  question.set('rubric', editedQuestion.get('rubric'));
                } else {
                  question
                    .get('rubric')
                    .merge(editedQuestion.get('rubric'), [
                      'maxScore',
                      'increment',
                      'scoring',
                      'rubricOn',
                      'title'
                    ]);
                }
              })
              .catch(function(error) {
                var message = component
                  .get('i18n')
                  .t('common.errors.question-not-updated').string;
                component.get('notifications').error(message);
                Ember.Logger.error(error);
              });
          });
        }
        component.set('didValidate', true);
      });
    },

    /**
     * @function parseClassicImages help to parse classic images
     */
    parseClassicImages(answers) {
      return new Ember.RSVP.Promise(resolve => {
        let answerPromise = answers.map(answer => {
          if (answer.textImage && typeof answer.textImage !== 'string') {
            return this.get('mediaService').uploadContentFile(answer.textImage);
          }
          return answer.textImage;
        });
        Ember.RSVP.Promise.all(answerPromise).then(answerList => {
          let updateAnswer = answers.map((item, index) => {
            item.set('textImage', answerList[index]);
            return item;
          });
          Ember.RSVP.Promise.all(updateAnswer).then(() => {
            resolve(answers);
          });
        });
      });
    },

    parseMatchTheFollowingImages(answers) {
      return new Ember.RSVP.Promise(resolve => {
        let answerPromise = answers.map(answer => {
          const promiseFn = answerText => {
            return typeof answerText !== 'string'
              ? this.get('mediaService').uploadContentFile(answerText)
              : answerText;
          };
          return Ember.RSVP.hash({
            leftValue: promiseFn(answer.leftValue),
            rightValue: promiseFn(answer.rightValue)
          });
        });
        Ember.RSVP.Promise.all(answerPromise).then(answerList => {
          let updateAnswer = answers.map((item, index) => {
            item.set('leftValue', answerList[index].leftValue);
            item.set('rightValue', answerList[index].rightValue);
            return item;
          });
          Ember.RSVP.Promise.all(updateAnswer).then(() => {
            resolve(answers);
          });
        });
      });
    },

    /**
     * Check that validate promises are not returning false
     */
    validateAnswers: function(promiseValues, question) {
      var valid = true;
      promiseValues.find(function(promise) {
        if (promise === false) {
          valid = false;
        }
      });
      return valid && this.isCorrectAnswerSelected(question);
    },

    /**
     * Check if an answer is selected as correct
     */
    isCorrectAnswerSelected: function(question) {
      if (
        question.get('answers').length > 0 &&
        question.get('type') !== 'MA' &&
        question.get('type') !== 'SERP_MC'
      ) {
        let correctAnswers = question.get('answers').filter(function(answer) {
          return answer.get('isCorrect');
        });
        if (correctAnswers.length > 0) {
          this.set('correctAnswerNotSelected', false);
        } else {
          this.set('correctAnswerNotSelected', true);
          return false;
        }
      }
      return true;
    },

    /**
     * Returns upload image promises
     */
    getAnswerSaveImagePromise: function(answer) {
      if (answer.get('text') && typeof answer.get('text').name === 'string') {
        return this.get('mediaService').uploadContentFile(answer.get('text'));
      } else {
        return answer.get('text');
      }
    },

    /**
     * Returns validate answer promises
     */
    getAnswerValidatePromise: function(answer) {
      if (answer.get('text')) {
        if (answer.get('text').length > 0) {
          answer.set('text', removeHtmlTags(answer.text));
        }
      }
      return answer.validate().then(function({ validations }) {
        return validations.get('isValid');
      });
    },

    /**
     * Check if an hs-answer has image
     */
    hasImages: function(answers) {
      if (answers.length > 0) {
        let answerImages = answers.filter(function(answer) {
          return answer.get('text') === null;
        });
        if (answerImages.length > 0) {
          this.set('hasNoImages', true);
        } else {
          this.set('hasNoImages', false);
          return false;
        }
      }
      return true;
    },

    /**
     * show Inline Edit Panel
     */
    showInlinePanel: function() {
      var modelForEditing = this.get('model').copy();

      if (
        (modelForEditing.get('isScientificFIB') ||
          modelForEditing.get('isScientificFreeRes') ||
          modelForEditing.get('isOpenEnded') ||
          modelForEditing.get('isSerpSayOutLoud') ||
          modelForEditing.get('isSerpEncoding') ||
          modelForEditing.get('isSerpDecoding') ||
          modelForEditing.get('isSerpUnderline') ||
          modelForEditing.get('isSerpWPM')) &&
        !modelForEditing.get('rubric')
      ) {
        let rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
          increment: 0.5,
          maxScore: 1
        });
        modelForEditing.set('rubric', rubric);
      }
      this.setProperties({
        tempModel: modelForEditing,
        isPanelExpanded: true,
        isEditingInline: true,
        editImagePicker: false,
        showAdvancedEditor: false,
        rubricError: false
      });
    },

    /**
     * scroll to first editor of the page, when it has several editor answers
     */
    scrollToFirstEditor: function() {
      var component = this;
      Ember.run.later(function() {
        var editorID =
          '.panel-body .question .gru-rich-text-editor:eq(0) .rich-editor';
        var editor = component.$(editorID);
        if (editor && editor.length > 0) {
          editor[0].focus();
        }
      }, 100);
    },

    uploadSelectedFile(element) {
      const component = this;
      return element.audio.then(instance => {
        let fileToUpload = instance.audioBlob;
        let fileIdPromise = new Ember.RSVP.resolve(fileToUpload);
        if (fileToUpload) {
          fileIdPromise = component
            .get('mediaService')
            .uploadContentFile(fileToUpload, true);
        }
        fileIdPromise.then(filename => {
          if (filename) {
            element.set('audioUrl', filename);
            element.set('isRecorded', false);
          } else {
            return null;
          }
        });
        return fileIdPromise;
      });
    },

    struggleAnswers(selectedStruggle) {
      return new Ember.RSVP.Promise(resolve => {
        const component = this;
        let params = {
          struggles: selectedStruggle
        };
        return component
          .get('strugglingCompetencyService')
          .fetchCheckedAnswerStuggling(params)
          .then(
            () => {
              this.set('selectedStruggle', Ember.A([]));
              resolve({});
            },
            () => {
              this.set('selectedStruggle', Ember.A([]));
              resolve({});
            }
          );
      });
    },

    questionUpdate(editedModel, collection, builderItem) {
      const component = this;
      editedModel.validate().then(function({ model, validations }) {
        if (validations.get('isValid')) {
          if (builderItem.get('format') === 'question') {
            component.saveQuestion();
          } else {
            if (editedModel.narration === '') {
              Ember.set(editedModel, 'narration', null);
            }
            Ember.set(editedModel, 'url', undefined);
            Ember.set(editedModel, 'narration', editedModel.narration);
            component
              .get('resourceService')
              .updateResource(editedModel.id, editedModel, collection, false)
              .then(function() {
                editedModel.set('url', component.get('model.url'));
                component.set('model', editedModel);
                model.merge(editedModel, ['title', 'narration']);
                component.setProperties({
                  isPanelExpanded: false,
                  isEditingInline: false,
                  isEditingNarration: false,
                  editImagePicker: false
                });
              })
              .catch(function(error) {
                var message = component
                  .get('i18n')
                  .t('common.errors.question-not-updated').string;
                component.get('notifications').error(message);
                Ember.Logger.error(error);
              });
          }
        } else {
          component.set('didValidate', true);
        }
      });
    },

    recordAudio() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices
          .getUserMedia({
            audio: true
          })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', event => {
              audioChunks.push(event.data);
            });

            const start = () => mediaRecorder.start();

            const state = mediaRecorder.state;

            const stop = () =>
              new Promise(resolve => {
                mediaRecorder.addEventListener('stop', () => {
                  const audioBlob = new Blob(audioChunks, {
                    type: 'audio/mp3'
                  });
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const audio = new Audio(audioUrl);
                  const play = () => audio.play();
                  resolve({
                    audioBlob,
                    audioUrl,
                    play
                  });
                });

                mediaRecorder.stop();
              });
            return {
              start,
              stop,
              state
            };
          });
      } else {
        return null;
      }
    }
  }
);
