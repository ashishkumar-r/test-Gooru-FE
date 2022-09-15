import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['class-overview', 'gru-lesson-plan'],

  actions: {
    onAddActivity(content) {
      const activityContent = Ember.Object.create({
        id: content.id,
        format: content.format,
        title: content.title
      });
      this.sendAction('onAddActivity', activityContent);
    },

    onScheduleActivity(content) {
      const activityContent = Ember.Object.create({
        id: content.id,
        format: content.format,
        title: content.title
      });
      this.sendAction('onScheduleActivity', activityContent);
    },

    onToggleContainer(containerClass) {
      const component = this;
      component.$(`.${containerClass}`).slideToggle();
    }
  },

  anticipatedStruggles: Ember.computed.alias('lessonPlan.anticipatedStruggles'),

  guidingQuestions: Ember.computed.alias('lessonPlan.guidingQuestions'),

  priorKnowledge: Ember.computed.alias('lessonPlan.priorKnowledge'),

  sessions: Ember.computed('lessonPlan.sessions', function() {
    const component = this;
    const sessions = component.get('lessonPlan.sessions');
    return sessions || Ember.A([]);
  }),

  sessionsCount: Ember.computed.alias('sessions.length')
});
