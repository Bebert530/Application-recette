import { useEffect, useMemo, useRef, useState } from 'react';
import { YStack, XStack, View, Card, H3, H4, Paragraph, SizableText, ScrollView, Input } from '@blinkdotnew/mobile-ui';
import { Search, Clock, ChefHat, X, Menu, SlidersHorizontal, Check } from '@blinkdotnew/mobile-ui';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Image, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useQuery } from '@tanstack/react-query';

const APPORTS = ['Glucides','Protéines','Lipides','Vitamines','Légumes','Fer','Magnésium','Avant sport','Après sport'];
interface Recipe { id: string; title: string; ingredients: string; prepTime: string; recipeText: string; imageUrl: string | null; apports?: string }
interface Ingredient { id: string; name: string }

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [apportFilter, setApportFilter] = useState('');
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const { data: recipes } = useQuery({ queryKey: ['recipes'], queryFn: () => blink.db.table<Recipe>('recipes').list({ orderBy: { createdAt: 'desc' } }) });
  const { data: ingredients } = useQuery({ queryKey: ['ingredients'], queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }) });
  useEffect(() => { RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, []);
  const filtered = useMemo(() => (recipes ?? []).filter((recipe) => {
    const needle = query.toLowerCase().trim();
    const matchesText = !needle || recipe.title.toLowerCase().includes(needle) || recipe.ingredients.toLowerCase().includes(needle);
    const matchesIngredient = !ingredientFilter || recipe.ingredients.toLowerCase().includes(ingredientFilter.toLowerCase());
    const matchesApport = !apportFilter || (recipe.apports || '').toLowerCase().includes(apportFilter.toLowerCase());
    return matchesText && matchesIngredient && matchesApport;
  }), [recipes, query, ingredientFilter, apportFilter]);
  const openDrawer = () => { // @ts-ignore
    global.__drawerOpen?.();
  };
  return <View flex={1} backgroundColor="$color1">
    <XStack paddingHorizontal="$4" paddingTop={Platform.OS === 'ios' ? 56 : 16} paddingBottom="$3" alignItems="center" gap="$3"><TouchableOpacity onPress={openDrawer}><Menu size={24} color="#E07B3C" /></TouchableOpacity><H3 color="$color12" fontWeight="700">Recherche</H3></XStack>
    <YStack paddingHorizontal="$4" gap="$3" paddingBottom="$3">
      <XStack backgroundColor="$color2" borderRadius="$6" paddingHorizontal="$4" paddingVertical={8} alignItems="center" gap="$3" borderWidth={1} borderColor="$color4"><Search size={18} color="$color9" /><Input flex={1} backgroundColor="transparent" borderWidth={0} placeholder="Titre ou ingrédient..." placeholderTextColor="$color9" value={query} onChangeText={setQuery} outlineStyle="none" />{query && <TouchableOpacity onPress={() => setQuery('')}><X size={18} color="$color9" /></TouchableOpacity>}</XStack>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><XStack backgroundColor="#E07B3C18" borderRadius={20} paddingHorizontal="$3" paddingVertical="$2" alignItems="center" gap="$2"><SlidersHorizontal size={14} color="#E07B3C" /><SizableText size="$2" color="#E07B3C">Ingrédient :</SizableText></XStack>{ingredients?.map((item) => <TouchableOpacity key={item.id} onPress={() => setIngredientFilter(ingredientFilter === item.name ? '' : item.name)}><XStack backgroundColor={ingredientFilter === item.name ? '#E07B3C' : '$color3'} borderRadius={20} paddingHorizontal="$3" paddingVertical="$2"><SizableText size="$2" color={ingredientFilter === item.name ? 'white' : '$color10'}>{item.name}</SizableText></XStack></TouchableOpacity>)}</ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><SizableText size="$2" color="$color9" paddingVertical="$2">Apports :</SizableText>{APPORTS.map((item) => <TouchableOpacity key={item} onPress={() => setApportFilter(apportFilter === item ? '' : item)}><XStack backgroundColor={apportFilter === item ? '#E07B3C' : '$color3'} borderRadius={20} paddingHorizontal="$3" paddingVertical="$2"><SizableText size="$2" color={apportFilter === item ? 'white' : '$color10'}>{item}</SizableText></XStack></TouchableOpacity>)}</ScrollView>
    </YStack>
    <RNAnimated.View style={{ flex: 1, opacity: fadeAnim }}><ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>{filtered.length === 0 ? <YStack alignItems="center" paddingVertical="$10" gap="$4"><Search size={60} color="#E07B3C20" /><H4 color="$color12">Aucun résultat</H4><Paragraph color="$color9">Modifiez vos filtres ou votre recherche.</Paragraph></YStack> : <YStack gap="$4">{filtered.map((recipe) => <TouchableOpacity key={recipe.id} activeOpacity={0.95} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}><Card elevation={3} bordered borderRadius="$5" backgroundColor="$color2" overflow="hidden"><XStack><View width={100} height={100} backgroundColor="$color3">{recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={{ width: 100, height: 100 }} resizeMode="cover" /> : <YStack flex={1} alignItems="center" justifyContent="center"><ChefHat size={32} color="#9A7B6B" /></YStack>}</View><Card.Footer padded flex={1}><YStack gap="$2" flex={1} justifyContent="center"><SizableText size="$4" fontWeight="700" color="$color12" numberOfLines={1}>{recipe.title}</SizableText><XStack gap="$2" alignItems="center"><Clock size={12} color="#E07B3C" /><SizableText size="$2" color="#E07B3C">{recipe.prepTime}</SizableText></XStack><SizableText size="$2" color="$color9" numberOfLines={1}>{recipe.ingredients}</SizableText></YStack></Card.Footer></XStack></Card></TouchableOpacity>)}</YStack>}</ScrollView></RNAnimated.View>
  </View>;
}
