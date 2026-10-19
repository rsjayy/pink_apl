// Every image on the site, in one place. All placeholders for now: when the
// real art arrives, drop the files in public/img/ and swap each entry for
// img('file.png').

export function placeholder(width: number, height: number, text: string) {
  return `https://placehold.co/${width}x${height}/FFB7E1/ED4990?text=${encodeURIComponent(text)}`
}

/** A file in public/img/. Never a leading "/": the site lives under /pink_apl/. */
export function img(file: string) {
  return `${import.meta.env.BASE_URL}img/${file}`
}

// Stock photos stand in until the art is ready.
const COVER =
  'https://media.gettyimages.com/id/1806608544/photo/portrait-of-a-female-doctor-at-the-workplace.jpg?s=612x612&w=gi&k=20&c=Bzwxj5Ejao4gz4Wm_SRKB-V2Gvx-RzXxhuqa-n-adsE='
const YELLOW_PILL =
  'https://c8.alamy.com/comp/D04YFW/yellow-pill-capsule-closeup-on-white-D04YFW.jpg'

export const assets = {
  apple:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Honeycrisp-Apple.jpg/330px-Honeycrisp-Apple.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
  banner: COVER,
  syringe:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Syringe2.jpg/330px-Syringe2.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
  pillOrange: YELLOW_PILL,
  bandage:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Sparadrap_3.jpg/330px-Sparadrap_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
  pillPink:
    'https://t3.ftcdn.net/jpg/21/89/19/28/360_F_2189192821_DozjEs26kVyGhLuQXMZUzeEBF5EjwijR.jpg',
  profileArt: COVER,
  chibi: placeholder(200, 260, 'Chibi'),
}
