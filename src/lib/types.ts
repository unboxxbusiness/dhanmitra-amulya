import { PortableTextBlock } from "sanity";

export interface SanityPost {
    _id: string;
    title: string;
    slug: string;
    mainImage: {
        asset: {
            _ref: string;
            _type: string;
        };
    };
    imageUrl?: string;
    imageAlt?: string;
    publishedAt: string;
    categories?: string[];
    body: PortableTextBlock[];
}
