import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { LIKERT_UI_TEMPLATES } from '../../../../config/config';

export default Ember.Component.extend({
  classNames: ['gru-likert-scale'],

  // ---------------------------------------------------------
  // Properties

  uiTemplateList: Ember.computed(function() {
    return LIKERT_UI_TEMPLATES;
  }),

  totalPoints: new Array(5).fill({}),

  activeComponent: null,

  activeUiTemplate: Ember.computed('answer', function() {
    if (this.get('answers') && this.get('answers').length) {
      const answer = this.get('answers').get(0);
      const uiTemplateList = this.get('uiTemplateList');
      const activeType = uiTemplateList.find(
        item => item.ratingType === answer.uiDisplayGuide.ratingType
      );
      return activeType ? activeType : this.get('uiTemplateList.firstObject');
    } else {
      return this.get('uiTemplateList.firstObject');
    }
  }),

  scalePointLabels: Ember.computed(
    'answer.scalePointLabels.@each.levelPoint',
    function() {
      const scalePointLabels = this.get('answer.scalePointLabels');
      return scalePointLabels.sortBy('levelPoint');
    }
  ),

  didInsertElement() {
    this.createTemplateUrl();
    if (this.get('answers') && this.get('answers').length) {
      const answer = this.get('answers').get(0);
      answer.isCorrect = true;
      answer.text = 'text';
      const radioInputs = this.$('.likert-presentation-modes input');
      this.set('answer', answer);
      radioInputs.each(function(i, radioInput) {
        if (radioInput.value === answer.uiDisplayGuide.uiPresentation) {
          $(radioInput).attr('checked', 'checked');
        }
      });
    } else {
      this.loadData();
    }
  },

  // ----------------------------------------------------------
  // Actions
  actions: {
    onAddItem() {
      const inputField = $(event.target).prev('input');
      this.get('answer.items').pushObject(
        Ember.Object.create({
          label: inputField.val()
        })
      );
      inputField.val('');
    },

    onSelectTemplate(uiTemplate) {
      this.set('activeUiTemplate', uiTemplate);
      this.set('answer.uiDisplayGuide.ratingType', uiTemplate.ratingType);
      this.createTemplateUrl();
    },

    onCloseItem(scale) {
      this.get('answer.items').removeObject(scale);
    },

    onSelectPointScale() {
      const noOfScale = parseInt(event.target.value);
      this.set('answer.scalePoint', noOfScale);
      this.set('answer.scalePointLabels', this.createLabelObj(noOfScale));
      this.set('answers', Ember.A([this.get('answer')]));
    },

    onSelectLevelPoint(scalePoint) {
      const scaleIndex = event.target.value;
      Ember.set(scalePoint, 'levelPoint', parseInt(scaleIndex));
      const levelPoint = this.get('answer.scalePointLabels').sortBy(
        'levelPoint'
      );
      this.set('answer.scalePointLabels', levelPoint);
    },

    onSelectPresentation(itemOption) {
      this.set('answer.uiDisplayGuide.uiPresentation', itemOption);
    }
  },

  createTemplateUrl() {
    const uiTemplate = this.get('activeUiTemplate');
    this.set('activeComponent', `content/likert-scale/${uiTemplate.component}`);
  },

  createLabelObj(total) {
    const labelList = Ember.A([]);
    new Array(parseInt(total)).fill({}).forEach((item, index) => {
      labelList.pushObject(
        Ember.Object.create({
          levelName: '',
          levelPoint: index + 1
        })
      );
    });
    return labelList;
  },

  loadData() {
    const component = this;
    const likertScale = Answer.create(Ember.getOwner(this).ownerInjection(), {
      scalePoint: 5,
      scalePointLabels: component.createLabelObj(5),
      items: Ember.A([]),
      isCorrect: true,
      text: 'text',
      uiDisplayGuide: {
        uiPresentation: 'one_item',
        ratingType: 'slider'
      }
    });
    component.set('answers', Ember.A([likertScale]));
    component.set('answer', likertScale);
  }
});
