import { useRouter } from 'expo-router';
import { getUser } from '@/services/authStorage';

type RouterType = ReturnType<typeof useRouter>;

export async function navigateToAdminArea(router: RouterType) {
  try {
    const user = (await getUser()) as any;

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