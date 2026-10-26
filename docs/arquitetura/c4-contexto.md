    # C4 — Diagrama de Contexto

O limite **UrbanCandy** representa a plataforma como um todo, incluindo suas aplicações Web e Mobile, o backend e o serviço interno de e-mail. Os componentes internos serão detalhados no Diagrama de Containers.

```mermaid
C4Context
    title UrbanCandy — Diagrama de Contexto

    Person(cliente, "Cliente", "Consulta produtos, realiza compras e acompanha pedidos.")
    Person(gestor, "Gestor/operador", "Gerencia catálogo e pedidos conforme suas permissões.")

    System(urbancandy, "UrbanCandy", "Plataforma de vendas e gerenciamento de pedidos de doces.")

    System_Ext(viacep, "ViaCEP", "API externa para consulta e validação de CEP.")
    System_Ext(mercado_pago, "Mercado Pago", "Provedor externo de checkout e processamento de pagamentos.")
    System_Ext(smtp, "Provedor SMTP", "Serviço externo de entrega de e-mails; Gmail é o padrão de configuração.")

    Rel(cliente, urbancandy, "Consulta catálogo, compra e acompanha pedidos", "Web / Mobile")
    Rel(gestor, urbancandy, "Gerencia catálogo e acompanha/atualiza pedidos", "Web / Mobile")
    Rel(urbancandy, viacep, "Consulta e valida CEP", "HTTPS")
    Rel(urbancandy, mercado_pago, "Cria checkout e consulta pagamentos; recebe notificações assinadas", "HTTPS")
    Rel(urbancandy, smtp, "Envia mensagens de confirmação e atualização de pedidos", "SMTP")
```

## Notas de leitura

- O gateway está identificado como **Mercado Pago**, que possui integração implementada; não é um componente planejado.
- O serviço de e-mail é interno à plataforma e não aparece como sistema externo neste nível. O provedor SMTP, usado por esse serviço, é externo.
- ViaCEP e o provedor SMTP são dependências externas. O diagrama mostra a relação da plataforma sem detalhar qual container inicia cada chamada.
- “Gestor/operador” representa as pessoas autorizadas a administrar catálogo e pedidos; as permissões concretas dependem da configuração do sistema.
- Este diagrama é o nível **Contexto** do C4. Ele não substitui o Diagrama de Containers.
