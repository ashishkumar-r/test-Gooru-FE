import DS from 'ember-data';
export default DS.Model.extend({
  usageData: [
    {
      scoreInPercentage: 0,
      attempts: 2,
      collectionType: 'assessment',
      collectionId: '6d6002dd-f4f9-4812-b9cb-8e925c906434',
      lastAccessed: '2018-09-21 18:46:41.266',
      timeSpent: 13840000,
      reaction: 0,
      status: 'complete',
      gradingStatus: 'in-progress'
    }
  ],
  userId: '',
  message: null,
  paginate: null,
  usageDataDisplayInfo: [
    {
      imgUrl: '',
      cardlineitems: []
    }
  ]
});
