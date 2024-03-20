export interface User {
  user_id: number;
  username: string;
  password_hash: string;
}

export interface PostPreview {
  title: string;
  post_description: string;
  created_at: Date;
  image_path?: string;
  post_id: number;
  author_name: string;
}

export interface Post {
  title: string;
  post_description: string;
  created_at: Date;
  image_path?: string;
  post_id: number;
  author_name: string;
  content: string;
}

