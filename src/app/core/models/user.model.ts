import { S } from "@angular/material/icon-registry.d-BVwP8t9_";

export interface User {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  birthdate?: Date;
  phone?: string;
  adresse?: {
    street?: string;
    ville?: string;
    region?: string;
  } | null;
  role?: string;
  isApproved?: boolean;
  username?: string;
  image?: string;
  totalRating?: number;
}

