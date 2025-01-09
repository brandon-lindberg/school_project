'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
}

const FallbackImage = ({ src, alt, fallbackSrc, className }: FallbackImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
      width={64}
      height={64}
    />
  );
};

export default FallbackImage;
