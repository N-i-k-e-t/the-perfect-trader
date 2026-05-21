typedef BaselineState = String;

const List<BaselineState> baselineStates = [
  'very_bad',
  'bad',
  'neutral',
  'good',
  'great',
];

String baselineLabel(BaselineState state) {
  switch (state) {
    case 'very_bad':
      return 'Very low';
    case 'bad':
      return 'Low';
    case 'neutral':
      return 'Neutral';
    case 'good':
      return 'Good';
    case 'great':
      return 'Great';
    default:
      return state;
  }
}
