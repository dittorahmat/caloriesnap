'use server';

/**
 * @fileOverview Estimates the calorie count of identified food items.
 *
 * - estimateCalorieCount - A function that handles the calorie estimation process.
 * - EstimateCalorieCountInput - The input type for the estimateCalorieCount function.
 * - EstimateCalorieCountOutput - The return type for the estimateCalorieCount function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EstimateCalorieCountInputSchema = z.object({
  foodItems: z
    .string()
    .describe('A comma-separated list of identified food items in the image.'),
});
export type EstimateCalorieCountInput = z.infer<typeof EstimateCalorieCountInputSchema>;

const EstimateCalorieCountOutputSchema = z.object({
  estimatedCalories: z
    .string()
    .describe('A list of each food item, and its estimated calorie count.'),
});
export type EstimateCalorieCountOutput = z.infer<typeof EstimateCalorieCountOutputSchema>;

export async function estimateCalorieCount(
  input: EstimateCalorieCountInput
): Promise<EstimateCalorieCountOutput> {
  return estimateCalorieCountFlow(input);
}

const estimateCalorieCountPrompt = ai.definePrompt({
  name: 'estimateCalorieCountPrompt',
  input: {
    schema: z.object({
      foodItems: z
        .string()
        .describe('A comma-separated list of identified food items in the image.'),
    }),
  },
  output: {
    schema: z.object({
      estimatedCalories: z
        .string()
        .describe('A list of each food item, and its estimated calorie count.'),
    }),
  },
  prompt: `You are a nutrition expert. Estimate the calorie count for each food item provided in the list.

    Food Items: {{{foodItems}}}

    Provide a detailed breakdown of each food item and its estimated calorie count.`,
});

const estimateCalorieCountFlow = ai.defineFlow<
  typeof EstimateCalorieCountInputSchema,
  typeof EstimateCalorieCountOutputSchema
>({
  name: 'estimateCalorieCountFlow',
  inputSchema: EstimateCalorieCountInputSchema,
  outputSchema: EstimateCalorieCountOutputSchema,
},
async input => {
  const {output} = await estimateCalorieCountPrompt(input);
  return output!;
});
