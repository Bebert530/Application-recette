import { useEffect, useState, useRef } from 'react';
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
  Input,
  AppHeader,
} from '@blinkdotnew/mobile-ui';
import { Search, Clock, ChefHat, X } from '@blinkdotnew/mobile-ui';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Image, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useQuery } from '@tanstack/react-query';

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  prep_time: string;
  recipe_text: string;
  image_url: string | null;
  created_at: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  const { data: recipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return await blink.db.table<Recipe>('recipes').list({
        orderBy: { created_at: 'desc' },
      });
    },
  });

  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const filtered = query.trim()
    ? recipes?.filter((r) => {
        const needle = query.toLowerCase();
        return r.title.toLowerCase().includes(needle) || r.ingredients.toLowerCase().includes(needle);
      })
    : recipes;

  const openDrawer = () => {
    // @ts-ignore
    global.__drawerOpen?.();
  };

  const formatIngredients = (ingredients: string) => {
    const items = ingredients.split(',').map(i => i.trim());
    if (items.length <= 3) return items.join(', ');
    return items.slice(0, 3).join(', ') + ` +${items.length - 3}`;
  };

  return (
    <View flex={1} backgroundColor="$color1">
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingTop={Platform.OS === 'ios' ? 56 : 16}
        paddingBottom="$3"
        alignItems="center"
        gap="$3"
        backgroundColor="$color1"
      >
        <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
          <Search size={24} color="#E07B3C" />
        </TouchableOpacity>
        <H3 color="$color12" fontWeight="700">
          Recherche
        </H3>
      </XStack>

      {/* Search Bar */}
      <YStack paddingHorizontal="$4" paddingBottom="$3">
        <XStack
          backgroundColor="$color2"
          borderRadius="$6"
          paddingHorizontal="$4"
          paddingVertical={Platform.OS === 'ios' ? 12 : 8}
          alignItems="center"
          gap="$3"
          borderWidth={1}
          borderColor="$color4"
        >
          <Search size={18} color="$color9" />
          <Input
            flex={1}
            backgroundColor="transparent"
            borderWidth={0}
            padding="$0"
            placeholder="Rechercher une recette..."
            placeholderTextColor="$color9"
            value={query}
            onChangeText={setQuery}
            size="$4"
            outlineStyle="none"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <X size={18} color="$color9" />
            </TouchableOpacity>
          )}
        </XStack>
      </YStack>

      {/* Results */}
      <RNAnimated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {query.trim() && filtered && filtered.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$4">
              <Search size={60} color="#E07B3C20" />
              <H4 textAlign="center" color="$color12">
                Aucun résultat
              </H4>
              <Paragraph textAlign="center" color="$color9">
                Aucune recette trouvée pour « {query} »
              </Paragraph>
            </YStack>
          ) : (
            <YStack gap="$4" marginTop="$2">
              {filtered?.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  activeOpacity={0.95}
                  onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
                >
                  <Card
                    elevation={3}
                    bordered
                    borderRadius="$5"
                    backgroundColor="$color2"
                    overflow="hidden"
                    pressStyle={{ scale: 0.98 }}
                  >
                    <XStack>
                      {/* Thumbnail */}
                      <View width={100} height={100} backgroundColor="$color3">
                        {recipe.image_url ? (
                          <Image
                            source={{ uri: recipe.image_url }}
                            style={{ width: 100, height: 100 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#2A1F1A">
                            <ChefHat size={32} color="#9A7B6B" opacity={0.4} />
                          </YStack>
                        )}
                      </View>

                      {/* Info */}
                      <Card.Footer padded flex={1}>
                        <YStack gap="$2" flex={1} justifyContent="center">
                          <SizableText size="$4" fontWeight="700" color="$color12" numberOfLines={1}>
                            {recipe.title}
                          </SizableText>
                          <XStack gap="$2" alignItems="center">
                            <Clock size={12} color="#E07B3C" />
                            <SizableText size="$2" color="#E07B3C" fontWeight="500">
                              {recipe.prep_time}
                            </SizableText>
                          </XStack>
                          <SizableText size="$2" color="$color9" numberOfLines={1}>
                            {formatIngredients(recipe.ingredients)}
                          </SizableText>
                        </YStack>
                      </Card.Footer>
                    </XStack>
                  </Card>
                </TouchableOpacity>
              ))}
            </YStack>
          )}
        </ScrollView>
      </RNAnimated.View>
    </View>
  );
}
