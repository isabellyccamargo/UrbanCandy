# Cache de produtos com Redis

## Como funciona

O MySQL continua sendo a fonte dos dados. Com Cache-Aside, o backend consulta
Redis primeiro; se a chave não existir (`MISS`), busca no banco e grava o
resultado. Uma consulta repetida (`HIT`) pode ser respondida pelo cache, sem
repetir a leitura no MySQL.

O cache cobre listagem paginada, produtos em destaque, busca por categoria e
busca por ID. O TTL padrão é 60 segundos e pode ser alterado por
`PRODUCT_CACHE_TTL_SECONDS` no `.env` raiz.

## Isolamento e invalidação

As chaves são separadas por ambiente:

- Docker: `urbancandy:docker:products:`
- Desenvolvimento local: `urbancandy:local:products:`
- Testes: `urbancandy:test:products:`

Isso impede a reutilização de resultados entre ambientes que usam bancos
diferentes. O cache fica desativado durante os testes.
O backend local conecta ao Redis do Compose pela porta publicada em
`127.0.0.1:6380` (ou pela porta definida em `REDIS_PORT`); o endereço de
exemplo está em `UrbanCandy_back/.env.example`.

Após criar, atualizar ou excluir um produto, o backend invalida as chaves de
produtos. Mudanças em categorias também invalidam o catálogo. Se Redis estiver
indisponível, a API registra o erro e busca os dados no banco, sem cache.

## Demonstração

1. Acompanhe os logs do backend correspondente. Para Docker:

   ```powershell
   docker compose logs --follow urbancandy-backend
   ```

   Para desenvolvimento local, observe o terminal em que `npm run dev` está
   rodando.
2. Consulte duas vezes `https://urbancandy.local/api/produto/listar`.
   A primeira leitura deve registrar `MISS` e `Gravado`; a segunda, `HIT`.
3. Edite um produto pela aplicação. O backend deve registrar a invalidação.
   Na próxima consulta da lista, deve aparecer novo `MISS` e gravação, seguido
   de `HIT` na leitura seguinte.
4. Para inspecionar as chaves Docker:

   ```powershell
   docker compose exec urbancandy-redis redis-cli --scan --pattern "urbancandy:docker:products:*"
   ```

Os testes automatizados verificam cache miss, hit e fallback quando Redis não
pode ser acessado. A demonstração funcional não é um benchmark de desempenho.

## Implementação

O comportamento está em
[`RedisCache.ts`](../../UrbanCandy_back/src/config/RedisCache.ts),
[`CacheAside.ts`](../../UrbanCandy_back/src/service/CacheAside.ts),
[`ProductService.ts`](../../UrbanCandy_back/src/service/ProductService.ts) e
[`CategoryService.ts`](../../UrbanCandy_back/src/service/CategoryService.ts).
