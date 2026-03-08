import { User } from './user.model';
import { Comment } from './comment.model';
import { Like } from './like.model';

export interface Post {
  _id: string;
  description: string;
  images: string[];
  date: Date;
  user: User;
  comments: Comment[];
  likes: Like[];
  categorie?: string;
}

