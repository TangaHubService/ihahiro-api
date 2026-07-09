// Rwanda's 5 provinces and 30 districts are a small, stable set of official administrative
// units, safe to hard-code. Sectors (~416), cells (~2,148), and villages (~14,800+) are not —
// see import-sub-locations.ts, which loads those from an official NISR CSV export instead of
// guessing thousands of names here.
export const RWANDA_PROVINCES_WITH_DISTRICTS: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': [
    'Gisagara',
    'Huye',
    'Kamonyi',
    'Muhanga',
    'Nyamagabe',
    'Nyanza',
    'Nyaruguru',
    'Ruhango',
  ],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': [
    'Karongi',
    'Ngororero',
    'Nyabihu',
    'Nyamasheke',
    'Rubavu',
    'Rusizi',
    'Rutsiro',
  ],
}
