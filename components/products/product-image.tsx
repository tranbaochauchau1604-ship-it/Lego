import Image, { type ImageProps } from "next/image";

/** next/image cho ảnh sản phẩm. Ảnh SVG placeholder không cần tối ưu nên bỏ qua optimizer. */
export function ProductImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string | null | undefined }) {
  const url = src || "/placeholders/empty.svg";
  return <Image src={url} alt={alt} unoptimized={url.endsWith(".svg")} {...rest} />;
}
