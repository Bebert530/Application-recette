import { useEffect, useRef, useCallback, useState } from 'react';
import { YStack, XStack, View, Card, H2, H4, Paragraph, SizableText, ScrollView, Button, Separator, Spinner } from '@blinkdotnew/mobile-ui';
import { ArrowLeft, Clock, ChefHat, Utensils, Pencil } from '@blinkdotnew/mobile-ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, Image, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Recipe { id: string; title: string; ingredients: string; ingredient_ids?: string; prep_time: string; recipe_text: string; image_url: string | null }
interface Ingredient { id: string; name: string; price: number | string }

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { data: recipe, isLoading } = useQuery({ queryKey: ['recipe', id], queryFn: () => id ? blink.db.table<Recipe>('recipes').get(id) : null, enabled: !!id });
  const { data: allIngredients } = useQuery({ queryKey: ['ingredients'], queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }) });

  useEffect(() => { if (recipe) RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, [recipe]);
  const handleDelete = useCallback(async () => { if (!id || deleting) return; setDeleting(true); try { await blink.db.table<Recipe>('recipes').delete(id); await queryClient.invalidateQueries({ queryKey: ['recipes'] }); router.back(); } catch { setDeleting(false); } }, [id, deleting, router, queryClient]);

  if (isLoading) return <View flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center"><Spinner size="large" color="#E07B3C" /></View>;
  if (!recipe) return <View flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center" gap="$4"><ChefHat size={80} color="#E07B3C30" /><Paragraph color="$color9">Recette introuvable</Paragraph><Button variant="outlined" onPress={() => router.back()}>Retour</Button></View>;

  const ingredientIds = recipe.ingredient_ids?.split(',').filter(Boolean) ?? [];
  const selectedIngredients = ingredientIds.length ? allIngredients?.filter((item) => ingredientIds.includes(item.id)) : [];
  const rawIngredients = recipe.ingredients ?? '';
  const displayIngredients = selectedIngredients?.length ? selectedIngredients.map((item) => item.name) : rawIngredients.split(',').map((item) => item.trim()).filter(Boolean);
  const rawRecipeText = recipe.recipe_text ?? '';
  const steps = rawRecipeText.split(/(?<=\d\.\s)/).filter((step) => step.trim()).map((step) => step.trim());

  return <View flex={1} backgroundColor="$color1"><ScrollView showsVerticalScrollIndicator={false}>
    <View height={280} backgroundColor="$color3" overflow="hidden">{recipe.image_url ? <Image source={{ uri: recipe.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#2A1F1A"><ChefHat size={80} color="#9A7B6B" opacity={0.3} /></YStack>}<View position="absolute" bottom={0} left={0} right={0} height={120} style={{ backgroundImage: 'linear-gradient(to top, rgba(26,18,14,1), transparent)' }} /></View>
    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, left: 16, zIndex: 10 }}><View width={40} height={40} borderRadius="$6" backgroundColor="rgba(0,0,0,0.5)" alignItems="center" justifyContent="center"><ArrowLeft size={20} color="white" /></View></TouchableOpacity>
    <RNAnimated.View style={{ opacity: fadeAnim }}><YStack paddingHorizontal="$5" paddingTop="$4" gap="$4">
      <YStack gap="$2"><H2 color="$color12" fontWeight="800">{recipe.title}</H2><XStack backgroundColor="#E07B3C15" paddingHorizontal="$4" paddingVertical="$2" borderRadius="$3" alignSelf="flex-start" alignItems="center" gap="$2"><Clock size={16} color="#E07B3C" /><SizableText size="$3" color="#E07B3C" fontWeight="600">{recipe.prep_time}</SizableText></XStack></YStack>
      <Separator borderColor="$color4" />
      <YStack gap="$3"><XStack alignItems="center" gap="$2"><ChefHat size={20} color="#E07B3C" /><H4 color="$color12" fontWeight="700">Ingrédients</H4></XStack><Card backgroundColor="$color2" bordered borderRadius="$4" padding="$4"><YStack gap="$2">{displayIngredients.map((item, index) => <XStack key={`${item}-${index}`} alignItems="center" gap="$3"><View width={6} height={6} borderRadius={3} backgroundColor="#E07B3C" /><SizableText size="$3" color="$color11">{item}</SizableText></XStack>)}</YStack></Card></YStack>
      <YStack gap="$3"><XStack alignItems="center" gap="$2"><Utensils size={20} color="#E07B3C" /><H4 color="$color12" fontWeight="700">Préparation</H4></XStack><Card backgroundColor="$color2" bordered borderRadius="$4" padding="$4"><YStack gap="$4">{steps.length ? steps.map((step, index) => <XStack key={index} gap="$3"><View width={28} height={28} borderRadius={14} backgroundColor="#E07B3C" alignItems="center" justifyContent="center"><SizableText size="$2" fontWeight="700" color="white">{index + 1}</SizableText></View><SizableText size="$3" color="$color11" flex={1} lineHeight={22}>{step}</SizableText></XStack>) : <SizableText size="$3" color="$color11">{recipe.recipe_text}</SizableText>}</YStack></Card></YStack>
      <YStack paddingVertical="$6" alignItems="center"><Button chromeless onPress={handleDelete} disabled={deleting}>{deleting ? <Spinner size="small" /> : <SizableText size="$3" color="$red10">Supprimer la recette</SizableText>}</Button></YStack>
    </YStack></RNAnimated.View>
  </ScrollView></View>;
}
