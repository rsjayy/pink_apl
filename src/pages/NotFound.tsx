import { HomeApple } from '../components/HomeLinks'
import { PageTitle } from '../components/PageTitle'
import { Stage } from '../components/Stage'
import { TextLink } from '../components/TextLink'
import { NOT_FOUND_TITLE, PAGES } from '../routes'

export default function NotFound() {
  return (
    <Stage>
      <div className="flex flex-col gap-6 stage:p-10">
        <PageTitle>{NOT_FOUND_TITLE}</PageTitle>
        <p className="stage:text-lg">
          This room doesn't exist. Let's get you back.
        </p>
        <TextLink to={PAGES.lobby.path}>&lt; Lobby</TextLink>
      </div>
      <HomeApple />
    </Stage>
  )
}
