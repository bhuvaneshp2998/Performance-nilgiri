const Prompts = {
  system: `You are an expert in performance testing.`,
  user: {
    performance: (input: object) => `
      Please analyze the following performance test summary and generate a detailed report:

      Here is the summary of the performance test:
      ${JSON.stringify(input, null, 2)}

      Please provide insights, identify any performance issues, and suggest improvements based on the data above.
    `,
  },
};

export default Prompts;
