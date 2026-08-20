import { useEffect, useRef, useCallback, useState } from 'react';
import { YStack, XStack, View, Card, H2, H3, H4, Paragraph, SizableText, ScrollView, Button, Separator, Spinner, Input } from '@blinkdotnew/mobile-ui';
import { ArrowLeft, Clock, ChefHat, Utensils, Pencil, Check, X, Tag } from '@blinkdotnew/mobile-ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, Image, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const APPORTS = ['Glucides', 'Protéines', 'Lipides', 'Vitamines', 'Légumes', 'Fer', 'Magnésium', 'Avant sport', 'Après sport'];
interface Recipe { id: string; title: string; ingredients: string; ingredientIds?: string; prepTime: string; recipeText: string; imageUrl: string | null; apports?: string }
interface Ingredient { id: string; name: string; price: number | string }
interface RecipePatch { title: string; ingredientIds: string; ingredients: string; prepTime: string; recipeText: string; apports: string }

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApports, setSelectedApports] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { data: recipe, isLoading } = useQuery({ queryKey: ['recipe', id], queryFn: () => id ? blink.db.table<Recipe>('recipes').get(id) : null, enabled: !!id });
  const { data: allIngredients } = useQuery({ queryKey: ['ingredients'], queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }) });

  useEffect(() => {
    if (!recipe) return;
    RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setTitle(recipe.title || '');
    setSelectedIds((recipe.ingredientIds || '').split(',').filter(Boolean));
    setSelectedApports((recipe.apports || '').split(',').map((item) => item.trim()).filter(Boolean));
    setPrepTime(recipe.prepTime || '');
    setRecipeText(recipe.recipeText || '');
  }, [recipe]);

  const updateMutation = useMutation({
    mutationFn: (patch: RecipePatch) => blink.db.table<Recipe>('recipes').update(id!, patch),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['recipe', id] }); await queryClient.invalidateQueries({ queryKey: ['recipes'] }); setEditing(false); setError(''); },
    onError: (caught: Error) => setError(caught.message || 'Impossible de modifier la recette.'),
  });
  const handleSave = () => {
    if (!title.trim() || !selectedIds.length || !prepTime.trim() || !recipeText.trim()) { setError('Remplissez le titre, les ingrédients, le temps et la préparation.'); return; }
    const names = allIngredients?.filter((item) => selectedIds.includes(item.id)).map((item) => item.name) ?? [];
    updateMutation.mutate({ title: title.trim(), ingredientIds: selectedIds.join(','), ingredients: names.join(', '), prepTime: prepTime.trim(), recipeText: recipeText.trim(), apports: selectedApports.join(', ') });
  };
  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const handleDelete = useCallback(async () => { if (!id || deleting) return; setDeleting(true); try { await blink.db.table<Recipe>('recipes').delete(id); await queryClient.invalidateQueries({ queryKey: ['recipes'] }); router.back(); } catch { setDeleting(false); } }, [id, deleting, router, queryClient]);

  if (isLoading) return <View flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center"><Spinner size="large" color="#E07B3C" /></View>;
  if (!recipe) return <View flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center" gap="$4"><ChefHat size={80} color="#E07B3C30" /><Paragraph color="$color9">Recette introuvable</Paragraph><Button variant="outlined" onPress={() => router.back()}>Retour</Button></View>;

  const ingredientIds = (recipe.ingredientIds || '').split(',').filter(Boolean);
  const linked = ingredientIds.length ? allIngredients?.filter((item) => ingredientIds.includes(item.id)) : [];
  const displayIngredients = linked?.length ? linked.map((item) => item.name) : (recipe.ingredients || '').split(',').map((item) => item.trim()).filter(Boolean);
  const steps = (recipe.recipeText || '').split(/(?<=\d\.\s)/).filter((step) => step.trim()).map((step) => step.trim());

  return <View flex={1} backgroundColor="$color1"><ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <View height={220} backgroundColor="$color3" overflow="hidden">{recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#2A1F1A"><ChefHat size={72} color="#9A7B6B" opacity={0.3} /></YStack>}</View>
    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ position: 'absolute', top: Platform.OS === 'ios' ? 56 : 16, left: 16, zIndex: 10 }}><View width={40} height={40} borderRadius="$6" backgroundColor="rgba(0,0,0,0.5)" alignItems="center" justifyContent="center"><ArrowLeft size={20} color="white" /></View></TouchableOpacity>
    <RNAnimated.View style={{ opacity: fadeAnim }}><YStack paddingHorizontal="$5" paddingTop="$4" gap="$4">
      {!editing ? <>
        <XStack alignItems="flex-start" justifyContent="space-between" gap="$3"><YStack gap="$2" flex={1}><H2 color="$color12" fontWeight="800">{recipe.title}</H2><XStack backgroundColor="#E07B3C15" paddingHorizontal="$4" paddingVertical="$2" borderRadius="$3" alignSelf="flex-start" alignItems="center" gap="$2"><Clock size={16} color="#E07B3C" /><SizableText size="$3" color="#E07B3C" fontWeight="600">{recipe.prepTime}</SizableText></XStack></YStack><Button backgroundColor="#E07B3C" onPress={() => setEditing(true)} icon={<Pencil size={16} color="white" />}><SizableText color="white" fontWeight="700">Modifier</SizableText></Button></XStack>
        <Separator borderColor="$color4" />
        <Section title="Ingrédients" icon={<ChefHat size={20} color="#E07B3C" />}><Card backgroundColor="$color2" bordered borderRadius="$4" padding="$4"><YStack gap="$2">{displayIngredients.map((item, index) => <XStack key={`${item}-${index}`} alignItems="center" gap="$3"><View width={6} height={6} borderRadius={3} backgroundColor="#E07B3C" /><SizableText size="$3" color="$color11">{item}</SizableText></XStack>)}</YStack></Card></Section>
        <Section title="Préparation" icon={<Utensils size={20} color="#E07B3C" />}><Card backgroundColor="$color2" bordered borderRadius="$4" padding="$4"><YStack gap="$4">{steps.length ? steps.map((step, index) => <XStack key={index} gap="$3"><View width={28} height={28} borderRadius={14} backgroundColor="#E07B3C" alignItems="center" justifyContent="center"><SizableText size="$2" fontWeight="700" color="white">{index + 1}</SizableText></View><SizableText size="$3" color="$color11" flex={1} lineHeight={22}>{step}</SizableText></XStack>) : <SizableText size="$3" color="$color11">{recipe.recipeText}</SizableText>}</YStack></Card></Section>
        <Section title="Apports" icon={<Tag size={20} color="#E07B3C" />}><XStack flexWrap="wrap" gap="$2">{(recipe.apports || '').split(',').map((item) => item.trim()).filter(Boolean).map((item) => <XStack key={item} backgroundColor="#E07B3C18" borderRadius={18} paddingHorizontal="$3" paddingVertical="$2"><SizableText size="$2" color="#E07B3C">{item}</SizableText></XStack>)}</XStack></Section>
      </> : <EditForm title={title} setTitle={setTitle} selectedIds={selectedIds} toggleIngredient={(value) => toggle(value, selectedIds, setSelectedIds)} ingredients={allIngredients} prepTime={prepTime} setPrepTime={setPrepTime} recipeText={recipeText} setRecipeText={setRecipeText} selectedApports={selectedApports} toggleApport={(value) => toggle(value, selectedApports, setSelectedApports)} onSave={handleSave} onCancel={() => { setEditing(false); setError(''); }} saving={updateMutation.isPending} error={error} />}
      {!editing && <YStack paddingVertical="$6" alignItems="center"><Button chromeless onPress={handleDelete} disabled={deleting}>{deleting ? <Spinner size="small" /> : <SizableText size="$3" color="$red10">Supprimer la recette</SizableText>}</Button></YStack>}
    </YStack></RNAnimated.View>
  </ScrollView></View>;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <YStack gap="$3"><XStack alignItems="center" gap="$2">{icon}<H4 color="$color12" fontWeight="700">{title}</H4></XStack>{children}</YStack>; }

