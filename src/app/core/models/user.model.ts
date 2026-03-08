export interface User {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  birthdate?: Date;
  phone?: string;
  role?: string;
  username?: string;
  image?: string;
  totalRating?: number;
}

