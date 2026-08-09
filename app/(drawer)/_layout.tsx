import { YStack, XStack, View, Button, SizableText, Separator } from '@blinkdotnew/mobile-ui';
import { Home, Search, X, ChefHat, Utensils, ShoppingBasket, ShoppingCart } from '@blinkdotnew/mobile-ui';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, TouchableOpacity, Animated as RNAnimated, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';

const DRAWER_WIDTH = 260;

export default function DrawerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new RNAnimated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new RNAnimated.Value(0)).current;
  const router = useRouter();
  const pathname = usePathname();

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    RNAnimated.parallel([
      RNAnimated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
      RNAnimated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  const closeDrawer = useCallback(() => {
    RNAnimated.parallel([
      RNAnimated.spring(slideAnim, { toValue: -DRAWER_WIDTH, useNativeDriver: true, damping: 20, stiffness: 200 }),
      RNAnimated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  }, [slideAnim, overlayAnim]);

  const navigateTo = useCallback((href: string) => {
    closeDrawer();
    setTimeout(() => {
      // @ts-ignore - expo-router typed routes can be strict
      router.push(href);
    }, 300);
  }, [closeDrawer, router]);

  const isHome = pathname === '/(drawer)' || pathname === '/' || pathname === '';
  const isSearch = pathname.includes('search');
  const isIngredients = pathname.includes('ingredients');
  const isShoppingList = pathname.includes('shopping-list');

  return (
    <View flex={1} backgroundColor="$color1">
      <View flex={1}><Slot /></View>
      {drawerOpen && (
        <RNAnimated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: overlayAnim, zIndex: 90 }]}>
          <TouchableOpacity activeOpacity={1} onPress={closeDrawer} style={StyleSheet.absoluteFill} />
        </RNAnimated.View>
      )}
      <RNAnimated.View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: DRAWER_WIDTH, backgroundColor: '#1A120E', transform: [{ translateX: slideAnim }], zIndex: 100, ...Platform.select({ web: { boxShadow: '4px 0 30px rgba(0,0,0,0.5)' }, default: { shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 30 } }) }}>
        <YStack flex={1} paddingTop={Platform.OS === 'ios' ? 60 : 48}>
          <XStack paddingHorizontal="$5" paddingVertical="$4" alignItems="center" gap="$3">
            <View backgroundColor="#E07B3C" width={40} height={40} borderRadius={12} alignItems="center" justifyContent="center"><ChefHat size={22} color="white" /></View>
            <YStack><SizableText size="$5" fontWeight="700" color="white">Cuisine Vault</SizableText><SizableText size="$2" color="#9A7B6B">Vos recettes</SizableText></YStack>
            <Button chromeless onPress={closeDrawer} icon={<X size={20} color="#9A7B6B" />} padding="$0" marginLeft="auto" />
          </XStack>
          <Separator borderColor="#2A1F1A" marginVertical="$3" />
          <YStack paddingHorizontal="$4" gap="$1">
            <NavItem icon={<Home size={22} color={isHome ? '#E07B3C' : '#9A7B6B'} />} label="Home" active={isHome} onPress={() => navigateTo('/(drawer)')} />
            <NavItem icon={<Search size={22} color={isSearch ? '#E07B3C' : '#9A7B6B'} />} label="Recherche" active={isSearch} onPress={() => navigateTo('/(drawer)/search')} />
            <NavItem icon={<ShoppingBasket size={22} color={isIngredients ? '#E07B3C' : '#9A7B6B'} />} label="Ingrédients" active={isIngredients} onPress={() => navigateTo('/(drawer)/ingredients')} />
            <NavItem icon={<ShoppingCart size={22} color={isShoppingList ? '#E07B3C' : '#9A7B6B'} />} label="Liste de course" active={isShoppingList} onPress={() => navigateTo('/(drawer)/shopping-list')} />
          </YStack>
          <YStack flex={1} justifyContent="flex-end" paddingHorizontal="$5" paddingBottom="$6"><XStack alignItems="center" gap="$2" opacity={0.4}><Utensils size={14} color="#9A7B6B" /><SizableText size="$2" color="#9A7B6B">Cuisine Vault v1.0</SizableText></XStack></YStack>
        </YStack>
      </RNAnimated.View>
      <ExposeDrawerMethods openDrawer={openDrawer} closeDrawer={closeDrawer} />
    </View>
  );
}

function NavItem({ icon, label, active, onPress }: { icon: React.ReactNode; label: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.7}><XStack paddingHorizontal="$4" paddingVertical="$3" borderRadius="$4" backgroundColor={active ? '#E07B3C20' : 'transparent'} alignItems="center" gap="$3">{icon}<SizableText size="$4" fontWeight={active ? '600' : '400'} color={active ? '#E07B3C' : '#D4C4B7'}>{label}</SizableText></XStack></TouchableOpacity>;
}

function ExposeDrawerMethods({ openDrawer, closeDrawer }: { openDrawer: () => void; closeDrawer: () => void }) {
  useEffect(() => {
    // @ts-ignore
    global.__drawerOpen = openDrawer;
    // @ts-ignore
    global.__drawerClose = closeDrawer;
    return () => { // @ts-ignore
      delete global.__drawerOpen; // @ts-ignore
      delete global.__drawerClose;
    };
  }, [openDrawer, closeDrawer]);
  return null;
}