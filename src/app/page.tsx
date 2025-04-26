'use client';

import {useState} from 'react';
import {identifyFoodItems} from '@/ai/flows/identify-food-items';
import {estimateCalorieCount} from '@/ai/flows/estimate-calorie-count';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {useToast} from '@/hooks/use-toast';
import {Icons} from '@/components/icons';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<string[] | null>(null);
  const [calorieEstimate, setCalorieEstimate] = useState<string | null>(null);
  const [loadingFoodItems, setLoadingFoodItems] = useState(false);
  const [loadingCalorieEstimate, setLoadingCalorieEstimate] = useState(false);
  const {toast} = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setFoodItems(null);
      setCalorieEstimate(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setFoodItems(null); // Reset results when new image is uploaded
      setCalorieEstimate(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFoodIdentification = async () => {
    if (!image) {
      toast({
        variant: 'destructive',
        title: 'No image uploaded',
        description: 'Please upload an image before identifying food items.',
      });
      return;
    }

    setLoadingFoodItems(true);
    setFoodItems(null); // Reset previous results
    setCalorieEstimate(null); // Also reset calorie estimate

    try {
      const result = await identifyFoodItems({photoUrl: image});
      if (result.foodItems && result.foodItems.length > 0) {
        setFoodItems(result.foodItems);
      } else {
        setFoodItems([]); // Set to empty array if no items found
         toast({
          title: 'No food items identified',
          description: 'Could not identify any food items in the image.',
        });
      }
    } catch (error: any) {
      console.error('Error identifying food items:', error);
      toast({
        title: 'Error identifying food items',
        description: error.message || 'Failed to identify food items. Please try again.',
        variant: 'destructive',
      });
      setFoodItems(null);
    } finally {
      setLoadingFoodItems(false);
    }
  };

  const handleCalorieEstimation = async () => {
    if (!foodItems || foodItems.length === 0) {
      toast({
         variant: 'destructive',
        title: 'No food items identified',
        description: 'Please identify food items before estimating calories. If you already did, try identifying again.',
      });
      return;
    }

    setLoadingCalorieEstimate(true);
    setCalorieEstimate(null); // Reset previous results

    try {
      const foodItemsString = foodItems.join(', ');
      const result = await estimateCalorieCount({foodItems: foodItemsString});
      setCalorieEstimate(result.estimatedCalories);
    } catch (error: any) {
      console.error('Error estimating calories:', error);
      toast({
        title: 'Error estimating calories',
        description: error.message || 'Failed to estimate calories. Please try again.',
        variant: 'destructive',
      });
      setCalorieEstimate(null);
    } finally {
      setLoadingCalorieEstimate(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 md:p-8 bg-secondary">
      <Card className="w-full max-w-lg mb-6 shadow-md rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center text-primary">CalorieSnap</CardTitle>
          <CardDescription className="text-center">Snap a photo of your meal to estimate its calories!</CardDescription>
        </CardHeader>
        <CardContent>
           <Input
             type="file"
             accept="image/*"
             onChange={handleImageUpload}
             className="mb-4 file:text-primary file:font-semibold hover:file:bg-primary/10 cursor-pointer"
           />
          {image && (
            <div className="flex justify-center mb-4">
              <img src={image} alt="Uploaded Food" className="max-h-60 w-auto object-contain rounded-md border shadow-sm" />
            </div>
          )}
           <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleFoodIdentification}
              disabled={loadingFoodItems || !image}
              className="w-full rounded-full"
            >
              {loadingFoodItems ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Identifying...
                </>
              ) : (
                 <>
                  <Icons.search className="mr-2 h-4 w-4" /> Identify Food
                 </>
              )}
            </Button>
            <Button
              onClick={handleCalorieEstimation}
              disabled={loadingCalorieEstimate || !foodItems || foodItems.length === 0}
               className="w-full rounded-full"
               variant="secondary"
            >
              {loadingCalorieEstimate ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                 <Icons.plusCircle className="mr-2 h-4 w-4" /> Estimate Calories
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display Area */}
       <div className="w-full max-w-lg space-y-4">
         {/* Loading Skeletons */}
          {(loadingFoodItems || loadingCalorieEstimate) && (
            <Card className="shadow-md rounded-lg">
              <CardHeader>
                <Skeleton className="h-6 w-3/5 rounded-md" />
                 <Skeleton className="h-4 w-4/5 rounded-md" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                 <Skeleton className="h-4 w-2/3 rounded-md" />
              </CardContent>
            </Card>
          )}

          {/* Food Items Display */}
          {!loadingFoodItems && foodItems !== null && (
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
          )}

          {/* Calorie Estimate Display */}
          {!loadingCalorieEstimate && calorieEstimate && (
            <Card className="shadow-md rounded-lg animate-in fade-in duration-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Calorie Estimation</CardTitle>
                <CardDescription>Approximate calorie count based on identified items:</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{calorieEstimate}</p>
              </CardContent>
            </Card>
          )}
       </div>
    </div>
  );
}