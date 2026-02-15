import { type TourSearch, type City, type RouteCard, type PreGeneratedTour } from "@shared/schema";
import { ROUTE_CARDS, PREGENERATED_TOURS } from "./pregeneratedTours";

export interface IStorage {
  searchTours(search: TourSearch): Promise<City[]>;
  getCities(): Promise<City[]>;
  getRouteCards(): Promise<RouteCard[]>;
  getPreGeneratedTour(id: string): Promise<PreGeneratedTour | undefined>;
}

const CITIES: City[] = [];

export class MemStorage implements IStorage {
  async searchTours(search: TourSearch): Promise<City[]> {
    return [];
  }

  async getCities(): Promise<City[]> {
    return CITIES;
  }

  async getRouteCards(): Promise<RouteCard[]> {
    return ROUTE_CARDS;
  }

  async getPreGeneratedTour(id: string): Promise<PreGeneratedTour | undefined> {
    return PREGENERATED_TOURS.find((t) => t.id === id);
  }
}

export const storage = new MemStorage();
