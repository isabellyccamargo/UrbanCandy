# ADR 04 — Cache do catálogo com Redis

- **Status:** Aceito — implementação presente
- **Data:** 2026-10-23

## Contexto

As consultas repetidas ao catálogo podem aumentar a carga no MySQL. O sistema precisa manter o MySQL como fonte de verdade e impedir que o cache seja a única cópia dos dados.

## Decisão

Usar o padrão **cache-aside** com Redis para listagens, destaques, produto por ID e consultas por categoria. O TTL padrão é de 60 segundos e pode ser configurado por `PRODUCT_CACHE_TTL_SECONDS`. Criação, alteração ou remoção de produtos e categorias invalida as chaves de catálogo.

Se a leitura ou gravação do cache falhar, a consulta continua pelo banco e o resultado pode ser retornado sem cache. Se a invalidação falhar, a expiração por TTL limita, mas não elimina, o período de dados obsoletos.

## Alternativas consideradas

- **Consultar sempre MySQL:** mais simples, mas repete leituras.
- **Redis como cache:** escolhido para reutilizar resultados sem substituir o banco.
- **Redis como armazenamento exclusivo:** rejeitado; cache não é fonte persistente de verdade.

## Consequências

- O cache pode reduzir leituras repetidas; não há benchmark que comprove uma melhoria quantitativa.
- TTL e invalidação controlam obsolescência; falhas de invalidação podem deixar dados antigos até expirar.
- A indisponibilidade do Redis não deve impedir a leitura do catálogo, mas aumenta a carga no MySQL.

## Evidências

`UrbanCandy_back/src/config/RedisCache.ts`, `UrbanCandy_back/src/service/CacheAside.ts`, `ProductService.ts`, `CategoryService.ts` e `docker-compose.yml`.
