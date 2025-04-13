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
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFoodIdentification = async () => {
    if (!image) {
      toast({
        title: 'No image uploaded',
        description: 'Please upload an image before identifying food items.',
      });
      return;
    }

    setLoadingFoodItems(true);
    setFoodItems(null); // Reset previous results

    try {
      const result = await identifyFoodItems({photoUrl: image});
      setFoodItems(result.foodItems);
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
        title: 'No food items identified',
        description: 'Please identify food items before estimating calories.',
      });
      return;
    }

    setLoadingCalorieEstimate(true);
    setCalorieEstimate(null); // Reset previous results

    try {
      // Join the food items into a comma-separated string
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
    <div className="flex flex-col items-center justify-start min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">CalorieSnap</h1>

      {/* Image Upload */}
      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Upload Food Image</CardTitle>
          <CardDescription>Upload an image of your food to identify the items and estimate calories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
          {image && (
            <img src={image} alt="Uploaded Food" className="max-h-48 object-contain rounded-md shadow-sm" />
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-4">
        <Button onClick={handleFoodIdentification} disabled={loadingFoodItems || !image}>
          {loadingFoodItems ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Identifying...
            </>
          ) : (
            'Identify Food Items'
          )}
        </Button>
        <Button onClick={handleCalorieEstimation} disabled={loadingCalorieEstimate || !foodItems}>
          {loadingCalorieEstimate ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Estimating...
            </>
          ) : (
            'Estimate Calories'
          )}
        </Button>
      </div>

      {/* Results Display */}
      {foodItems && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Identified Food Items</CardTitle>
            <CardDescription>Here are the food items identified in your image:</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFoodItems ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <ul>
                {foodItems.map((item, index) => (
                  <li key={index} className="mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {calorieEstimate && (
        <Card className="w-full max-w-md mt-4">
          <CardHeader>
            <CardTitle>Calorie Estimation</CardTitle>
            <CardDescription>Estimated calorie count for the identified food items:</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCalorieEstimate ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p>{calorieEstimate}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
