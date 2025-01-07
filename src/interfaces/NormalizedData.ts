export interface SubPage {
  title?: string;
  data?: string;
}

export interface Headers {
  h1?: string[];
  h2?: string[];
  h3?: string[];
}

export interface Content {
  headers?: Headers;
  sub_pages?: SubPage[];
}

export interface Source {
  id?: string;
  url?: string;
  title?: string;
  scrapedAt?: string;
}

export interface NormalizedDataItem {
  source?: Source;
  content?: Content;
}
