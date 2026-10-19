export interface Fact {
  label: string
  value: string
}

export const profile = {
  name: 'Dr. Jayy',
  // Each inner list is one paragraph of facts.
  facts: [
    [
      { label: 'Name', value: 'Jayy Suzumiya' },
      { label: 'Japanese name', value: 'ジェイ・雀宮 (Jei Suzumiya)' },
      { label: 'Age', value: "(It's not polite to ask a lady her age)" },
      { label: 'Gender', value: 'Female' },
      { label: 'Pronouns', value: 'She / Her' },
    ],
    [
      { label: 'Nationality', value: 'Japanese-French' },
      { label: 'Height', value: '160cm' },
      { label: 'Weight', value: '48kg' },
      { label: 'Skin tone', value: 'Tan / warm olive' },
      {
        label: 'Occupation',
        value: 'Hospital director - physician & psychologist',
      },
    ],
    [
      {
        label: 'Likes',
        value:
          'Skateboarding, watching anime all day, snacking, skydiving, green tea, gratin, monjayaki, capturing absurd / candid pictures, akanezora (autumn dusk sky)',
      },
    ],
    [
      {
        label: 'Dislikes',
        value:
          'Her job (sometimes), people who smoke, her uncle, being told what to do',
      },
    ],
  ] satisfies Fact[][],
  lore: [
    "Her birth name was Jane. Her uncle gave her that name, since after her parents were gone, she was raised by her uncle and aunt from her mom's side.",
    'Before she knew skydiving, Jane was actually terrified of heights. She once got invited to go skydiving, she did all the training and preparation, but the second the plane door opened, she blacked out on the spot.',
    'One day, Jane went to look for resources in a remote area on planet Hazuniverse. She was accompanied by a pilot, Captain Navy. The atmosphere there was safe, just like on Earth.',
    // The sketch cuts off here; the rest of the lore is still to come.
    'Mid-flight, while they were having lunch, Captain Navy suddenly had a severe allergic reaction. Jane panicked, because their meals were supposed to be nut-free. She immediately…',
  ],
}
