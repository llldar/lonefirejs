import getModelList from './modelScanner';

describe('modelScanner', () => {
  describe('getModelList', () => {
    it('should contain all available static models', async () => {
      expect(await getModelList()).toContain(
        'article',
        'comment',
        'dynamicModel',
        'image',
        'link',
        'note',
        'status',
        'tag',
        'user'
      );
    });
  });
});
