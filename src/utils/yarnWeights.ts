
export const YARN_WEIGHTS = [
  { value: '0', label: 'Lace' },
  { value: '1', label: 'Light Fingering' },
  { value: '2', label: 'Fingering' },
  { value: '3', label: 'Sport' },
  { value: '4', label: 'DK' },
  { value: '5', label: 'Worsted' },
  { value: '6', label: 'Chunky' },
  { value: '7', label: 'Super Chunky' },
];

export const getYarnWeightLabel = (value: string | null): string => {
  if (!value) return '';
  const weight = YARN_WEIGHTS.find(w => w.value === value);
  return weight ? weight.label : value;
};
