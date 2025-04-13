// 'use server';
/**
 * @fileOverview Identifies food items in an image.
 *
 * - identifyFoodItems - A function that handles the food identification process.
 * - IdentifyFoodItemsInput - The input type for the identifyFoodItems function.
 * - IdentifyFoodItemsOutput - The return type for the identifyFoodItems function.
 */

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyFoodItemsInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the food image.'),
});
export type IdentifyFoodItemsInput = z.infer<typeof IdentifyFoodItemsInputSchema>;

const IdentifyFoodItemsOutputSchema = z.object({
  foodItems: z.array(z.string()).describe('The list of identified food items.'),
});
export type IdentifyFoodItemsOutput = z.infer<typeof IdentifyFoodItemsOutputSchema>;

export async function identifyFoodItems(input: IdentifyFoodItemsInput): Promise<IdentifyFoodItemsOutput> {
  return identifyFoodItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyFoodItemsPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the food image.'),
    }),
  },
  output: {
    schema: z.object({
      foodItems: z.array(z.string()).describe('The list of identified food items.'),
    }),
  },
  prompt: `You are an expert food identifier.  Given a photo of food, identify the individual food items that are present in the photo.  Return a list of the food items.

Photo: {{media url=photoUrl}}`,
});

const identifyFoodItemsFlow = ai.defineFlow<
  typeof IdentifyFoodItemsInputSchema,
  typeof IdentifyFoodItemsOutputSchema
>({
  name: 'identifyFoodItemsFlow',
  inputSchema: IdentifyFoodItemsInputSchema,
  outputSchema: IdentifyFoodItemsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
