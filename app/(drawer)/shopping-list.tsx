import { useMemo, useState } from 'react';
import { YStack, XStack, View, Card, H3, H4, SizableText, ScrollView, Spinner } from '@blinkdotnew/mobile-ui';
import { Menu, ShoppingCart, Check, RotateCcw } from '@blinkdotnew/mobile-ui';
import { TouchableOpacity, Platform } from 'react-native';
import { blink } from '@/lib/blink';
import { useQuery } from '@tanstack/react-query';

interface Ingredient { id: string; name: string; lidlPrice: number | string; dinoPrice: number | string; mercaPrice: number | string }
type Store = 'Lidl' | 'Dino' | 'Merca';
const stores: Store[] = ['Lidl', 'Dino', 'Merca'];

export default function ShoppingListScreen() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }),
  });

  const grouped = useMemo(() => {
    const result: Record<Store, Ingredient[]> = { Lidl: [], Dino: [], Merca: [] };
    (ingredients ?? []).forEach((item) => {
      const prices = { Lidl: Number(item.lidlPrice), Dino: Number(item.dinoPrice), Merca: Number(item.mercaPrice) };
      const available = stores.filter((store) => prices[store] > 0);
      const store = (available.length ? available : stores).reduce((best, current) => prices[current] < prices[best] ? current : best, available[0] ?? 'Lidl');
      result[store].push(item);
    });
    return result;
  }, [ingredients]);

  const toggle = (id: string) => setChecked((current) => ({ ...current, [id]: !current[id] }));
  const reset = () => setChecked({});
  const openDrawer = () => { // @ts-ignore
    global.__drawerOpen?.();
  };

  return <View flex={1} backgroundColor="$color1">
    <XStack paddingHorizontal="$4" paddingTop={Platform.OS === 'ios' ? 56 : 16} paddingBottom="$3" alignItems="center" justifyContent="space-between">
      <XStack alignItems="center" gap="$3"><TouchableOpacity onPress={openDrawer} activeOpacity={0.7}><Menu size={24} color="#E07B3C" /></TouchableOpacity><YStack><H3 color="$color12" fontWeight="700">Liste de course</H3><SizableText size="$2" color="$color9">Les meilleurs prix par magasin</SizableText></YStack></XStack>
      <TouchableOpacity onPress={reset} activeOpacity={0.7}><RotateCcw size={19} color="#E07B3C" /></TouchableOpacity>
    </XStack>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {isLoading ? <YStack flex={1} alignItems="center" paddingVertical="$10"><Spinner color="#E07B3C" /></YStack> : <YStack gap="$4" marginTop="$2">
        {stores.map((store) => <Card key={store} backgroundColor="$color2" bordered borderRadius="$5" padding="$4"><YStack gap="$3"><XStack alignItems="center" gap="$2"><View width={10} height={10} borderRadius={5} backgroundColor={store === 'Lidl' ? '#0050AA' : store === 'Dino' ? '#E30613' : '#E07B3C'} /><H4 color="$color12">{store}</H4><SizableText size="$2" color="$color9" marginLeft="auto">{grouped[store].length} article(s)</SizableText></XStack>{grouped[store].length ? grouped[store].map((item) => <TouchableOpacity key={item.id} onPress={() => toggle(item.id)} activeOpacity={0.75}><XStack minHeight={48} alignItems="center" gap="$3" borderTopWidth={1} borderColor="$color4"><View width={24} height={24} borderRadius={7} borderWidth={1} borderColor={checked[item.id] ? '#E07B3C' : '$color7'} backgroundColor={checked[item.id] ? '#E07B3C' : 'transparent'} alignItems="center" justifyContent="center">{checked[item.id] && <Check size={15} color="white" />}</View><SizableText size="$3" color={checked[item.id] ? '$color9' : '$color11'} textDecorationLine={checked[item.id] ? 'line-through' : 'none'} flex={1}>{item.name}</SizableText></XStack></TouchableOpacity>) : <SizableText size="$3" color="$color9">Aucun ingrédient dans ce magasin.</SizableText>}</YStack></Card>)}
      </YStack>}
    </ScrollView>
  </View>;
}
