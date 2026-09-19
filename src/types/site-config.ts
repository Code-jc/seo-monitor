export type DeviceType = 'desktop' | 'mobile';

export interface MonitoredPage {
    name: string;
    path: string;
    expectedTitle?: string;
    expectedH1?: string;
    shouldBeIndexable?: boolean;
}

export interface MonitoredKeyword {
    query: string;
    targetPath: string;
    device?: DeviceType;
    country?: string;
    language?: string; 
}

export interface SiteContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface SiteConfig {
  id: string;
  name: string;
  baseUrl: string;
  locale: string;
  timezone: string;

  searchConsoleProperty?: string;

  contact?: SiteContact;
  pages: MonitoredPage[];
  keywords: MonitoredKeyword[];
}