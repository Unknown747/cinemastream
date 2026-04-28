import { Helmet } from "react-helmet-async";
import { SITE_NAME as SITE_NAME_CONST, absoluteUrl } from "@/lib/site";

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  ogImage?: string;
  imageAlt?: string;
  type?: string;
  ogType?: string;
  pathname?: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
  jsonLd?: object | object[];
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  videoUrl?: string;
  videoSecureUrl?: string;
  videoType?: string;
  videoWidth?: number;
  videoHeight?: number;
};

const SITE_NAME = SITE_NAME_CONST;
const DEFAULT_IMAGE = "/opengraph.jpg";
const DEFAULT_LOCALE = "id_ID";

export function Seo({
  title,
  description,
  image,
  ogImage,
  imageAlt,
  type,
  ogType,
  pathname,
  path,
  keywords,
  noindex,
  jsonLd,
  publishedTime,
  modifiedTime,
  locale = DEFAULT_LOCALE,
  videoUrl,
  videoSecureUrl,
  videoType,
  videoWidth,
  videoHeight,
}: SeoProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const resolvedPath = path ?? pathname;
  const pathForUrl =
    resolvedPath ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const url = absoluteUrl(pathForUrl);
  const rawImage = ogImage ?? image ?? DEFAULT_IMAGE;
  const resolvedImage = rawImage.startsWith("http")
    ? rawImage
    : absoluteUrl(rawImage);
  const resolvedType = ogType ?? type ?? "website";
  const resolvedImageAlt = imageAlt ?? title;

  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <html lang="id" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1"
        />
      )}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="id" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      <meta property="og:type" content={resolvedType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:alt" content={resolvedImageAlt} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={locale} />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {videoUrl && <meta property="og:video" content={videoUrl} />}
      {videoSecureUrl && (
        <meta property="og:video:secure_url" content={videoSecureUrl} />
      )}
      {videoType && <meta property="og:video:type" content={videoType} />}
      {videoWidth && (
        <meta property="og:video:width" content={String(videoWidth)} />
      )}
      {videoHeight && (
        <meta property="og:video:height" content={String(videoHeight)} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={resolvedImageAlt} />

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
