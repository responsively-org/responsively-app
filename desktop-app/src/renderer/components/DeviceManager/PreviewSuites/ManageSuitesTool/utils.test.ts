import { transformFile } from './utils';

describe('transformFile', () => {
  it('should parse JSON content of the file', async () => {
    const jsonContent = { key: 'value' };
    const file = new Blob([JSON.stringify(jsonContent)], {
      type: 'application/json',
    }) as File;
    Object.defineProperty(file, 'name', { value: 'test.json' });

    const result = await transformFile(file);
    expect(result).toEqual(jsonContent);
  });

  it('should throw an error for invalid JSON', async () => {
    const invalidJsonContent = "{ key: 'value' }"; // Invalid JSON
    const file = new Blob([invalidJsonContent], {
      type: 'application/json',
    }) as File;
    Object.defineProperty(file, 'name', { value: 'test.json' });

    await expect(transformFile(file)).rejects.toThrow();
  });
});
