import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "video.movie" | "article";
  pathname?: string;
  jsonLd?: object | object[];
};

const SITE_NAME = "CinemaStream";
const DEFAULT_IMAGE = "/opengraph.jpg";

export function Seo({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = "website",
  pathname,
  jsonLd,
}: SeoProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${pathname ?? window.location.pathname}`
      : pathname ?? "";

  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
