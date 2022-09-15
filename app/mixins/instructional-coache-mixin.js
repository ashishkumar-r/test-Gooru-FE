import Ember from 'ember';

export default Ember.Mixin.create({
  session: Ember.inject.service('session'),

  currentClass: Ember.computed('class', 'primaryClass', function() {
    return this.get('class') ? this.get('class') : this.get('primaryClass');
  }),

  instructionalCoache: function() {
    let isCollaborator = false;
    if (
      this.get('currentClass') &&
      this.get('currentClass.collaborators').length
    ) {
      const coTeacher = this.get('currentClass.collaborators').map(
        coTeacher => {
          return coTeacher.id;
        }
      );
      isCollaborator = coTeacher.includes(
        this.get('session.userData.gooruUId')
      );
    }
    return (
      this.get('session.isInstructionalCoache') &&
      this.get('session.userId') !== this.get('currentClass.creatorId') &&
      !isCollaborator
    );
  }
});
