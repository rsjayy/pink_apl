import { TextLink } from '../components/TextLink'
import { profile } from '../content/profile'
import { PAGES } from '../routes'
import { ProfileLayout } from './ProfileLayout'

export default function Lore() {
  return (
    <ProfileLayout footer={<TextLink to={PAGES.info.path}>&lt; Back</TextLink>}>
      {profile.lore.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </ProfileLayout>
  )
}
