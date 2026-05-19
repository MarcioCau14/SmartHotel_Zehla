import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"


"use client"


function AspectRatio({
  try {
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
