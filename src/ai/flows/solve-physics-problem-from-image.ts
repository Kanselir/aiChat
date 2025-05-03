'use server';
/**
 * @fileOverview A flow that takes an image of a physics problem and returns a step-by-step solution or explanation.
 *
 * - solvePhysicsProblemFromImage - A function that handles the physics problem solving process from an image.
 * - SolvePhysicsProblemFromImageInput - The input type for the solvePhysicsProblemFromImage function.
 * - SolvePhysicsProblemFromImageOutput - The return type for the solvePhysicsProblemFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SolvePhysicsProblemFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a physics problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SolvePhysicsProblemFromImageInput = z.infer<
  typeof SolvePhysicsProblemFromImageInputSchema
>;

const SolvePhysicsProblemFromImageOutputSchema = z.object({
  solution: z.string().describe('A step-by-step solution or explanation of the physics problem.'),
});
export type SolvePhysicsProblemFromImageOutput = z.infer<
  typeof SolvePhysicsProblemFromImageOutputSchema
>;

export async function solvePhysicsProblemFromImage(
  input: SolvePhysicsProblemFromImageInput
): Promise<SolvePhysicsProblemFromImageOutput> {
  return solvePhysicsProblemFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solvePhysicsProblemFromImagePrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a physics problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      solution: z.string().describe('A step-by-step solution or explanation of the physics problem.'),
    }),
  },
  prompt: `You are an expert physics tutor. A student has provided an image of a physics problem. Provide a step-by-step solution and explanation to help the student understand the problem.

Physics Problem Image: {{media url=photoDataUri}}`,
});

const solvePhysicsProblemFromImageFlow = ai.defineFlow<
  typeof SolvePhysicsProblemFromImageInputSchema,
  typeof SolvePhysicsProblemFromImageOutputSchema
>(
  {
    name: 'solvePhysicsProblemFromImageFlow',
    inputSchema: SolvePhysicsProblemFromImageInputSchema,
    outputSchema: SolvePhysicsProblemFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
