import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  ogImage?: string;
  type?: string;
  ogType?: string;
  pathname?: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
  jsonLd?: object | object[];
};

const SITE_NAME = "CinemaStream";
const DEFAULT_IMAGE = "/opengraph.jpg";

export function Seo({
  title,
  description,
  image,
  ogImage,
  type,
  ogType,
  pathname,
  path,
  keywords,
  noindex,
  jsonLd,
}: SeoProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const resolvedPath = path ?? pathname;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${resolvedPath ?? window.location.pathname}`
      : resolvedPath ?? "";
  const resolvedImage = ogImage ?? image ?? DEFAULT_IMAGE;
  const resolvedType = ogType ?? type ?? "website";

  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content={resolvedType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
