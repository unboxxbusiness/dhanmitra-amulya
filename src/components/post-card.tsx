import Link from 'next/link';
import { SanityPost } from '@/lib/types';
import { SanityImage } from './sanity-image';
import { Badge } from './ui/badge';

interface PostCardProps {
  post: SanityPost;
  onCategoryClick: (category: string) => void;
}

export function PostCard({ post, onCategoryClick }: PostCardProps) {
  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden transition-shadow hover:shadow-md">
       <Link href={`/post/${post.slug}`}>
          <div className="relative w-full aspect-video">
             <SanityImage
              src={post.imageUrl}
              alt={post.title}
              className="object-cover"
            />
          </div>
       </Link>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-2">
            {post.categories?.map((category) => (
                <button key={category} onClick={() => onCategoryClick(category)}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-muted-foreground/20">{category}</Badge>
                </button>
            ))}
        </div>
        <h2 className="text-2xl font-bold leading-tight">
          <Link href={`/post/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h2>
      </div>
    </div>
  );
}
