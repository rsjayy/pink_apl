import { Link } from 'react-router'
import { HomeApple } from '../components/HomeLinks'
import { Stage } from '../components/Stage'
import { assets } from '../content/assets'
import { lobby, lobbyNav } from '../content/lobby'

export default function Lobby() {
  return (
    <Stage>
      {/* Phones: banner, welcome box, nav stacked. Stage: nav down the left. */}
      <div className="flex flex-col gap-6 stage:grid stage:h-full stage:grid-cols-[17rem_1fr] stage:grid-rows-[15rem_1fr] stage:gap-x-10 stage:p-10 stage:pr-24">
        <div className="relative overflow-hidden rounded-2xl stage:col-start-2 stage:row-start-1">
          <img
            src={assets.banner}
            alt=""
            className="h-40 w-full object-cover object-[50%_20%] stage:h-full"
          />
        </div>

        <section className="flex flex-col border-4 border-hotpink bg-white/60 p-5 stage:col-start-2 stage:row-start-2 stage:mt-6 stage:min-h-0 stage:px-8">
          <h1 className="border-b-4 border-hotpink pb-2 text-center font-display text-3xl stage:text-5xl">
            {lobby.heading}
          </h1>
          <div className="flex flex-1 flex-col justify-center gap-3 py-6 text-center stage:text-lg">
            <p>{lobby.description}</p>
            <p>
              {lobby.socialsIntro} {lobby.socials.join(' ')}
            </p>
          </div>
          <p className="text-xs stage:text-sm">{lobby.disclaimer}</p>
        </section>

        <nav className="grid grid-cols-2 gap-4 stage:col-start-1 stage:row-span-2 stage:row-start-1 stage:flex stage:flex-col stage:justify-around">
          {lobbyNav.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex h-16 items-center rounded-xl border-4 border-hotpink bg-white/70 pr-12 pl-4 font-display text-xl transition-colors hover:bg-white stage:h-20 stage:pr-20 stage:pl-8 stage:text-3xl"
            >
              {item.label}
              <img
                src={item.icon}
                alt=""
                // Centred with my-auto, not translate: the float animation owns translate.
                className="absolute inset-y-0 right-1 my-auto size-12 rounded-lg object-cover shadow-md motion-safe:animate-float stage:-right-6 stage:size-20"
                // Start each icon at a different point so they don't bob in unison.
                style={{ animationDelay: `${-i * 1.25}s` }}
              />
            </Link>
          ))}
        </nav>
      </div>
      <HomeApple />
    </Stage>
  )
}
