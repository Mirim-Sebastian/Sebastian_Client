import type { ReactNode } from "react"
import blowfishUrl from "../assets/images/frame/blowfish.png"
import boxfishUrl from "../assets/images/frame/boxfish.png"
import fishUrl from "../assets/images/frame/fish.png"
import goldfishUrl from "../assets/images/frame/goldfish.png"
import hippocampusUrl from "../assets/images/frame/hippocampus.png"
import jellyfishUrl from "../assets/images/frame/jellyfish.png"
import nemoUrl from "../assets/images/frame/nemo.png"
import octopusUrl from "../assets/images/frame/octopus.png"
import sharkUrl from "../assets/images/frame/shark.png"
import shrimpUrl from "../assets/images/frame/shrimp.png"
import spinyfishUrl from "../assets/images/frame/spinyfish.png"

export type FishTemplate = {
  id: string
  icon: ReactNode
  imageUrl: string
}

export const FISH_TEMPLATES: FishTemplate[] = [
  {
    id: "free",
    icon: null,
    imageUrl: "",
  },
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
  {
    id: "boxfish",
    icon: <img src={boxfishUrl} alt="복어" />,
    imageUrl: boxfishUrl,
  },
  {
    id: "jellyfish",
    icon: <img src={jellyfishUrl} alt="해파리" />,
    imageUrl: jellyfishUrl,
  },
  {
    id: "shrimp",
    icon: <img src={shrimpUrl} alt="새우" />,
    imageUrl: shrimpUrl,
  },
  {
    id: "spinyfish",
    icon: <img src={spinyfishUrl} alt="가시복어" />,
    imageUrl: spinyfishUrl,
  },
  {
    id: "blowfish",
    icon: <img src={blowfishUrl} alt="복어" />,
    imageUrl: blowfishUrl,
  },
  {
    id: "fish",
    icon: <img src={fishUrl} alt="물고기" />,
    imageUrl: fishUrl,
  },
]