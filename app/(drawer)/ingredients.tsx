import { useState, useEffect, useRef } from 'react';
import {
  YStack,
  XStack,
  View,
  Card,
  H3,
  H4,
  SizableText,
  ScrollView,
  Input,
  Button,
  Spinner,
  Paragraph,
} from '@blinkdotnew/mobile-ui';
import { Menu, Plus, Pencil, Trash2, X, Check, ShoppingBasket } from '@blinkdotnew/mobile-ui';
import { TouchableOpacity, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Ingredient {
  id: string;
  name: string;
  price: number | string;
}

export default function IngredientsScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const queryClient = useQueryClient();

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => blink.db.table<Ingredient>('ingredients').list({ orderBy: { name: 'asc' } }),
  });

  useEffect(() => {
    RNAnimated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsedPrice = Number(price.replace(',', '.'));
      if (!name.trim()) throw new Error('Le nom est requis');
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) throw new Error('Prix invalide');
      if (editingId) {
        return blink.db.table<Ingredient>('ingredients').update(editingId, {
          name: name.trim(),
          price: parsedPrice,
        });
      }
      return blink.db.table<Ingredient>('ingredients').create({
        name: name.trim(),
        price: parsedPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      setName('');
      setPrice('');
      setEditingId(null);
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blink.db.table<Ingredient>('ingredients').delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
    onError: (e: Error) => setError(e.message),
  });

  const openDrawer = () => {
    // @ts-ignore
    global.__drawerOpen?.();
  };

  const beginEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setName(ingredient.name);
    setPrice(String(ingredient.price));
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setError('');
  };

  return (
    <View flex={1} backgroundColor="$color1">
      <XStack paddingHorizontal="$4" paddingTop={Platform.OS === 'ios' ? 56 : 16} paddingBottom="$3" alignItems="center" gap="$3">
        <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
          <Menu size={24} color="#E07B3C" />
        </TouchableOpacity>
        <YStack>
          <H3 color="$color12" fontWeight="700">Ingrédients</H3>
          <SizableText size="$2" color="$color9">Votre liste et vos prix</SizableText>
        </YStack>
      </XStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <YStack gap="$4" marginTop="$2">
          <Card backgroundColor="$color2" bordered borderRadius="$5" padding="$4">
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <ShoppingBasket size={18} color="#E07B3C" />
                <H4 color="$color12">{editingId ? 'Modifier l’ingrédient' : 'Ajouter un ingrédient'}</H4>
              </XStack>
              <Input value={name} onChangeText={setName} placeholder="Nom de l’ingrédient" placeholderTextColor="$color9" backgroundColor="$color3" borderColor="$color4" outlineStyle="none" />
              <XStack gap="$3" alignItems="center">
                <Input flex={1} value={price} onChangeText={setPrice} placeholder="Prix (€)" placeholderTextColor="$color9" keyboardType="decimal-pad" backgroundColor="$color3" borderColor="$color4" outlineStyle="none" />
                <Button height={48} backgroundColor="#E07B3C" onPress={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Spinner size="small" color="white" /> : <Check size={20} color="white" />}
                </Button>
                {editingId && <Button height={48} chromeless onPress={cancelEdit}><X size={20} color="$color9" /></Button>}
              </XStack>
              {error && <SizableText size="$2" color="$red10">{error}</SizableText>}
            </YStack>
          </Card>

          {isLoading ? <YStack alignItems="center" paddingVertical="$8"><Spinner size="large" color="#E07B3C" /></YStack> : (
            <RNAnimated.View style={{ opacity: fadeAnim }}>
              <YStack gap="$3">
                {ingredients?.map((ingredient) => (
                  <Card key={ingredient.id} backgroundColor="$color2" bordered borderRadius="$4" padding="$4">
                    <XStack alignItems="center" justifyContent="space-between" gap="$3">
                      <YStack flex={1} gap="$1">
                        <SizableText size="$4" color="$color12" fontWeight="600">{ingredient.name}</SizableText>
                        <SizableText size="$3" color="#E07B3C" fontWeight="700">{Number(ingredient.price).toFixed(2)} €</SizableText>
                      </YStack>
                      <XStack gap="$2">
                        <TouchableOpacity onPress={() => beginEdit(ingredient)} activeOpacity={0.7}>
                          <View width={44} height={44} borderRadius="$3" backgroundColor="#E07B3C18" alignItems="center" justifyContent="center"><Pencil size={18} color="#E07B3C" /></View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteMutation.mutate(ingredient.id)} activeOpacity={0.7}>
                          <View width={44} height={44} borderRadius="$3" backgroundColor="#EF444418" alignItems="center" justifyContent="center"><Trash2 size={18} color="$red10" /></View>
                        </TouchableOpacity>
                      </XStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            </RNAnimated.View>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
}
