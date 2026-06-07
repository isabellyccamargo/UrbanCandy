import imgIngredientes from '../../assets/ingredientes.png';
import imgComAmor from '../../assets/comAmor.png';
import sabor from '../../assets/sabor.png';
import entrega from '../../assets/entrega.png';

export const FEATURES = [
  {
    icon: 'verified',
    title: 'Ingredientes Premium',
    image: imgIngredientes,
    description: 'Utilizamos apenas ingredientes de primeira qualidade selecionados.',
  },
  {
    icon: 'favorite',
    title: 'Feito com Amor',
    image: imgComAmor,
    description: 'Cada doce é preparado artesanalmente com carinho e dedicação.',
  },
  {
    icon: 'local_shipping',
    title: 'Entrega Rápida',
    image: entrega,
    description: 'Entregas ágeis e seguras para você receber doces fresquinhos.',
  },
  {
    icon: 'star',
    title: 'Sabor Inigualável',
    image: sabor,
    description: 'Receitas exclusivas que conquistam o paladar mais exigente.',
  },
];

export const CATEGORY_IMAGES = {
  Brigadeiros: 'Brigadeiro.jpg',
  Cookies: 'CookieChocolate.jpg',
  Brownies: 'BrownieNutella.jpg',
};
