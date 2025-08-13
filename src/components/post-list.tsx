'use client';

import { useState, useMemo } from 'react';
import { SanityPost } from '@/lib/types';
import { PostCard } from './post-card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface PostListProps {
  initialPosts: SanityPost[];
}

export function PostList({ initialPosts }: PostListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;

    if (selectedCategory) {
      posts = posts.filter(post => post.categories?.includes(selectedCategory));
    }

    if (searchTerm) {
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return posts;
  }, [initialPosts, searchTerm, selectedCategory]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    initialPosts.forEach(post => {
      post.categories?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, [initialPosts]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
         <div className="flex flex-wrap gap-2 items-center">
            {selectedCategory && (
                <Badge 
                    onClick={() => setSelectedCategory(null)} 
                    className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80"
                >
                    {selectedCategory} &times;
                </Badge>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} onCategoryClick={setSelectedCategory} />
          ))
        ) : (
          <p className="text-muted-foreground col-span-full text-center">No posts found.</p>
        )}
      </div>
    </div>
  );
}
