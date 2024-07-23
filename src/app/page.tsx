import Image from "next/image";
import Card from "@/app/card";

export default function Home() {
  return (
      <div>
          <div className="container max-w-full overflow-hidden h-max relative left-0 right-0">
              <div className="relative w-screen flex items-center justify-center left-0 right-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                      <h1 className="text-4xl text-favorite font-joekubert font-bold text-center z-10 sm:text-dynamic md:text-6xl lg:text-8xl text-outline">
                          HitomiHiumi
                      </h1>
                  </div>
                  <Image
                      src="/bgheader.png"
                      alt="bgheader"
                      width={1826}
                      height={517}
                      className="w-screen h-auto object-contain -z-10 flex top-0 left-0 right-0 relative brightness-50"
                  />
              </div>
          </div>
          <div className="relative flex mt-12">
              <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="lg:text-5xl md:text-3xl sm:text-xl text-white font-joekubert font-bold text-center">Projects</h2>
              </div>
          </div>
          <div className="flex flex-col items-center mt-12">
              <Card
                  imageSrc="/placeholder.jpg"
                  title="Lazy Canvas"
                  description="This is a simple module designed to simplify the interaction with canvas, for people who do not know how to work with it."
                  githubLink="https://github.com/hitomihiumi/lazy-canvas-ts"
                  docsLink="/docs/lazycanvas/index.html"
              />
              <Card
                  imageSrc="/placeholder.jpg"
                  title="Lazy Animation"
                  description="Plugin for LazyCanvas, designed to provide animated image creation functionality."
                  githubLink="https://github.com/hitomihiumi/lazy-animation"
                  docsLink="/docs/lazyanimation/index.html"
              />
              <Card
                  imageSrc="/placeholder.jpg"
                  title="2048 Game"
                  description="This is a simple logic and rendering module for the game 2048, it is mainly intended for users of discord.js etc."
                  githubLink="https://github.com/hitomihiumi/2048-game"
                  docsLink="/docs/2048game/index.html"
              />
          </div>
      </div>
  )
      ;
}
