import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, XStack, View, H2, Paragraph, SizableText, Input, Button, Spinner } from '@blinkdotnew/mobile-ui';
import { ChefHat, LockKeyhole, UserRound } from '@blinkdotnew/mobile-ui';
import { useRouter } from 'expo-router';
import { blink } from '@/lib/blink';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.isAuthenticated) router.replace('/(drawer)');
      if (!state.isLoading) setChecking(false);
    });
    return unsubscribe;
  }, [router]);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError('Renseignez votre identifiant et votre mot de passe.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await blink.auth.signInWithEmail(username.trim(), password);
      router.replace('/(drawer)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Identifiant ou mot de passe incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return <View flex={1} backgroundColor="$color1" alignItems="center" justifyContent="center"><Spinner size="large" color="#E07B3C" /></View>;

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <YStack flex={1} backgroundColor="$color1" paddingHorizontal="$6" justifyContent="center" gap="$5">
      <YStack alignItems="center" gap="$3">
        <View width={78} height={78} borderRadius={24} backgroundColor="#E07B3C" alignItems="center" justifyContent="center"><ChefHat size={42} color="white" /></View>
        <H2 color="$color12" fontWeight="800">Cuisine Vault</H2>
        <Paragraph color="$color9" textAlign="center">Connectez-vous pour retrouver vos recettes.</Paragraph>
      </YStack>
      <YStack gap="$4">
        <XStack alignItems="center" gap="$3" backgroundColor="$color2" borderRadius="$4" paddingHorizontal="$4" borderWidth={1} borderColor="$color4"><UserRound size={18} color="#E07B3C" /><Input flex={1} value={username} onChangeText={setUsername} placeholder="Nom d’utilisateur" placeholderTextColor="$color9" backgroundColor="transparent" borderWidth={0} outlineStyle="none" autoCapitalize="none" /></XStack>
        <XStack alignItems="center" gap="$3" backgroundColor="$color2" borderRadius="$4" paddingHorizontal="$4" borderWidth={1} borderColor="$color4"><LockKeyhole size={18} color="#E07B3C" /><Input flex={1} value={password} onChangeText={setPassword} placeholder="Mot de passe" placeholderTextColor="$color9" backgroundColor="transparent" borderWidth={0} outlineStyle="none" secureTextEntry onSubmitEditing={submit} /></XStack>
        {error && <SizableText color="$red10" size="$3">{error}</SizableText>}
        <Button height={52} borderRadius="$5" backgroundColor="#E07B3C" onPress={submit} disabled={submitting}>{submitting ? <Spinner color="white" /> : <SizableText color="white" size="$4" fontWeight="700">Se connecter</SizableText>}</Button>
      </YStack>
    </YStack>
  </KeyboardAvoidingView>;
}
