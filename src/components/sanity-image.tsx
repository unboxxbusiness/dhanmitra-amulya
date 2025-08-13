'use client';

import Image from 'next/image';
import { useNextSanityImage } from 'next-sanity-image';
import { client } from '@/lib/sanity';

interface SanityImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SanityImage({ src, alt, className }: SanityImageProps) {
    if (!src) {
        return null;
    }
  const imageProps = useNextSanityImage(client, src);

  return (
    <Image
      {...imageProps}
      alt={alt}
      layout="fill"
      className={className}
      placeholder="blur"
      blurDataURL={imageProps.blurDataURL}
    />
  );
}
