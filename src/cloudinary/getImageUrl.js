import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  },
});

export const getImageUrl = ({
  path,
  width,
  height,
  format,
  quality = "auto",
}) => {
  let imageUrl = cld.image(`website-assets/${path}.${format || "svg"}`);
  if (quality) {
    imageUrl = imageUrl.quality(quality);
  }
  if (width || height) {
    imageUrl = imageUrl.resize(fill().width(width).height(height));
  }
  return imageUrl.toURL();
};
