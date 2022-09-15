import Ember from 'ember';

export default Ember.Mixin.create({
  session: Ember.inject.service(),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  isDisplayNoteTool: false,

  displayToggleNote(sourceDetails) {
    const controller = this;
    const noteToggle = controller.get('isDisplayNoteTool');
    controller.set('isDisplayNoteTool', !noteToggle);
    if ($('#note-tool-div').css('display') === 'none') {
      $('#note-tool-div').show();
      controller.callNoteTool(sourceDetails);
    } else {
      $('#note-tool-div').hide();
    }
  },

  callNoteTool(sourceDetails) {
    const controller = this;
    let noteIframe = document.getElementById('noteIframe');
    if (noteIframe) {
      const token = controller.get('session.token-api3');
      const tenantId = controller.get('session.tenantId');
      noteIframe.contentWindow.navigatorNotesTakingTool(
        tenantId,
        token,
        window.location.host,
        sourceDetails
      );
    }
  }
});
