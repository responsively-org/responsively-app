export const transformFile = (file: File): Promise<{ [key: string]: any }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const jsonContent = JSON.parse(reader.result as string);
        resolve(jsonContent);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsText(file);
  });
};
