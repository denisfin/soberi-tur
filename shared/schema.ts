import { z } from "zod";

export const tourSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  guests: z.number().min(1).max(10).default(2),
});

export type TourSearch = z.infer<typeof tourSearchSchema>;

export const generateTourSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  dateFrom: z.string().min(1),
  dateTo: z.string().min(1),
  guests: z.number().min(1).max(10),
  childrenAges: z.array(z.number().min(0).max(17)).default([]),
});

export type GenerateTourRequest = z.infer<typeof generateTourSchema>;

export type City = {
  name: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  duration: string;
};

export type RouteCard = {
  id: string;
  from: string;
  to: string;
  description: string;
  image: string;
  duration: string;
};

export type PreGeneratedTour = {
  id: string;
  from: string;
  to: string;
  content: string;
};
