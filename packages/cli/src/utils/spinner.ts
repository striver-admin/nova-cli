import ora from 'ora';

const useSpinner = process.stdout.isTTY;

export const spinner = {
  async start<T>(text: string, fn: () => Promise<T>): Promise<T> {
    if (!useSpinner) {
      console.log(text);
      return fn();
    }
    const oraSpinner = ora(text).start();
    try {
      const result = await fn();
      oraSpinner.succeed();
      return result;
    } catch (error) {
      oraSpinner.fail();
      throw error;
    }
  }
};
