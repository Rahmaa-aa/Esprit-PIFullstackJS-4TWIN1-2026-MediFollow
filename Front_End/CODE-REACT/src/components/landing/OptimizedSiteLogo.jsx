import React from "react";
import { generatePath } from "../../views/landing/landingPaths";

function webpSrcSet() {
  return `${generatePath("assets/images/logosite-160.webp")} 160w, ${generatePath("assets/images/logosite-320.webp")} 320w`;
}

/**
 * Logo site : WebP + PNG fallback, srcset pour la barre (petit) ou l’auth (jusqu’à 320px).
 */
export default function OptimizedSiteLogo({
  alt,
  sizes,
  className,
  style,
  width = 320,
  height = 180,
  fetchPriority,
  decoding = "async",
}) {
  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet()} sizes={sizes} />
      <img
        src={generatePath("assets/images/logosite.png")}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        decoding={decoding}
        {...(fetchPriority != null && fetchPriority !== ""
          ? { fetchpriority: fetchPriority }
          : {})}
      />
    </picture>
  );
}
