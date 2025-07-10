import { ResponseGetDto } from "../dto/responseGet.dto";

export const GetAllByCategoryMock: ResponseGetDto = {
  category: { name: 'womens-watches' },
  paging: { limit: 20, offset: 0, total: 5 },
  items: [
    {
      id: 190,
      title: 'IWC Ingenieur Automatic Steel',
      price: 4999.99,
      picture: 'https://cdn.dummyjson.com/product-images/womens-watches/iwc-ingenieur-automatic-steel/1.webp',
      price_discount: 472.49905499999994,
      rating: 2.93,
      free_shipping: false,
    },
    {
      id: 191,
      title: 'Rolex Cellini Moonphase',
      price: 15999.99,
      picture: 'https://cdn.dummyjson.com/product-images/womens-watches/rolex-cellini-moonphase/1.webp',
      price_discount: 657.5995889999999,
      rating: 3.83,
      free_shipping: false,
    },
    {
      id: 192,
      title: 'Rolex Datejust Women',
      price: 10999.99,
      picture: 'https://cdn.dummyjson.com/product-images/womens-watches/rolex-datejust-women/1.webp',
      price_discount: 1753.398406,
      rating: 2.86,
      free_shipping: false,
    },
    {
      id: 193,
      title: 'Watch Gold for Women',
      price: 799.99,
      picture: 'https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/1.webp',
      price_discount: 146.718166,
      rating: 4.24,
      free_shipping: false,
    },
    {
      id: 194,
      title: "Women's Wrist Watch",
      price: 129.99,
      picture: "https://cdn.dummyjson.com/product-images/womens-watches/women's-wrist-watch/1.webp",
      price_discount: 16.37874,
      rating: 3.52,
      free_shipping: false,
    },
  ],
};
