import { useState, useEffect, useRef } from 'react';
import { YStack, XStack, View, H3, H4, SizableText, ScrollView, Input, Button, Spinner } from '@blinkdotnew/mobile-ui';
import { Menu, Pencil, Trash2, X, Check, ShoppingBasket } from '@blinkdotnew/mobile-ui';
import { TouchableOpacity, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Ingredient { id: string; name: string; price: number | string; lidlPrice: number | string; dinoPrice: number | string; mercaPrice: number | string }
interface Prices { lidlPrice: string; dinoPrice: string; mercaPrice: string }

export default function IngredientsScreen() {
  const [name, setName] = useState('');
  const [prices, setPrices] = useState<Prices>({ lidlPrice: '', dinoPrice: '', mercaPrice: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const queryClient = useQueryClient();
  const { data: ingredients, isLoading } = useQuery({ queryKey: ['ingredients'], queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }) });

  useEffect(() => { RNAnimated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start(); }, []);
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Le nom est requis');
      const values = Object.fromEntries(Object.entries(prices).map(([key, value]) => [key, Number(value.replace(',', '.')) || 0]));
      if (Object.values(values).some((value) => value < 0)) throw new Error('Les prix doivent être positifs');
      const table = blink.db.table<Ingredient>('ingredients');
      return editingId ? table.update(editingId, { name: name.trim(), ...values }) : table.create({ name: name.trim(), ...values });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ingredients'] }); resetForm(); },
    onError: (e: Error) => setError(e.message || 'Erreur lors de l’enregistrement'),
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => blink.db.table<Ingredient>('ingredients').delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }), onError: (e: Error) => setError(e.message) });
  const resetForm = () => { setEditingId(null); setName(''); setPrices({ lidlPrice: '', dinoPrice: '', mercaPrice: '' }); setError(''); };
  const beginEdit = (item: Ingredient) => { setEditingId(item.id); setName(item.name); setPrices({ lidlPrice: String(item.lidlPrice ?? ''), dinoPrice: String(item.dinoPrice ?? ''), mercaPrice: String(item.mercaPrice ?? '') }); setError(''); };
  const openDrawer = () => { // @ts-ignore
    global.__drawerOpen?.();
  };
  const priceCell = (value: number | string) => Number(value) > 0 ? `${Number(value).toFixed(2)} €` : '—';

  return <View flex={1} backgroundColor="$color1">
    <XStack paddingHorizontal="$4" paddingTop={Platform.OS === 'ios' ? 56 : 16} paddingBottom="$3" alignItems="center" gap="$3"><TouchableOpacity onPress={openDrawer} activeOpacity={0.7}><Menu size={24} color="#E07B3C" /></TouchableOpacity><YStack><H3 color="$color12" fontWeight="700">Ingrédients</H3><SizableText size="$2" color="$color9">Prix par enseigne</SizableText></YStack></XStack>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 40 }} horizontal={false} showsVerticalScrollIndicator={false}>
      <YStack gap="$4" marginTop="$2">
        <YStack gap="$2"><H4 color="$color12">{editingId ? 'Modifier un ingrédient' : 'Ajouter un ingrédient'}</H4><XStack gap="$2" alignItems="center"><Input flex={1.35} value={name} onChangeText={setName} placeholder="Ingrédient" placeholderTextColor="$color9" backgroundColor="$color2" borderColor="$color4" outlineStyle="none" /><Input flex={1} value={prices.lidlPrice} onChangeText={(value) => setPrices((p) => ({ ...p, lidlPrice: value }))} placeholder="Lidl" placeholderTextColor="$color9" keyboardType="decimal-pad" backgroundColor="$color2" borderColor="$color4" outlineStyle="none" /><Input flex={1} value={prices.dinoPrice} onChangeText={(value) => setPrices((p) => ({ ...p, dinoPrice: value }))} placeholder="Dino" placeholderTextColor="$color9" keyboardType="decimal-pad" backgroundColor="$color2" borderColor="$color4" outlineStyle="none" /><Input flex={1} value={prices.mercaPrice} onChangeText={(value) => setPrices((p) => ({ ...p, mercaPrice: value }))} placeholder="Merca" placeholderTextColor="$color9" keyboardType="decimal-pad" backgroundColor="$color2" borderColor="$color4" outlineStyle="none" /><Button height={48} backgroundColor="#E07B3C" onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending}>{saveMutation.isPending ? <Spinner size="small" color="white" /> : <Check size={19} color="white" />}</Button>{editingId && <Button height={48} chromeless onPress={resetForm}><X size={19} color="$color9" /></Button>}</XStack>{error && <SizableText size="$2" color="$red10">{error}</SizableText>}</YStack>
        <View borderWidth={1} borderColor="$color4" borderRadius="$4" overflow="hidden" backgroundColor="$color2"><XStack backgroundColor="$color3" minHeight={48} alignItems="center" paddingHorizontal="$2"><SizableText width="34%" size="$2" fontWeight="700" color="$color11">Ingrédient</SizableText><SizableText width="18%" size="$2" fontWeight="700" color="#6B8ECA">Lidl</SizableText><SizableText width="18%" size="$2" fontWeight="700" color="#D46A6A">Dino</SizableText><SizableText width="18%" size="$2" fontWeight="700" color="#E07B3C">Merca</SizableText><View width="12%" /></XStack>{isLoading ? <YStack padding="$6" alignItems="center"><Spinner color="#E07B3C" /></YStack> : <RNAnimated.View style={{ opacity: fadeAnim }}>{ingredients?.map((item) => <XStack key={item.id} minHeight={58} alignItems="center" paddingHorizontal="$2" borderTopWidth={1} borderColor="$color4"><SizableText width="34%" size="$3" color="$color12" numberOfLines={2}>{item.name}</SizableText><SizableText width="18%" size="$3" color="$color11">{priceCell(item.lidlPrice)}</SizableText><SizableText width="18%" size="$3" color="$color11">{priceCell(item.dinoPrice)}</SizableText><SizableText width="18%" size="$3" color="$color11">{priceCell(item.mercaPrice)}</SizableText><XStack width="12%" gap="$1"><TouchableOpacity onPress={() => beginEdit(item)} activeOpacity={0.7}><Pencil size={16} color="#E07B3C" /></TouchableOpacity><TouchableOpacity onPress={() => deleteMutation.mutate(item.id)} activeOpacity={0.7}><Trash2 size={16} color="$red10" /></TouchableOpacity></XStack></XStack>)}</RNAnimated.View>}</View>
      </YStack>
    </ScrollView>
  </View>;
}
