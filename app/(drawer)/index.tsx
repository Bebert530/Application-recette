import { useEffect, useState, useCallback, useRef } from 'react';
import {
  YStack,
  XStack,
  View,
  Button,
  Card,
  H2,
  H3,
  H4,
  Paragraph,
  SizableText,
  ScrollView,
  SearchBar,
  Spinner,
  Badge,
  AppHeader,
} from '@blinkdotnew/mobile-ui';
import { Menu, Plus, Clock, ChefHat, ChefHat as Ingredients } from '@blinkdotnew/mobile-ui';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Image, Platform, Animated as RNAnimated } from 'react-native';
import { blink } from '@/lib/blink';
import { useQuery } from '@tanstack/react-query';

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  ingredientIds?: string;
  prepTime: string;
  recipeText: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;

  const { data: recipes, isLoading, refetch } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => await blink.db.table<Recipe>('recipes').list({ orderBy: { createdAt: 'desc' } }),
  });

  useEffect(() => {
    RNAnimated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openDrawer = () => {
    // @ts-ignore
    global.__drawerOpen?.();
  };

  const labelItems = (value: string) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);

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
        <XStack alignItems="center" gap="$3">
          <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
            <Menu size={24} color="#E07B3C" />
          </TouchableOpacity>
          <YStack>
            <H3 color="$color12" fontWeight="700">
              Cuisine Vault
            </H3>
            <SizableText size="$2" color="$color9">
              {recipes ? `${recipes.length} recettes` : 'Chargement...'}
            </SizableText>
          </YStack>
        </XStack>
        <TouchableOpacity onPress={() => router.push('/add-recipe')} activeOpacity={0.7}>
          <View
            backgroundColor="#E07B3C15"
            width={40}
            height={40}
            borderRadius="$4"
            alignItems="center"
            justifyContent="center"
          >
            <Plus size={20} color="#E07B3C" />
          </View>
        </TouchableOpacity>
      </XStack>

      {/* Content */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Spinner size="large" color="#E07B3C" />
          <SizableText size="$4" color="$color9">
            Chargement des recettes...
          </SizableText>
        </YStack>
      ) : recipes && recipes.length > 0 ? (
        <RNAnimated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <YStack gap="$4" marginTop="$2">
              {recipes.map((recipe, index) => (
                <TouchableOpacity
                  key={recipe.id}
                  activeOpacity={0.95}
                  onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
                >
                  <Card
                    elevation={4}
                    bordered
                    borderRadius="$5"
                    backgroundColor="$color2"
                    overflow="hidden"
                    pressStyle={{ scale: 0.98 }}
                  >
                    {/* Image */}
                    <View height={180} backgroundColor="$color3" overflow="hidden">
                      {recipe.imageUrl ? (
                        <Image
                          source={{ uri: recipe.imageUrl }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="#2A1F1A">
                          <ChefHat size={48} color="#9A7B6B" opacity={0.5} />
                        </YStack>
                      )}
                      {/* Gradient overlay */}
                      <View
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        height={60}
                        style={{
                          backgroundImage: 'linear-gradient(to top, rgba(26,18,14,0.9), transparent)',
                        }}
                      />
                    </View>

                    {/* Content */}
                    <Card.Footer padded>
                      <YStack gap="$3" flex={1}>
                        <XStack alignItems="center" justifyContent="space-between">
                          <H4 color="$color12" fontWeight="700" flex={1} numberOfLines={1}>
                            {recipe.title}
                          </H4>
                        </XStack>

                        <XStack gap="$3" flexWrap="wrap">
                          <XStack
                            backgroundColor="#E07B3C15"
                            paddingHorizontal="$3"
                            paddingVertical="$1"
                            borderRadius="$2"
                            alignItems="center"
                            gap="$2"
                          >
                            <Clock size={14} color="#E07B3C" />
                            <SizableText size="$2" color="#E07B3C" fontWeight="600">
                              {recipe.prepTime}
                            </SizableText>
                          </XStack>
                          {labelItems(recipe.ingredients).map((ingredient, i) => (
                            <XStack
                              key={i}
                              backgroundColor="$color3"
                              paddingHorizontal="$3"
                              paddingVertical="$1"
                              borderRadius="$2"
                              alignItems="center"
                              gap="$2"
                            >
                              <SizableText size="$2" color="$color10">
                                {ingredient}
                              </SizableText>
                            </XStack>
                          ))}
                        </XStack>
                      </YStack>
                    </Card.Footer>
                  </Card>
                </TouchableOpacity>
              ))}
            </YStack>
          </ScrollView>
        </RNAnimated.View>
      ) : (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" paddingHorizontal="$8">
          <ChefHat size={80} color="#E07B3C30" />
          <H3 textAlign="center" color="$color12">
            Aucune recette
          </H3>
          <Paragraph textAlign="center" color="$color9">
            Ajoutez votre première recette en appuyant sur le bouton + en bas à droite.
          </Paragraph>
        </YStack>
      )}

      {/* FAB */}
      <View
        position="absolute"
        bottom={Platform.OS === 'ios' ? 100 : 80}
        right={20}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/add-recipe')}
        >
          <View
            width={56}
            height={56}
            borderRadius={28}
            backgroundColor="#E07B3C"
            alignItems="center"
            justifyContent="center"
            {...Platform.select({
              default: {
                shadowColor: '#E07B3C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
              },
              web: {
                boxShadow: '0 4px 16px rgba(224,123,60,0.4)',
              },
            })}
          >
            <Plus size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}