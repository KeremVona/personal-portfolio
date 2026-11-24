import box from '../../assets/hero/cloud-box.json'

/** The hero picture's size, in source pixels (reference/647386481.png). */
export const ART = { width: 2730, height: 1536 }

/** Where the cloud layer sat in the picture (written by `npm run art:hero`). */
export const CLOUD_BOX = {
  left: box.left,
  top: box.top,
  width: box.width,
  height: box.height,
}

/** The portrait crop's size (centred on the cloud by the art script). */ export const PORTRAIT =
  { width: 1152, height: 1536 }
