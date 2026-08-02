import { useState, useRef } from 'react';
import {
  YStack,
  XStack,
  View,
  Card,
  H3,
  H4,
  Paragraph,
  SizableText,
  ScrollView,
  Button,
  Input,
  Spinner,
} from '@blinkdotnew/mobile-ui';
import { X, Clock, ChefHat, FileText, ArrowLeft, Check } from '@blinkdotnew/mobile-ui';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RecipeInput {
  title: string;
  ingredients: string;
  prep_time: string;
  recipe_text: string;
}

export default function AddRecipeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RecipeInput, string>>>({});
  const successScale = useRef(new RNAnimated.Value(0)).current;

  const addMutation = useMutation({
    mutationFn: async (data: RecipeInput) => {
      await blink.db.table<RecipeInput>('recipes').create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      // Show success animation then go back
      RNAnimated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 150,
      }).start(() => {
        setTimeout(() => router.back(), 400);
      });
    },
  });

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RecipeInput, string>> = {};
    if (!title.trim()) newErrors.title = 'Le titre est requis';
    if (!ingredients.trim()) newErrors.ingredients = 'Les ingrédients sont requis';
    if (!prepTime.trim()) newErrors.prep_time = 'Le temps de préparation est requis';
    if (!recipeText.trim()) newErrors.recipe_text = 'La recette est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addMutation.mutate({
      title: title.trim(),
      ingredients: ingredients.trim(),
      prep_time: prepTime.trim(),
      recipe_text: recipeText.trim(),
    });
  };

  return (
    <View flex={1} backgroundColor="$color1">
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingTop={Platform.OS === 'ios' ? 56 : 16}
        paddingBottom="$3"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$color1"
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <XStack alignItems="center" gap="$2">
            <ArrowLeft size={20} color="$color9" />
            <SizableText size="$3" color="$color9">
              Annuler
            </SizableText>
          </XStack>
        </TouchableOpacity>
        <H3 color="$color12" fontWeight="700">
          Nouvelle recette
        </H3>
        <View width={60} />
      </XStack>

      {/* Success Overlay */}
      {addMutation.isSuccess && (
        <RNAnimated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(26,18,14,0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <YStack alignItems="center" gap="$4">
            <View
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor="#E07B3C"
              alignItems="center"
              justifyContent="center"
            >
              <Check size={36} color="white" />
            </View>
            <H3 color="white" textAlign="center">
              Recette ajoutée !
            </H3>
            <SizableText color="$color9" textAlign="center">
              Votre recette a été enregistrée
            </SizableText>
          </YStack>
        </RNAnimated.View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap="$5" marginTop="$2">
          {/* Title */}
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2">
              <FileText size={16} color="#E07B3C" />
              <SizableText size="$3" fontWeight="600" color="$color12">
                Titre de la recette
              </SizableText>
            </XStack>
            <Input
              placeholder="Ex: Pâtes Carbonara"
              placeholderTextColor="$color9"
              value={title}
              onChangeText={setTitle}
              size="$4"
              backgroundColor="$color2"
              borderRadius="$4"
              borderWidth={1}
              borderColor={errors.title ? '$red9' : '$color4'}
              outlineStyle="none"
            />
            {errors.title && (
              <SizableText size="$2" color="$red10">
                {errors.title}
              </SizableText>
            )}
          </YStack>

          {/* Ingredients */}
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2">
              <ChefHat size={16} color="#E07B3C" />
              <SizableText size="$3" fontWeight="600" color="$color12">
                Ingrédients
              </SizableText>
            </XStack>
            <Input
              placeholder="Ex: Spaghetti, Guanciale, Œufs, Pecorino"
              placeholderTextColor="$color9"
              value={ingredients}
              onChangeText={setIngredients}
              size="$4"
              backgroundColor="$color2"
              borderRadius="$4"
              borderWidth={1}
              borderColor={errors.ingredients ? '$red9' : '$color4'}
              outlineStyle="none"
            />
            {errors.ingredients && (
              <SizableText size="$2" color="$red10">
                {errors.ingredients}
              </SizableText>
            )}
          </YStack>

          {/* Prep Time */}
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2">
              <Clock size={16} color="#E07B3C" />
              <SizableText size="$3" fontWeight="600" color="$color12">
                Temps de préparation
              </SizableText>
            </XStack>
            <Input
              placeholder="Ex: 30 min"
              placeholderTextColor="$color9"
              value={prepTime}
              onChangeText={setPrepTime}
              size="$4"
              backgroundColor="$color2"
              borderRadius="$4"
              borderWidth={1}
              borderColor={errors.prep_time ? '$red9' : '$color4'}
              outlineStyle="none"
            />
            {errors.prep_time && (
              <SizableText size="$2" color="$red10">
                {errors.prep_time}
              </SizableText>
            )}
          </YStack>

          {/* Recipe Text */}
          <YStack gap="$2">
            <XStack alignItems="center" gap="$2">
              <FileText size={16} color="#E07B3C" />
              <SizableText size="$3" fontWeight="600" color="$color12">
                Préparation
              </SizableText>
            </XStack>
            <Input
              placeholder="Étapes de préparation détaillées..."
              placeholderTextColor="$color9"
              value={recipeText}
              onChangeText={setRecipeText}
              size="$4"
              backgroundColor="$color2"
              borderRadius="$4"
              borderWidth={1}
              borderColor={errors.recipe_text ? '$red9' : '$color4'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              minHeight={140}
              outlineStyle="none"
            />
            {errors.recipe_text && (
              <SizableText size="$2" color="$red10">
                {errors.recipe_text}
              </SizableText>
            )}
          </YStack>

          {/* Submit */}
          <Button
            theme="active"
            width="100%"
            height={52}
            borderRadius="$5"
            backgroundColor="#E07B3C"
            onPress={handleSubmit}
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? (
              <XStack alignItems="center" gap="$3">
                <Spinner size="small" color="white" />
                <SizableText size="$4" fontWeight="600" color="white">
                  Enregistrement...
                </SizableText>
              </XStack>
            ) : (
              <SizableText size="$4" fontWeight="600" color="white">
                Enregistrer la recette
              </SizableText>
            )}
          </Button>
        </YStack>
      </ScrollView>
    </View>
  );
}
