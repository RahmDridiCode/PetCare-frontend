import { User } from './user.model';

export interface Comment {
  _id: string;
  text: string;
  date: Date;
  user: User;
}

