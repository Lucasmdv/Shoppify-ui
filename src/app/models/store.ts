import { Carouselitem } from "./carouselitem";

export interface Store {
  id: number;
  storeName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  twitter: string;
  facebook: string;
  instagram: string;
  youtube: string; //Implementar en backend
  homeCarousel?: Carouselitem[];
}
