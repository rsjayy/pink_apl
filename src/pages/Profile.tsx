import { BBCode } from '../components/BBCode'
import { TextLink } from '../components/TextLink'
import { PAGES } from '../routes'
import { ProfileLayout } from './ProfileLayout'
import { builtContent } from '../content/site'

export default function Profile() {
  const { profile } = builtContent
  return (
    <ProfileLayout footer={<TextLink to={PAGES.lore.path}>Lore &gt;</TextLink>}>
      <BBCode text={profile.about} />
    </ProfileLayout>
  )
}
