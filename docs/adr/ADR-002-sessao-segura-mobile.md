# ADR 02 — Persistência segura da sessão mobile

- **Status:** Planejado
- **Data:** A definir

## Contexto

O aplicativo usa Expo/React Native e autentica chamadas à API com JWT. O serviço de autenticação do backend emite JWT com expiração de duas horas. A sessão mobile precisa persistir entre aberturas do aplicativo e tratar expiração.

## Decisão

Planejar o uso de `expo-secure-store` para armazenar o token em dispositivos nativos. Na inicialização, o aplicativo poderá recuperar o token e utilizá-lo nas requisições autenticadas. Quando a API indicar token expirado/inválido, remover a credencial e solicitar novo login, salvo se um mecanismo de renovação for definido. No logout, apagar o token seguro.

Dados de perfil não são credenciais e devem ter sua estratégia de armazenamento avaliada separadamente. Se a aplicação também oferecer suporte web, definir armazenamento específico para essa plataforma, pois SecureStore é voltado ao armazenamento seguro nativo.

## Alternativas consideradas

- **Memória:** não persiste após o encerramento do processo.
- **AsyncStorage para token:** já é usado no fluxo atual, mas não oferece as mesmas garantias de armazenamento seguro de credenciais.
- **`expo-secure-store`:** escolhido como direção para tokens em Android/iOS.

## Consequências

- **Positivas:** maior proteção do token em dispositivos suportados e persistência da sessão durante a validade do JWT.
- **Negativas:** requer migração, tratamento de expiração, limpeza segura e decisões para outras plataformas.
- **Limitação:** sem refresh token/endpoint de renovação identificado, token expirado exige novo login.

## Verificação em relação ao código

`expo-secure-store` consta nas dependências do Mobile, porém os fluxos examinados ainda salvam e leem tokens via `AsyncStorage`, incluindo login, interceptor HTTP e logout. O JWT é emitido com expiração de duas horas pelo backend. Portanto, **a decisão permanece planejada e não está implementada**, apesar da dependência já instalada.

## Próximos passos antes da implementação

1. Definir suporte a Android/iOS e eventual Web.
2. Migrar leitura/escrita/remoção em todos os fluxos, removendo cópias redundantes do token em AsyncStorage.
3. Definir comportamento para token expirado e limpar credenciais de forma consistente.
4. Testar login, reabertura, expiração e logout em plataformas suportadas.
