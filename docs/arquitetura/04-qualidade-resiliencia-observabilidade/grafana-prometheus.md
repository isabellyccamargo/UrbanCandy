# Dashboard de observabilidade

O Compose usa Prometheus para coletar métricas do backend e Grafana para
apresentá-las no dashboard **UrbanCandy - API overview**.

## Iniciar e acessar

1. Na primeira inicialização, configure `GRAFANA_ADMIN_PASSWORD` no `.env` da
   raiz. Preserve as demais configurações e não versione esse arquivo.
2. Inicie o ambiente Docker: `.\scripts\start-docker.ps1`.
3. Acesse <http://localhost:3001> e entre com a conta Grafana já configurada.
   Em uma instalação nova, o usuário vem de `GRAFANA_ADMIN_USER` (padrão
   `admin`) e a senha de `GRAFANA_ADMIN_PASSWORD`.
4. Abra a pasta **UrbanCandy** e selecione **UrbanCandy - API overview**.

O dashboard e a fonte de dados são provisionados pelo Compose. O Prometheus
também pode ser consultado em <http://localhost:9090>. Essas interfaces ficam
limitadas ao próprio computador. Após a primeira inicialização, a conta do
Grafana permanece no volume de dados; alterar a senha no `.env` não redefine
uma conta já existente.

## Métricas e histórico

O backend expõe métricas HTTP e de dependências em `:9464/metrics`, acessível
apenas pela rede privada do Compose. O Prometheus coleta a cada 15 segundos e
mantém até 35 dias de histórico no volume `prometheus_data`. Um probe HTTP
consulta `/api/health` automaticamente no mesmo intervalo, mesmo sem tráfego
de usuários.

O dashboard abre na janela de 20 dias e inclui o sucesso do probe de saúde.
Os demais gráficos de requisições dependem de tráfego real na API. Após iniciar
o ambiente, aguarde pelo menos dois ciclos de coleta para os primeiros dados.

O Prometheus coleta o backend Docker, mesmo que o Nginx esteja temporariamente
direcionado ao backend local. A coleta para quando os serviços Docker estão
parados. Os volumes devem ser preservados para manter o histórico; não use
`docker compose down -v` para uma parada normal.

Para reunir 20 dias consecutivos de dados, mantenha o computador ligado e
impedido de suspender, com o Docker Desktop em execução. Configure o Docker
Desktop para iniciar com o Windows e confirme os containers após reinicializar
o computador. `restart: unless-stopped` reinicia containers após falhas e
retomada do Docker, mas não coleta dados enquanto o computador ou Docker estiver
parado; esses períodos aparecerão como lacunas. O probe mede a saúde observada
enquanto Prometheus está coletando, não é uma garantia de disponibilidade nem
um monitor externo.

As regras de alerta são avaliadas pelo Prometheus. Notificações externas de
alerta não estão configuradas. As metas de SLO continuam propostas e dependem
de dados e testes para serem comprovadas.
