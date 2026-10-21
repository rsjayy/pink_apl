import { placeholder } from '../content/assets'
import {
  MENU,
  type Card,
  type CardsContent,
  type LobbyContent,
  type SiteContent,
} from '../content/site'
import { PAGES } from '../routes'
import { BBCodeEditor } from './BBCodeEditor'
import { Field, ImageInput, TextInput } from './fields'
import { ListEditor } from './ListEditor'

/** Each section edits part of one content file. */
export interface SectionProps<K extends keyof SiteContent> {
  value: SiteContent[K]
  onChange: (value: SiteContent[K]) => void
}

function LobbyForm({ value, onChange }: SectionProps<'lobby'>) {
  const set = <F extends keyof LobbyContent>(field: F, v: LobbyContent[F]) =>
    onChange({ ...value, [field]: v })

  return (
    <>
      <Field label="Lobby big text">
        <TextInput value={value.heading} onChange={(v) => set('heading', v)} />
      </Field>
      <Group title="Lobby intro">
        <BBCodeEditor
          value={value.description}
          onChange={(v) => set('description', v)}
          height={240}
        />
      </Group>
      <Field label="Disclaimer">
        <TextInput
          value={value.disclaimer}
          onChange={(v) => set('disclaimer', v)}
        />
      </Field>
      <ImageInput
        label="Cover picture image link"
        hint="3:1 ratio"
        value={value.banner}
        onChange={(v) => set('banner', v)}
      />
      <ImageInput
        label="Back button image link (floating apple at the bottom)"
        hint="Square"
        value={value.apple}
        onChange={(v) => set('apple', v)}
      />
      <Group
        title="Menu button image links"
        hint="Square. Same image used in each page"
      >
        {MENU.map(({ label, page }) => (
          <ImageInput
            key={page}
            label={label}
            value={value.menuIcons[page]}
            onChange={(icon) =>
              set('menuIcons', { ...value.menuIcons, [page]: icon })
            }
          />
        ))}
      </Group>
    </>
  )
}

function ProfileForm({ value, onChange }: SectionProps<'profile'>) {
  return (
    <>
      <Field label="Name">
        <TextInput
          value={value.name}
          onChange={(name) => onChange({ ...value, name })}
        />
      </Field>
      <Group title="About" hint="Blank line for paragraph breaks">
        <BBCodeEditor
          value={value.about}
          onChange={(about) => onChange({ ...value, about })}
        />
      </Group>
      <Group title="Lore" hint="Blank line for paragraph breaks">
        <BBCodeEditor
          value={value.lore}
          onChange={(lore) => onChange({ ...value, lore })}
          height={480}
        />
      </Group>
      <ImageInput
        label="Background art"
        hint="Landscape 16:10"
        value={value.profileArt}
        onChange={(profileArt) => onChange({ ...value, profileArt })}
      />
      <ImageInput
        label="Chibi"
        value={value.chibi}
        onChange={(chibi) => onChange({ ...value, chibi })}
      />
    </>
  )
}

function CardFields({
  card,
  update,
}: {
  card: Card
  update: (card: Card) => void
}) {
  // Empty optional fields are dropped, so the page doesn't show an empty line.
  const set = (field: 'name' | 'caption' | 'url', v: string) => {
    const next = { ...card, [field]: v }
    if (!v) delete next[field]
    update(next)
  }

  return (
    <>
      <ImageInput
        label="Avatar image link"
        hint="Square image"
        value={card.image}
        onChange={(image) => update({ ...card, image })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <TextInput value={card.name ?? ''} onChange={(v) => set('name', v)} />
        </Field>
        <Field label="Caption" hint="Display under the image">
          <TextInput
            value={card.caption ?? ''}
            onChange={(v) => set('caption', v)}
          />
        </Field>
      </div>
      <Field label="Link" hint="It will open in a new tab">
        <TextInput
          value={card.url ?? ''}
          placeholder="https://"
          onChange={(v) => set('url', v)}
        />
      </Field>
    </>
  )
}

/** A collapsed card: its picture and name. */
function CardSummary({ card }: { card: Card }) {
  const src = card.image.trim()
  return (
    <span className="flex items-center gap-3">
      <span className="size-10 shrink-0 overflow-hidden rounded-md border-2 border-bubblegum bg-blush">
        {src && <img src={src} alt="" className="size-full object-cover" />}
      </span>
      <span className="truncate font-semibold">
        {card.name || card.caption || 'Untitled'}
      </span>
    </span>
  )
}

function cardList(list: 'characters' | 'species' | 'thanks') {
  return function CardList({ value, onChange }: SectionProps<'cards'>) {
    return (
      <>
        {list === 'thanks' && (
          <Field label="Subtitle">
            <TextInput
              value={value.pharmacySubtitle}
              onChange={(pharmacySubtitle) =>
                onChange({ ...value, pharmacySubtitle })
              }
            />
          </Field>
        )}
        <ListEditor
          items={value[list]}
          onChange={(cards) =>
            onChange({ ...value, [list]: cards } as CardsContent)
          }
          itemName="card"
          newItem={() => ({
            name: 'New',
            image: placeholder(400, 400, 'New'),
          })}
          summary={(card) => <CardSummary card={card} />}
          renderItem={(card, update) => (
            <CardFields card={card} update={update} />
          )}
        />
      </>
    )
  }
}

function Group({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold">{title}</legend>
      {hint && <p className="-mt-2 text-xs text-neutral-500">{hint}</p>}
      {children}
    </fieldset>
  )
}

type Section = {
  [K in keyof SiteContent]: {
    id: string
    label: string
    file: K
    /** The parts of the file this section edits. Unset means all of it. */
    fields?: (keyof SiteContent[K])[]
    Form: (props: SectionProps<K>) => React.ReactNode
  }
}[keyof SiteContent]

export const SECTIONS: Section[] = [
  {
    id: 'lobby',
    label: 'Lobby',
    file: 'lobby',
    Form: LobbyForm,
  },
  {
    id: 'info',
    label: 'Bio',
    file: 'profile',
    Form: ProfileForm,
  },
  {
    id: 'characters',
    label: PAGES.characters.title,
    file: 'cards',
    fields: ['characters'],
    Form: cardList('characters'),
  },
  {
    id: 'species',
    label: PAGES.species.title,
    file: 'cards',
    fields: ['species'],
    Form: cardList('species'),
  },
  {
    id: 'pharmacy',
    label: PAGES.pharmacy.title,
    file: 'cards',
    fields: ['thanks', 'pharmacySubtitle'],
    Form: cardList('thanks'),
  },
]

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Whether this section's part of the content differs between two versions. */
export function sectionChanged(
  section: Section,
  a: SiteContent,
  b: SiteContent,
) {
  const fileA = a[section.file] as unknown as Record<string, unknown>
  const fileB = b[section.file] as unknown as Record<string, unknown>
  const fields = (section.fields as string[] | undefined) ?? [
    ...new Set([...Object.keys(fileA), ...Object.keys(fileB)]),
  ]
  return fields.some((field) => !same(fileA[field], fileB[field]))
}
