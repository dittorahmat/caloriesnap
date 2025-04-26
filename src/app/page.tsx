'use client';

import {useState} from 'react';
import {identifyFoodItems} from '@/ai/flows/identify-food-items';
import {estimateCalorieCount} from '@/ai/flows/estimate-calorie-count';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {useToast} from '@/hooks/use-toast';
import {Icons} from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<string[] | null>(null);
  const [calorieEstimate, setCalorieEstimate] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    setFoodItems(null);
    setCalorieEstimate(null);
    setError(null);

    try {
      // Step 1: Identify Food Items
      const identificationResult = await identifyFoodItems({photoUrl: imageDataUrl});
      let identifiedItems: string[] = [];

      if (identificationResult.foodItems && identificationResult.foodItems.length > 0) {
        identifiedItems = identificationResult.foodItems;
        setFoodItems(identifiedItems);
      } else {
         setFoodItems([]); // Set to empty array if no items found
         toast({
          title: 'No food items identified',
          description: 'Could not identify any food items in the image.',
        });
        setIsProcessing(false); // Stop processing if no food found
        return; // Exit the function early
      }

      // Step 2: Estimate Calories (only if food items were identified)
      const foodItemsString = identifiedItems.join(', ');
      const calorieResult = await estimateCalorieCount({foodItems: foodItemsString});
      setCalorieEstimate(calorieResult.estimatedCalories);

    } catch (err: any) {
      console.error('Error processing image:', err);
      const errorMessage = err.message || 'An unexpected error occurred during processing. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Processing Error',
        description: errorMessage,
        variant: 'destructive',
      });
      // Reset results on error
      setFoodItems(null);
      setCalorieEstimate(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset state when input changes or file is cleared
    setImage(null);
    setFoodItems(null);
    setCalorieEstimate(null);
    setError(null);
    setIsProcessing(false);

    if (!file) {
      return;
    }

    // Validate file type (optional but recommended)
    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload an image file (e.g., JPG, PNG, GIF).',
        });
        e.target.value = ''; // Clear the input
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      setImage(imageDataUrl);
      processImage(imageDataUrl); // Start processing immediately
    };
    reader.onerror = () => {
        console.error('Error reading file');
        setError('Failed to read the image file.');
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected image file. Please try again.',
        });
        e.target.value = ''; // Clear the input
    }
    reader.readAsDataURL(file);
  };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 md:p-8 bg-secondary">
      <Card className="w-full max-w-lg mb-6 shadow-md rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center text-primary">CalorieSnap</CardTitle>
          <CardDescription className="text-center">Upload a photo of your meal!</CardDescription>
        </CardHeader>
        <CardContent>
           <Input
             type="file"
             accept="image/*"
             onChange={handleImageUpload}
             disabled={isProcessing} // Disable input while processing
             className="mb-4 file:text-primary file:font-semibold hover:file:bg-primary/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
           />
          {image && !isProcessing && !error && ( // Only show image if not processing and no error
            <div className="flex justify-center mb-4">
              <img src={image} alt="Uploaded Food" className="max-h-60 w-auto object-contain rounded-md border shadow-sm" />
            </div>
          )}
          {/* Removed the buttons */}
        </CardContent>
      </Card>

      {/* Results Display Area */}
       <div className="w-full max-w-lg space-y-4">
         {/* Loading Skeleton */}
          {isProcessing && (
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                 <div className="flex items-center space-x-2 mb-2">
                     <Icons.spinner className="h-5 w-5 animate-spin text-primary" />
                     <CardTitle className="text-lg font-semibold">Processing Image...</CardTitle>
                 </div>
                 <CardDescription>Identifying food and estimating calories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div>
                    <Skeleton className="h-4 w-3/4 mb-1 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
                 <div>
                    <Skeleton className="h-4 w-1/2 mb-1 rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                 </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
            {error && !isProcessing && (
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}


          {/* Results Display (only when not processing and no error) */}
          {!isProcessing && !error && foodItems !== null && (
            <>
              {/* Food Items Display */}
              <Card className="shadow-md rounded-lg animate-in fade-in duration-500">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Identified Food Items</CardTitle>
                  <CardDescription>Here's what we found in your photo:</CardDescription>
                </CardHeader>
                <CardContent>
                  {foodItems.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {foodItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No food items were identified. Try a different image or angle.</p>
                  )}
                </CardContent>
              </Card>

              {/* Calorie Estimate Display */}
              {calorieEstimate && (
                <Card className="shadow-md rounded-lg animate-in fade-in duration-500 delay-100">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Calorie Estimation</CardTitle>
                    <CardDescription>Approximate calorie count based on identified items:</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{calorieEstimate}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
       </div>
    </div>
  );
}
