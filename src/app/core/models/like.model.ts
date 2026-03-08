import { User } from './user.model';

export interface Like {
  _id: string;
  date: Date;
  user: User;
}

