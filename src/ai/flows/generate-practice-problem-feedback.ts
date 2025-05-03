'use server';

/**
 * @fileOverview Provides AI-generated feedback for practice physics problems.
 *
 * - generatePracticeProblemFeedback - A function that generates feedback for a given physics problem and answer.
 * - GeneratePracticeProblemFeedbackInput - The input type for the generatePracticeProblemFeedback function.
 * - GeneratePracticeProblemFeedbackOutput - The return type for the generatePracticeProblemFeedback function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePracticeProblemFeedbackInputSchema = z.object({
  problem: z.string().describe('The physics problem to provide feedback on.'),
  answer: z.string().describe('The user-provided answer to the physics problem.'),
});
export type GeneratePracticeProblemFeedbackInput = z.infer<typeof GeneratePracticeProblemFeedbackInputSchema>;

const GeneratePracticeProblemFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback on the user answer, explaining where the user went wrong and how to improve.'),
  correct: z.boolean().describe('Whether the answer is correct or not'),
});
export type GeneratePracticeProblemFeedbackOutput = z.infer<typeof GeneratePracticeProblemFeedbackOutputSchema>;

export async function generatePracticeProblemFeedback(
  input: GeneratePracticeProblemFeedbackInput
): Promise<GeneratePracticeProblemFeedbackOutput> {
  return generatePracticeProblemFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeProblemFeedbackPrompt',
  input: {
    schema: z.object({
      problem: z.string().describe('The physics problem to provide feedback on.'),
      answer: z.string().describe('The user-provided answer to the physics problem.'),
    }),
  },
  output: {
    schema: z.object({
      feedback: z.string().describe('The AI-generated feedback on the user answer, explaining where the user went wrong and how to improve.'),
      correct: z.boolean().describe('Whether the answer is correct or not'),
    }),
  },
  prompt: `You are an expert physics tutor. A student has submitted an answer to a practice problem. Provide feedback on their answer, explaining where they went wrong and how they can improve. Also, indicate if the answer is correct or not. 

Problem: {{{problem}}}
Answer: {{{answer}}}`,
});

const generatePracticeProblemFeedbackFlow = ai.defineFlow<
  typeof GeneratePracticeProblemFeedbackInputSchema,
  typeof GeneratePracticeProblemFeedbackOutputSchema
>(
  {
    name: 'generatePracticeProblemFeedbackFlow',
    inputSchema: GeneratePracticeProblemFeedbackInputSchema,
    outputSchema: GeneratePracticeProblemFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
