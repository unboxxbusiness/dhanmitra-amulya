import { client } from "@/lib/sanity";
import { SanityPost } from "@/lib/types";
import { SanityImage } from "@/components/sanity-image";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: { slug: string };
};

async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt,
    publishedAt,
    "categories": categories[]->title,
    body
  }`;

  const post = await client.fetch<SanityPost>(query, { slug });
  return post;
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="prose prose-lg dark:prose-invert mx-auto">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
      <div className="text-sm text-muted-foreground mb-4">
        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {post.categories?.map((category) => (
          <Badge key={category} variant="secondary">{category}</Badge>
        ))}
      </div>
      {post.imageUrl && (
        <div className="relative w-full h-96 mb-8">
           <SanityImage
                src={post.imageUrl}
                alt={post.imageAlt || "Post image"}
                className="rounded-lg object-cover"
            />
        </div>
      )}
      <PortableText value={post.body} />
    </article>
  );
}

// Revalidate every 60 seconds
export const revalidate = 60;
