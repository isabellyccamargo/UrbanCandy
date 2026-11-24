# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

### Backend local e Docker

Para usar o app em um celular físico, configure uma vez
`EXPO_PUBLIC_API_URL=http://<IP-do-computador>:80` no arquivo `.env` desta
pasta. O endereço usa o Nginx como proxy para a API; o celular e o computador
devem estar na mesma rede, e o firewall deve permitir a porta HTTP do Nginx.

Para usar o backend Docker, inicie-o pela raiz do repositório com
`.\scripts\start-docker.ps1`; o celular acessa a API pelo Nginx. O comando
`npm run dev` do backend inicia apenas a API local para uso no navegador e não
altera o Nginx. No emulador Android padrão, use
`http://10.0.2.2:80` como URL inicial.

O HTTP sem TLS é somente para desenvolvimento em uma rede local confiável; não
use em rede pública nem para tráfego com dados reais.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
