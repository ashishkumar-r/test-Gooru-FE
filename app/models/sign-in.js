//@ TODO This model will be replaced by models/session

import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr('string'),
  password: DS.attr('string')
});
