import { useState } from 'react';
import { YStack, XStack, View, Card, H3, SizableText, ScrollView, Button, Input, Spinner } from '@blinkdotnew/mobile-ui';
import { Clock, ChefHat, FileText, ArrowLeft, Check } from '@blinkdotnew/mobile-ui';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Platform } from 'react-native';
import { blink } from '@/lib/blink';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Ingredient { id: string; name: string; price: number | string }
interface RecipeInput { title: string; ingredientIds: string; ingredients: string; prepTime: string; recipeText: string }

export default function AddRecipeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }),
  });

  const addMutation = useMutation({
    mutationFn: (data: RecipeInput) => blink.db.table<RecipeInput>('recipes').create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipes'] }); router.back(); },
    onError: (error: Error) => setErrors({ submit: error.message || 'Impossible d’enregistrer la recette.' }),
  });
  const toggleIngredient = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
  const submit = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Le titre est requis';
    if (!selectedIds.length) next.ingredients = 'Sélectionnez au moins un ingrédient';
    if (!prepTime.trim()) next.prepTime = 'Le temps de préparation est requis';
    if (!recipeText.trim()) next.recipeText = 'La préparation est requise';
    if (Object.keys(next).length) { setErrors(next); return; }
    const selected = ingredients?.filter((item) => selectedIds.includes(item.id)) ?? [];
    addMutation.mutate({ title: title.trim(), ingredientIds: selectedIds.join(','), ingredients: selected.map((item) => item.name).join(', '), prepTime: prepTime.trim(), recipeText: recipeText.trim() });
  };

  return <View flex={1} backgroundColor="$color1">
    <XStack paddingHorizontal="$4" paddingTop={Platform.OS === 'ios' ? 56 : 16} paddingBottom="$3" alignItems="center" justifyContent="space-between">
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}><XStack alignItems="center" gap="$2"><ArrowLeft size={20} color="$color9" /><SizableText size="$3" color="$color9">Annuler</SizableText></XStack></TouchableOpacity>
      <H3 color="$color12" fontWeight="700">Nouvelle recette</H3><View width={60} />
    </XStack>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <YStack gap="$5" marginTop="$2">
        <Field icon={<FileText size={16} color="#E07B3C" />} label="Titre de la recette" value={title} onChange={setTitle} placeholder="Ex: Pâtes Carbonara" error={errors.title} />
        <YStack gap="$2"><XStack alignItems="center" gap="$2"><ChefHat size={16} color="#E07B3C" /><SizableText size="$3" fontWeight="600" color="$color12">Ingrédients (labels)</SizableText></XStack>
          <Card backgroundColor="$color2" bordered borderRadius="$4" padding="$3"><YStack gap="$1">
            {isLoading ? <Spinner color="#E07B3C" /> : ingredients?.map((item) => { const checked = selectedIds.includes(item.id); return <TouchableOpacity key={item.id} onPress={() => toggleIngredient(item.id)} activeOpacity={0.75}><XStack minHeight={48} alignItems="center" gap="$3" paddingHorizontal="$2"><View width={24} height={24} borderRadius={7} borderWidth={1} borderColor={checked ? '#E07B3C' : '$color7'} backgroundColor={checked ? '#E07B3C' : 'transparent'} alignItems="center" justifyContent="center">{checked && <Check size={15} color="white" />}</View><SizableText size="$3" color="$color11" flex={1}>{item.name}</SizableText><SizableText size="$2" color="#E07B3C">{Number(item.price).toFixed(2)} €</SizableText></XStack></TouchableOpacity>; })}
            {!isLoading && !ingredients?.length && <SizableText color="$color9">Ajoutez d’abord des ingrédients.</SizableText>}
          </YStack></Card>
          {selectedIds.length > 0 && <SizableText size="$2" color="#E07B3C">{selectedIds.length} ingrédient(s) sélectionné(s)</SizableText>}
          {errors.ingredients && <SizableText size="$2" color="$red10">{errors.ingredients}</SizableText>}
        </YStack>
        <Field icon={<Clock size={16} color="#E07B3C" />} label="Temps de préparation" value={prepTime} onChange={setPrepTime} placeholder="Ex: 30 min" error={errors.prepTime} />
        <YStack gap="$2"><XStack alignItems="center" gap="$2"><FileText size={16} color="#E07B3C" /><SizableText size="$3" fontWeight="600" color="$color12">Préparation</SizableText></XStack><Input value={recipeText} onChangeText={setRecipeText} placeholder="Étapes de préparation détaillées..." placeholderTextColor="$color9" multiline numberOfLines={6} minHeight={140} textAlignVertical="top" backgroundColor="$color2" borderColor={errors.recipeText ? '$red9' : '$color4'} outlineStyle="none" />{errors.recipeText && <SizableText size="$2" color="$red10">{errors.recipeText}</SizableText>}</YStack>
        {errors.submit && <SizableText color="$red10">{errors.submit}</SizableText>}
        <Button width="100%" height={52} borderRadius="$5" backgroundColor="#E07B3C" onPress={submit} disabled={addMutation.isPending}>{addMutation.isPending ? <Spinner color="white" /> : <SizableText size="$4" fontWeight="600" color="white">Enregistrer la recette</SizableText>}</Button>
      </YStack>
    </ScrollView>
  </View>;
}

function Field({ icon, label, value, onChange, placeholder, error }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void; placeholder: string; error?: string }) {
  return <YStack gap="$2"><XStack alignItems="center" gap="$2">{icon}<SizableText size="$3" fontWeight="600" color="$color12">{label}</SizableText></XStack><Input value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="$color9" backgroundColor="$color2" borderColor={error ? '$red9' : '$color4'} outlineStyle="none" />{error && <SizableText size="$2" color="$red10">{error}</SizableText>}</YStack>;
}