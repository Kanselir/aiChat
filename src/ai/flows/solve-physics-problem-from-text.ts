'use server';
/**
 * @fileOverview Solves a physics problem provided as text.
 *
 * - solvePhysicsProblemFromText - A function that solves a physics problem from text.
 * - SolvePhysicsProblemFromTextInput - The input type for the solvePhysicsProblemFromText function.
 * - SolvePhysicsProblemFromTextOutput - The return type for the solvePhysicsProblemFromText function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SolvePhysicsProblemFromTextInputSchema = z.object({
  problemText: z.string().describe('The physics problem to solve, provided as text.'),
});
export type SolvePhysicsProblemFromTextInput = z.infer<typeof SolvePhysicsProblemFromTextInputSchema>;

const SolvePhysicsProblemFromTextOutputSchema = z.object({
  solution: z.string().describe('The step-by-step solution or explanation of the physics problem.'),
});
export type SolvePhysicsProblemFromTextOutput = z.infer<typeof SolvePhysicsProblemFromTextOutputSchema>;

export async function solvePhysicsProblemFromText(input: SolvePhysicsProblemFromTextInput): Promise<SolvePhysicsProblemFromTextOutput> {
  return solvePhysicsProblemFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solvePhysicsProblemFromTextPrompt',
  input: {
    schema: z.object({
      problemText: z.string().describe('The physics problem to solve, provided as text.'),
    }),
  },
  output: {
    schema: z.object({
      solution: z.string().describe('The step-by-step solution or explanation of the physics problem.'),
    }),
  },
  prompt: `You are an expert physics tutor. A student has provided you with the following physics problem:\n\nProblem: {{{problemText}}}\n\nProvide a step-by-step solution or explanation to help the student understand the concepts and methods involved.  Be as detailed as possible.  Format the solution using markdown.  Include any relevant formulas or diagrams, if appropriate.\n`,
});

const solvePhysicsProblemFromTextFlow = ai.defineFlow<
  typeof SolvePhysicsProblemFromTextInputSchema,
  typeof SolvePhysicsProblemFromTextOutputSchema
>(
  {
    name: 'solvePhysicsProblemFromTextFlow',
    inputSchema: SolvePhysicsProblemFromTextInputSchema,
    outputSchema: SolvePhysicsProblemFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
