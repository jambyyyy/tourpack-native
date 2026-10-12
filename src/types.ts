export type Role = "guide" | "tourist" | "admin";

export type GuideStatus = "pending_verification" | "verified" | "rejected";

export type BookingStatus = "pending" | "confirmed" | "declined";

export interface AppUser {
  uid: string;
  email: string | null;
  fullName: string | null;
  role: Role;
  status?: GuideStatus;
  accreditationNumber?: string;
  licenseImageUrl?: string;
}

export interface TourPackage {
  id: string;
  name: string;
  guide: string | null;
  guideId: string;
  toursGuided: number;
  date: string;
  duration: string;
  pax: number;
  price: number;
  imageUrl: string | null;
}

export interface GuideApplicant {
  uid: string;
  fullName: string;
  email: string;
  contact: string;
  specialty: string;
  accreditationNumber: string;
  licenseImageUrl: string;
  status: GuideStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  packageId: string;
  packageName: string;
  packageDate: string;
  guideId: string;
  guideName: string | null;
  touristId: string;
  touristName: string | null;
  touristEmail: string | null;
  guests: number;
  pricePerPax: number;
  total: number;
  notes: string;
  status: BookingStatus;
  createdAt: number;
}