function EditForm({ title, setTitle, selectedIds, toggleIngredient, ingredients, prepTime, setPrepTime, recipeText, setRecipeText, selectedApports, toggleApport, onSave, onCancel, saving, error }: { title: string; setTitle: (value: string) => void; selectedIds: string[]; toggleIngredient: (value: string) => void; ingredients?: Ingredient[]; prepTime: string; setPrepTime: (value: string) => void; recipeText: string; setRecipeText: (value: string) => void; selectedApports: string[]; toggleApport: (value: string) => void; onSave: () => void; onCancel: () => void; saving: boolean; error: string }) {
  return <YStack gap="$4"><H3 color="$color12">Modifier la recette</H3><Input value={title} onChangeText={setTitle} placeholder="Titre" backgroundColor="$color2" outlineStyle="none" /><FieldLabel label="Ingrédients" icon={<ChefHat size={16} color="#E07B3C" />}><XStack flexWrap="wrap" gap="$2">{ingredients?.map((item) => { const active = selectedIds.includes(item.id); return <TouchableOpacity key={item.id} onPress={() => toggleIngredient(item.id)}><XStack backgroundColor={active ? '#E07B3C' : '$color3'} borderRadius={18} paddingHorizontal="$3" paddingVertical="$2"><SizableText size="$2" color={active ? 'white' : '$color10'}>{item.name}</SizableText></XStack></TouchableOpacity>; })}</XStack></FieldLabel><FieldLabel label="Apports" icon={<Tag size={16} color="#E07B3C" />}><XStack flexWrap="wrap" gap="$2">{APPORTS.map((item) => { const active = selectedApports.includes(item); return <TouchableOpacity key={item} onPress={() => toggleApport(item)}><XStack backgroundColor={active ? '#E07B3C' : '$color3'} borderRadius={18} paddingHorizontal="$3" paddingVertical="$2"><SizableText size="$2" color={active ? 'white' : '$color10'}>{item}</SizableText></XStack></TouchableOpacity>; })}</XStack></FieldLabel><FieldLabel label="Temps de préparation" icon={<Clock size={16} color="#E07B3C" />}><Input value={prepTime} onChangeText={setPrepTime} placeholder="Ex: 30 min" backgroundColor="$color2" outlineStyle="none" /></FieldLabel><FieldLabel label="Préparation" icon={<Utensils size={16} color="#E07B3C" />}><Input value={recipeText} onChangeText={setRecipeText} placeholder="Étapes..." multiline minHeight={150} textAlignVertical="top" backgroundColor="$color2" outlineStyle="none" /></FieldLabel>{error && <SizableText color="$red10">{error}</SizableText>}<XStack gap="$3"><Button flex={1} backgroundColor="#E07B3C" onPress={onSave} disabled={saving}>{saving ? <Spinner color="white" /> : <XStack alignItems="center" gap="$2"><Check size={17} color="white" /><SizableText color="white" fontWeight="700">Enregistrer</SizableText></XStack>}</Button><Button flex={1} chromeless onPress={onCancel}><X size={18} color="$color9" /><SizableText color="$color9">Annuler</SizableText></Button></XStack></YStack>;
}

function FieldLabel({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <YStack gap="$2"><XStack alignItems="center" gap="$2">{icon}<SizableText color="$color12" fontWeight="600">{label}</SizableText></XStack>{children}</YStack>; }
