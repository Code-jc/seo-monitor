import type { SiteConfig } from "../../src/types/site-config";

export const CasaMalvaConfig = {
    id: 'casa-malva',
    name: 'HOTEL CASA MALVA GUANAJUATO',
    baseUrl: 'https://hotelcasamalvagto.com',
    locale: 'es-MX',
    timezone: 'America/Mexico_City',

    searchConsoleProperty: 'sc-domain:hotelcasamalvagto.com',

    contact: {
        phone: '+524731027067',
        whatsapp: '+524731840180',
    },

    pages: [
        {
            name: 'Inicio',
            path: '/',
            expectedTitle: 'Hotel Casa Malva Guanajuato | Sitio oficial',
            shouldBeIndexable: false,
        },
    ],

    keywords: [
        {
            query: 'hotel casa malva guanajuato',
            targetPath: '/',
            country: 'MX',
            language: 'es'
        },
        {
            query: 'casa malva guanajuato',
            targetPath: '/',
            device: 'mobile',
            country: 'MX',
            language: 'es',
        },
        {
            query: 'hotel cerca del museo de las momias',
            targetPath: '/',
            device: 'mobile',
            country: 'MX',
            language: 'es',
        },
        {
            query: 'hotel con estacionamiento en guanajuato',
            targetPath: '/',
            device: 'mobile',
            country: 'MX',
            language: 'es',
        },
    ],

} satisfies SiteConfig;