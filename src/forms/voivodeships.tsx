const VOIVODESHIPS = [
    'dolnośląskie',
    'kujawsko-pomorskie',
    'lubelskie',
    'lubuskie',
    'łódzkie',
    'małopolskie',
    'mazowieckie',
    'opolskie',
    'podkarpackie',
    'podlaskie',
    'pomorskie',
    'śląskie',
    'świętokrzyskie',
    'warmińsko-mazurskie',
    'wielkopolskie',
    'zachodniopomorskie'
] as const;

export type Voivodeship = typeof VOIVODESHIPS[number];

const VOIVODESHIP_MAILS: ReadonlyMap<Voivodeship, string> = new Map([
    ['dolnośląskie', 'dolnoslaskie@mlodzirazem.org'],
    ['kujawsko-pomorskie', 'kujawsko-pomorskie@mlodzirazem.org'],
    ['lubelskie', 'lubelskie@mlodzirazem.org'],
    ['lubuskie', 'lubuskie@mlodzirazem.org'],
    ['łódzkie', 'lodzkie@mlodzirazem.org'],
    ['małopolskie', 'malopolskie@mlodzirazem.org'],
    ['mazowieckie', 'mazowieckie@mlodzirazem.org'],
    ['opolskie', 'opolskie@mlodzirazem.org'],
    ['podkarpackie', 'podkarpackie@mlodzirazem.org'],
    ['podlaskie', 'podlaskie@mlodzirazem.org'],
    ['pomorskie', 'pomorskie@mlodzirazem.org'],
    ['śląskie', 'slaskie@mlodzirazem.org'],
    ['świętokrzyskie', 'swietokrzyskie@mlodzirazem.org'],
    ['warmińsko-mazurskie', 'warminsko-mazurskie@mlodzirazem.org'],
    ['wielkopolskie', 'wielkopolskie@mlodzirazem.org'],
    ['zachodniopomorskie', 'zachodniopomorskie@mlodzirazem.org']
]);

export function findBoardMail(voivodeship: Voivodeship): string | undefined {
    return VOIVODESHIP_MAILS.get(voivodeship);
}

export default VOIVODESHIPS;