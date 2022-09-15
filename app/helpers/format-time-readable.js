import Ember from 'ember';

/**
 * Give format utc time to local
 */
export function formatTimeReadable(value) {
  value = value[0];
  const baseDate = moment
    .utc(value.meeting_starttime)
    .local()
    .format('LL');
  const startTime = moment
    .utc(value.meeting_starttime)
    .local()
    .format('hh:mm A');
  const endTime = moment
    .utc(value.meeting_endtime)
    .local()
    .format('hh:mm A');

  return `${baseDate} ${startTime} - ${endTime}`;
}

export default Ember.Helper.helper(formatTimeReadable);
