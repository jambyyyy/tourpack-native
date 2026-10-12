import type { TourPackage } from "../../types";

export interface ItineraryItem {
  time: string;
  activity: string;
}

// A TourPackage that may also carry an itinerary (older packages won't have one).
export type PackageWithItinerary = TourPackage & { itinerary?: ItineraryItem[] };