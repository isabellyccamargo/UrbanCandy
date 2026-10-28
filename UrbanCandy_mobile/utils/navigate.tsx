import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RouterType = ReturnType<typeof useRouter>;

export async function navigateToAdminArea(router: RouterType) {
  try {
    const storedUser =
      (await AsyncStorage.getItem('@UrbanCandy:user')) ||
      (await AsyncStorage.getItem('user'));
    const user = storedUser ? JSON.parse(storedUser) : null;

    const roleId = user?.role_id || user?.id_role;

    if (roleId === 3) {
      router.push('/protected/manager-dashboard' as any);
    } else if (roleId === 2) {
      router.push('/protected/employeeOrders' as any);
    } else {
      console.warn('Usuário não possui acesso à área administrativa.');
    }
  } catch (error) {
    console.error('Erro ao verificar acesso do usuário:', error);
  }
}