import type { SiteConfig } from '../../src/types/site-config';

export const casaMalvaConfig = {
  id: 'casa-malva',
  name: 'HOTEL CASA MALVA GUANAJUATO',
  baseUrl: 'https://hotelcasamalvagto.com',
  locale: 'es-MX',
  timezone: 'America/Mexico_City',

  searchConsoleProperty: 'sc-domain:hotelcasamalvagto.com',

  searchVisibility: {
    targets: [
      {
        id: 'website',
        type: 'website',
        domain: 'hotelcasamalvagto.com',
      },
    ],
  },

  contact: {
    phone: '+524731027067',
    whatsapp: '+524731840180',
  },

  pages: [
    {
      name: 'Inicio',
      path: '/',
      expectedTitle: 'Hotel Casa Malva Guanajuato | Sitio Oficial',
      expectedH1: 'Hotel Casa Malva Guanajuato',
      shouldBeIndexable: true,
    },
    {
      name: 'Suite Individual',
      path: '/suite-individual/',
      shouldBeIndexable: true,
    },
    {
      name: 'Suite King',
      path: '/suite-king/',
      shouldBeIndexable: true,
    },
    {
      name: 'Suite Principal',
      path: '/suite-principal/',
      shouldBeIndexable: true,
    },
    {
      name: 'Habitación Regular',
      path: '/habitacion-regular/',
      shouldBeIndexable: true,
    },
    {
      name: 'Habitación Familiar',
      path: '/habitacion-familiar/',
      shouldBeIndexable: true,
    },
    {
      name: 'Habitación Doble',
      path: '/habitacion-doble/',
      shouldBeIndexable: true,
    },
  ],

  keywords: [
    {
      query: 'hotel casa malva guanajuato',
      targetPath: '/',
      device: 'mobile',
      country: 'MX',
      language: 'es',
      location: 'Guanajuato, Guanajuato, Mexico',
    },
    {
      query: 'casa malva guanajuato',
      targetPath: '/',
      device: 'mobile',
      country: 'MX',
      language: 'es',
      location: 'Guanajuato, Guanajuato, Mexico',
    },
    {
      query: 'hotel en guanajuato',
      targetPath: '/',
      device: 'mobile',
      country: 'MX',
      language: 'es',
      location: 'Guanajuato, Guanajuato, Mexico',
    },
    {
      query: 'hotel cerca del museo de las momias',
      targetPath: '/',
      device: 'mobile',
      country: 'MX',
      language: 'es',
      location: 'Guanajuato, Guanajuato, Mexico',
    },
    {
      query: 'hotel con estacionamiento en guanajuato',
      targetPath: '/',
      device: 'mobile',
      country: 'MX',
      language: 'es',
      location: 'Guanajuato, Guanajuato, Mexico',
    },
  ],
} satisfies SiteConfig;
