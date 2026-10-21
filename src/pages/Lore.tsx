import { BBCode } from '../components/BBCode'
import { TextLink } from '../components/TextLink'
import { PAGES } from '../routes'
import { ProfileLayout } from './ProfileLayout'
import { builtContent } from '../content/site'

export default function Lore() {
  const { profile } = builtContent
  return (
    <ProfileLayout footer={<TextLink to={PAGES.info.path}>&lt; Back</TextLink>}>
      <BBCode text={profile.lore} />
    </ProfileLayout>
  )
}
