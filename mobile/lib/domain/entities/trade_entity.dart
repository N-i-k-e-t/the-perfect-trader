import 'baseline_state.dart';

class TradeEntity {
  const TradeEntity({
    required this.id,
    required this.date,
    required this.pair,
    required this.type,
    required this.entry,
    required this.exit,
    this.plannedEntry,
    this.plannedSL,
    this.actualSL,
    this.plannedTP,
    this.pnl,
    this.pnlR,
    this.rulesFollowed = const [],
    this.rulesBroken = const [],
    this.emotion = 'neutral',
    this.moodBefore,
    this.moodAfter,
    this.setupId,
    this.setupQuality,
    this.notes = '',
  });

  final String id;
  final String date;
  final String pair;
  final String type;
  final String entry;
  final String exit;
  final String? plannedEntry;
  final String? plannedSL;
  final String? actualSL;
  final String? plannedTP;
  final double? pnl;
  final double? pnlR;
  final List<String> rulesFollowed;
  final List<String> rulesBroken;
  final BaselineState emotion;
  final BaselineState? moodBefore;
  final BaselineState? moodAfter;
  final String? setupId;
  final String? setupQuality;
  final String notes;

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date,
        'pair': pair,
        'type': type,
        'entry': entry,
        'exit': exit,
        if (plannedEntry != null) 'plannedEntry': plannedEntry,
        if (plannedSL != null) 'plannedSL': plannedSL,
        if (actualSL != null) 'actualSL': actualSL,
        if (plannedTP != null) 'plannedTP': plannedTP,
        if (pnl != null) 'pnl': pnl,
        if (pnlR != null) 'pnlR': pnlR,
        'rules_followed': rulesFollowed,
        'rules_broken': rulesBroken,
        'emotion': emotion,
        if (moodBefore != null) 'moodBefore': moodBefore,
        if (moodAfter != null) 'moodAfter': moodAfter,
        if (setupId != null) 'setupId': setupId,
        if (setupQuality != null) 'setupQuality': setupQuality,
        'notes': notes,
      };

  factory TradeEntity.fromJson(Map<String, dynamic> json) {
    return TradeEntity(
      id: json['id'] as String? ?? '',
      date: json['date'] as String? ?? '',
      pair: json['pair'] as String? ?? '',
      type: json['type'] as String? ?? 'Long',
      entry: json['entry'] as String? ?? '',
      exit: json['exit'] as String? ?? '',
      plannedEntry: json['plannedEntry'] as String?,
      plannedSL: json['plannedSL'] as String?,
      actualSL: json['actualSL'] as String?,
      plannedTP: json['plannedTP'] as String?,
      pnl: (json['pnl'] as num?)?.toDouble(),
      pnlR: (json['pnlR'] as num?)?.toDouble(),
      rulesFollowed: _stringList(json['rules_followed']),
      rulesBroken: _stringList(json['rules_broken']),
      emotion: json['emotion'] as String? ?? 'neutral',
      moodBefore: json['moodBefore'] as String?,
      moodAfter: json['moodAfter'] as String?,
      setupId: json['setupId'] as String?,
      setupQuality: json['setupQuality']?.toString(),
      notes: json['notes'] as String? ?? '',
    );
  }
}

List<String> _stringList(dynamic value) {
  if (value is List) {
    return value.map((e) => e.toString()).toList();
  }
  return const [];
}
