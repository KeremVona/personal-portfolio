// Types for vite-imagetools `?…&as=metadata` imports (the package ships none).
interface ImagetoolsMetadata {
  src: string
  width: number
  height: number
}

declare module '*as=metadata' {
  const metadata: ImagetoolsMetadata | ImagetoolsMetadata[]
  export default metadata
}
