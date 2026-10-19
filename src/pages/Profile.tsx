import { TextLink } from '../components/TextLink'
import { profile } from '../content/profile'
import { PAGES } from '../routes'
import { ProfileLayout } from './ProfileLayout'

export default function Profile() {
  return (
    <ProfileLayout footer={<TextLink to={PAGES.lore.path}>Lore &gt;</TextLink>}>
      {profile.facts.map((group, i) => (
        <dl key={i}>
          {group.map((fact) => (
            <div key={fact.label}>
              <dt className="inline">{fact.label}: </dt>
              <dd className="inline">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ))}
    </ProfileLayout>
  )
}
