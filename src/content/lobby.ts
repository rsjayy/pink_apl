import { PAGES } from '../routes'
import { assets } from './assets'

export const lobby = {
  heading: 'Welcome to Hospital Lobby',
  description: 'Insert some description blavlavla what is vro yapping about.',
  socialsIntro: 'My socials on everywhere:',
  socials: ['@hazukrist', '@luvlikissu', '@jayysau2x', '@hazukrispy'],
  disclaimer: '*(Not a real doctor, roleplay only)',
}

export const lobbyNav = [
  { label: 'Info', to: PAGES.info.path, icon: assets.syringe },
  { label: 'OC', to: PAGES.characters.path, icon: assets.pillOrange },
  { label: 'Species', to: PAGES.species.path, icon: assets.bandage },
  { label: 'Pharmacy', to: PAGES.pharmacy.path, icon: assets.pillPink },
]
