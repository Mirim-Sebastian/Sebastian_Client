import type { ReactNode } from "react"
import goldfishUrl from "../assets/images/frame/goldfish.png"
import hippocampusUrl from "../assets/images/frame/hippocampus.png"
import nemoUrl from "../assets/images/frame/nemo.png"
import octopusUrl from "../assets/images/frame/octopus.png"
import sharkUrl from "../assets/images/frame/shark.png"

export type FishTemplate = {
  id: string
  icon: ReactNode
  imageUrl: string
}

export const FISH_TEMPLATES: FishTemplate[] = [
  {
    id: "goldfish",
    icon: <img src={goldfishUrl} alt="금붕어" />,
    imageUrl: goldfishUrl,
  },
  {
    id: "hippocampus",
    icon: <img src={hippocampusUrl} alt="해마" />,
    imageUrl: hippocampusUrl,
  },
  {
    id: "nemo",
    icon: <img src={nemoUrl} alt="니모" />,
    imageUrl: nemoUrl,
  },
  {
    id: "octopus",
    icon: <img src={octopusUrl} alt="문어" />,
    imageUrl: octopusUrl,
  },
  {
    id: "shark",
    icon: <img src={sharkUrl} alt="상어" />,
    imageUrl: sharkUrl,
  },
]