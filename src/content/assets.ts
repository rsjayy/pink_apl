// Every image on the site is a full link, stored in the content JSON files.

export function placeholder(width: number, height: number, text: string) {
  return `https://placehold.co/${width}x${height}/FFB7E1/ED4990?text=${encodeURIComponent(text)}`
}
