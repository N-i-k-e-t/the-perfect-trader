/// Dart models aligned with [src/types/trading.ts]

enum BaselineState { veryBad, bad, neutral, good, great }

BaselineState baselineStateFromString(String? value) {
  switch (value) {
    case 'very_bad':
      return BaselineState.veryBad;
    case 'bad':
      return BaselineState.bad;
    case 'good':
      return BaselineState.good;
    case 'great':
      return BaselineState.great;
    default:
      return BaselineState.neutral;
  }
}

String baselineStateToString(BaselineState state) {
  switch (state) {
    case BaselineState.veryBad:
      return 'very_bad';
    case BaselineState.bad:
      return 'bad';
    case BaselineState.neutral:
      return 'neutral';
    case BaselineState.good:
      return 'good';
    case BaselineState.great:
      return 'great';
  }
}

class TraderUser {
  const TraderUser({
    required this.email,
    required this.name,
    this.isPro = false,
    this.isAdmin,
    this.role,
    this.trialStartDate,
  });

  final String email;
  final String name;
  final bool isPro;
  final bool? isAdmin;
  final String? role;
  final String? trialStartDate;

  TraderUser copyWith({
    String? email,
    String? name,
    bool? isPro,
    bool? isAdmin,
    String? role,
    String? trialStartDate,
  }) {
    return TraderUser(
      email: email ?? this.email,
      name: name ?? this.name,
      isPro: isPro ?? this.isPro,
      isAdmin: isAdmin ?? this.isAdmin,
      role: role ?? this.role,
      trialStartDate: trialStartDate ?? this.trialStartDate,
    );
  }

  Map<String, dynamic> toJson() => {
        'email': email,
        'name': name,
        'isPro': isPro,
        if (isAdmin != null) 'isAdmin': isAdmin,
        if (role != null) 'role': role,
        if (trialStartDate != null) 'trialStartDate': trialStartDate,
      };

  factory TraderUser.fromJson(Map<String, dynamic> json) {
    return TraderUser(
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? 'Trader',
      isPro: json['isPro'] as bool? ?? false,
      isAdmin: json['isAdmin'] as bool?,
      role: json['role'] as String?,
      trialStartDate: json['trialStartDate'] as String?,
    );
  }
}

class Rule {
  const Rule({
    required this.id,
    required this.text,
    this.emoji,
    this.category,
    this.isActive = true,
    this.violated,
  });

  final String id;
  final String text;
  final String? emoji;
  final String? category;
  final bool isActive;
  final bool? violated;

  Rule copyWith({
    String? id,
    String? text,
    String? emoji,
    String? category,
    bool? isActive,
    bool? violated,
  }) {
    return Rule(
      id: id ?? this.id,
      text: text ?? this.text,
      emoji: emoji ?? this.emoji,
      category: category ?? this.category,
      isActive: isActive ?? this.isActive,
      violated: violated ?? this.violated,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        if (emoji != null) 'emoji': emoji,
        if (category != null) 'category': category,
        'isActive': isActive,
        if (violated != null) 'violated': violated,
      };

  factory Rule.fromJson(Map<String, dynamic> json) {
    return Rule(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
      emoji: json['emoji'] as String?,
      category: json['category'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      violated: json['violated'] as bool?,
    );
  }
}

class Trade {
  const Trade({
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
    this.emotion = BaselineState.neutral,
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
  final num? setupQuality;
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
        'emotion': baselineStateToString(emotion),
        if (moodBefore != null) 'moodBefore': baselineStateToString(moodBefore!),
        if (moodAfter != null) 'moodAfter': baselineStateToString(moodAfter!),
        if (setupId != null) 'setupId': setupId,
        if (setupQuality != null) 'setupQuality': setupQuality,
        'notes': notes,
      };

  factory Trade.fromJson(Map<String, dynamic> json) {
    return Trade(
      id: json['id'] as String? ?? '',
      date: json['date'] as String? ?? '',
      pair: json['pair'] as String? ?? '',
      type: json['type'] as String? ?? 'Long',
      entry: json['entry']?.toString() ?? '',
      exit: json['exit']?.toString() ?? '',
      plannedEntry: json['plannedEntry']?.toString(),
      plannedSL: json['plannedSL']?.toString(),
      actualSL: json['actualSL']?.toString(),
      plannedTP: json['plannedTP']?.toString(),
      pnl: (json['pnl'] as num?)?.toDouble(),
      pnlR: (json['pnlR'] as num?)?.toDouble(),
      rulesFollowed: _stringList(json['rules_followed']),
      rulesBroken: _stringList(json['rules_broken']),
      emotion: baselineStateFromString(json['emotion'] as String?),
      moodBefore: json['moodBefore'] != null
          ? baselineStateFromString(json['moodBefore'] as String?)
          : null,
      moodAfter: json['moodAfter'] != null
          ? baselineStateFromString(json['moodAfter'] as String?)
          : null,
      setupId: json['setupId'] as String?,
      setupQuality: json['setupQuality'] as num?,
      notes: json['notes'] as String? ?? '',
    );
  }
}

class Session {
  const Session({
    required this.date,
    this.emotionalBaseline = BaselineState.neutral,
    this.rulesLocked = false,
    this.tradesTaken = 0,
    this.tradesAllowed = 3,
    this.stabilityScore = 85,
    this.preSessionComplete = false,
    this.notes = '',
  });

  final String date;
  final BaselineState emotionalBaseline;
  final bool rulesLocked;
  final int tradesTaken;
  final int tradesAllowed;
  final int stabilityScore;
  final bool preSessionComplete;
  final String notes;

  Session copyWith({
    String? date,
    BaselineState? emotionalBaseline,
    bool? rulesLocked,
    int? tradesTaken,
    int? tradesAllowed,
    int? stabilityScore,
    bool? preSessionComplete,
    String? notes,
  }) {
    return Session(
      date: date ?? this.date,
      emotionalBaseline: emotionalBaseline ?? this.emotionalBaseline,
      rulesLocked: rulesLocked ?? this.rulesLocked,
      tradesTaken: tradesTaken ?? this.tradesTaken,
      tradesAllowed: tradesAllowed ?? this.tradesAllowed,
      stabilityScore: stabilityScore ?? this.stabilityScore,
      preSessionComplete: preSessionComplete ?? this.preSessionComplete,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': date,
        'emotionalBaseline': baselineStateToString(emotionalBaseline),
        'rulesLocked': rulesLocked,
        'tradesTaken': tradesTaken,
        'tradesAllowed': tradesAllowed,
        'stabilityScore': stabilityScore,
        'preSessionComplete': preSessionComplete,
        'notes': notes,
      };

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      date: json['date'] as String? ?? '',
      emotionalBaseline:
          baselineStateFromString(json['emotionalBaseline'] as String?),
      rulesLocked: json['rulesLocked'] as bool? ?? false,
      tradesTaken: json['tradesTaken'] as int? ?? 0,
      tradesAllowed: json['tradesAllowed'] as int? ?? 3,
      stabilityScore: json['stabilityScore'] as int? ?? 85,
      preSessionComplete: json['preSessionComplete'] as bool? ?? false,
      notes: json['notes'] as String? ?? '',
    );
  }
}

class DailyLog {
  const DailyLog({
    required this.date,
    this.tradesLogged = 0,
    this.rulesChecked = const [],
    this.mood = 'neutral',
    this.rulesFollowed = 0,
    this.rulesBroken = 0,
    this.pnl,
    this.hasPrePlan,
    this.hasPostNote,
    this.complianceScore,
    this.grade,
    this.events,
  });

  final String date;
  final int tradesLogged;
  final List<String> rulesChecked;
  final String mood;
  final int rulesFollowed;
  final int rulesBroken;
  final double? pnl;
  final bool? hasPrePlan;
  final bool? hasPostNote;
  final double? complianceScore;
  final String? grade;
  final List<String>? events;

  DailyLog copyWith({
    String? date,
    int? tradesLogged,
    List<String>? rulesChecked,
    String? mood,
    int? rulesFollowed,
    int? rulesBroken,
    double? pnl,
    bool? hasPrePlan,
    bool? hasPostNote,
    double? complianceScore,
    String? grade,
    List<String>? events,
  }) {
    return DailyLog(
      date: date ?? this.date,
      tradesLogged: tradesLogged ?? this.tradesLogged,
      rulesChecked: rulesChecked ?? this.rulesChecked,
      mood: mood ?? this.mood,
      rulesFollowed: rulesFollowed ?? this.rulesFollowed,
      rulesBroken: rulesBroken ?? this.rulesBroken,
      pnl: pnl ?? this.pnl,
      hasPrePlan: hasPrePlan ?? this.hasPrePlan,
      hasPostNote: hasPostNote ?? this.hasPostNote,
      complianceScore: complianceScore ?? this.complianceScore,
      grade: grade ?? this.grade,
      events: events ?? this.events,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': date,
        'tradesLogged': tradesLogged,
        'rulesChecked': rulesChecked,
        'mood': mood,
        'rulesFollowed': rulesFollowed,
        'rulesBroken': rulesBroken,
        if (pnl != null) 'pnl': pnl,
        if (hasPrePlan != null) 'hasPrePlan': hasPrePlan,
        if (hasPostNote != null) 'hasPostNote': hasPostNote,
        if (complianceScore != null) 'complianceScore': complianceScore,
        if (grade != null) 'grade': grade,
        if (events != null) 'events': events,
      };

  factory DailyLog.fromJson(Map<String, dynamic> json) {
    return DailyLog(
      date: json['date'] as String? ?? '',
      tradesLogged: json['tradesLogged'] as int? ?? 0,
      rulesChecked: _stringList(json['rulesChecked']),
      mood: json['mood'] as String? ?? 'neutral',
      rulesFollowed: json['rulesFollowed'] as int? ?? 0,
      rulesBroken: json['rulesBroken'] as int? ?? 0,
      pnl: (json['pnl'] as num?)?.toDouble(),
      hasPrePlan: json['hasPrePlan'] as bool?,
      hasPostNote: json['hasPostNote'] as bool?,
      complianceScore: (json['complianceScore'] as num?)?.toDouble(),
      grade: json['grade'] as String?,
      events: json['events'] != null ? _stringList(json['events']) : null,
    );
  }
}

class Analytics {
  const Analytics({
    this.weeklyStability = const [72, 85, 68, 91, 88, 79, 85],
    this.ruleAdherence = 82,
    this.avgTradesPerDay = 2.3,
    this.behavioralTrend = 'stabilizing',
    this.consistencyDays = 0,
    this.primaryDeviation = '',
    this.indisciplineCost = 0,
  });

  final List<int> weeklyStability;
  final double ruleAdherence;
  final double avgTradesPerDay;
  final String behavioralTrend;
  final int consistencyDays;
  final String primaryDeviation;
  final double indisciplineCost;

  Map<String, dynamic> toJson() => {
        'weeklyStability': weeklyStability,
        'ruleAdherence': ruleAdherence,
        'avgTradesPerDay': avgTradesPerDay,
        'behavioralTrend': behavioralTrend,
        'consistencyDays': consistencyDays,
        'primaryDeviation': primaryDeviation,
        'indisciplineCost': indisciplineCost,
      };

  factory Analytics.fromJson(Map<String, dynamic> json) {
    return Analytics(
      weeklyStability: (json['weeklyStability'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList() ??
          const [72, 85, 68, 91, 88, 79, 85],
      ruleAdherence: (json['ruleAdherence'] as num?)?.toDouble() ?? 82,
      avgTradesPerDay: (json['avgTradesPerDay'] as num?)?.toDouble() ?? 2.3,
      behavioralTrend: json['behavioralTrend'] as String? ?? 'stabilizing',
      consistencyDays: json['consistencyDays'] as int? ?? 0,
      primaryDeviation: json['primaryDeviation'] as String? ?? '',
      indisciplineCost: (json['indisciplineCost'] as num?)?.toDouble() ?? 0,
    );
  }
}

List<String> _stringList(dynamic value) {
  if (value is! List) return [];
  return value.map((e) => e.toString()).toList();
}

/// AI psychology profile — mirrors [UserModel] in src/types/trading.ts.
class UserModel {
  const UserModel({
    this.primaryStyle = 'day_trading',
    this.primaryMarket = 'NIFTY_options',
    this.sessionPreference = 'morning',
    this.avgTradesPerDay = 3.2,
    this.typicalPositionSizePct = 1.8,
    this.dominantWeakness = 'moved_sl',
    this.tiltTrigger = 'consecutive_losses',
    this.tiltThreshold = 2,
    this.revengeTradePattern = true,
    this.fomoPattern = false,
    this.overconfidencePattern = true,
    this.bestTimeWindow = '09:30-10:15',
    this.worstTimeWindow = '14:00-15:00',
    this.bestDay = 'wednesday',
    this.worstDay = 'thursday',
    this.edgeSetup = 'breakout',
    this.losingSetup = 'reversal',
    this.newsSensitivity = 'high',
    this.respondsTo = 'data',
    this.insightEngagementRate = 0.84,
    this.preferredInput = 'voice',
    this.averageNoteLength = 'short',
    this.disciplineTrajectory = 'improving',
    this.streakSensitivity = 'high',
    this.goal = 'consistency',
    this.confidenceLevel = 3.2,
    this.modelUpdatedAt,
    this.modelConfidence = 0.82,
  });

  final String primaryStyle;
  final String primaryMarket;
  final String sessionPreference;
  final double avgTradesPerDay;
  final double typicalPositionSizePct;
  final String dominantWeakness;
  final String tiltTrigger;
  final int tiltThreshold;
  final bool revengeTradePattern;
  final bool fomoPattern;
  final bool overconfidencePattern;
  final String bestTimeWindow;
  final String worstTimeWindow;
  final String bestDay;
  final String worstDay;
  final String edgeSetup;
  final String losingSetup;
  final String newsSensitivity;
  final String respondsTo;
  final double insightEngagementRate;
  final String preferredInput;
  final String averageNoteLength;
  final String disciplineTrajectory;
  final String streakSensitivity;
  final String goal;
  final double confidenceLevel;
  final String? modelUpdatedAt;
  final double modelConfidence;

  Map<String, dynamic> toJson() => {
        'primary_style': primaryStyle,
        'primary_market': primaryMarket,
        'session_preference': sessionPreference,
        'avg_trades_per_day': avgTradesPerDay,
        'typical_position_size_pct': typicalPositionSizePct,
        'dominant_weakness': dominantWeakness,
        'tilt_trigger': tiltTrigger,
        'tilt_threshold': tiltThreshold,
        'revenge_trade_pattern': revengeTradePattern,
        'fomo_pattern': fomoPattern,
        'overconfidence_pattern': overconfidencePattern,
        'best_time_window': bestTimeWindow,
        'worst_time_window': worstTimeWindow,
        'best_day': bestDay,
        'worst_day': worstDay,
        'edge_setup': edgeSetup,
        'losing_setup': losingSetup,
        'news_sensitivity': newsSensitivity,
        'responds_to': respondsTo,
        'insight_engagement_rate': insightEngagementRate,
        'preferred_input': preferredInput,
        'average_note_length': averageNoteLength,
        'discipline_trajectory': disciplineTrajectory,
        'streak_sensitivity': streakSensitivity,
        'goal': goal,
        'confidence_level': confidenceLevel,
        if (modelUpdatedAt != null) 'model_updated_at': modelUpdatedAt,
        'model_confidence': modelConfidence,
      };

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      primaryStyle: json['primary_style'] as String? ?? 'day_trading',
      primaryMarket: json['primary_market'] as String? ?? 'NIFTY_options',
      sessionPreference: json['session_preference'] as String? ?? 'morning',
      avgTradesPerDay: (json['avg_trades_per_day'] as num?)?.toDouble() ?? 3.2,
      typicalPositionSizePct:
          (json['typical_position_size_pct'] as num?)?.toDouble() ?? 1.8,
      dominantWeakness: json['dominant_weakness'] as String? ?? 'moved_sl',
      tiltTrigger: json['tilt_trigger'] as String? ?? 'consecutive_losses',
      tiltThreshold: json['tilt_threshold'] as int? ?? 2,
      revengeTradePattern: json['revenge_trade_pattern'] as bool? ?? false,
      fomoPattern: json['fomo_pattern'] as bool? ?? false,
      overconfidencePattern: json['overconfidence_pattern'] as bool? ?? false,
      bestTimeWindow: json['best_time_window'] as String? ?? '',
      worstTimeWindow: json['worst_time_window'] as String? ?? '',
      bestDay: json['best_day'] as String? ?? '',
      worstDay: json['worst_day'] as String? ?? '',
      edgeSetup: json['edge_setup'] as String? ?? '',
      losingSetup: json['losing_setup'] as String? ?? '',
      newsSensitivity: json['news_sensitivity'] as String? ?? 'medium',
      respondsTo: json['responds_to'] as String? ?? 'data',
      insightEngagementRate:
          (json['insight_engagement_rate'] as num?)?.toDouble() ?? 0,
      preferredInput: json['preferred_input'] as String? ?? 'text',
      averageNoteLength: json['average_note_length'] as String? ?? 'short',
      disciplineTrajectory:
          json['discipline_trajectory'] as String? ?? 'stable',
      streakSensitivity: json['streak_sensitivity'] as String? ?? 'medium',
      goal: json['goal'] as String? ?? 'consistency',
      confidenceLevel: (json['confidence_level'] as num?)?.toDouble() ?? 3,
      modelUpdatedAt: json['model_updated_at'] as String?,
      modelConfidence: (json['model_confidence'] as num?)?.toDouble() ?? 0.5,
    );
  }
}

/// Top-level persistable state — keys match web `trader_snapshots.data`.
class TraderSnapshot {
  const TraderSnapshot({
    this.user,
    required this.session,
    this.rules = const [],
    this.trades = const [],
    this.dailyLogs = const [],
    this.analytics = const Analytics(),
    this.userModel = const UserModel(),
    this.version,
  });

  final TraderUser? user;
  final Session session;
  final List<Rule> rules;
  final List<Trade> trades;
  final List<DailyLog> dailyLogs;
  final Analytics analytics;
  final UserModel userModel;
  final String? version;

  TraderSnapshot copyWith({
    TraderUser? user,
    Session? session,
    List<Rule>? rules,
    List<Trade>? trades,
    List<DailyLog>? dailyLogs,
    Analytics? analytics,
    UserModel? userModel,
    String? version,
  }) {
    return TraderSnapshot(
      user: user ?? this.user,
      session: session ?? this.session,
      rules: rules ?? this.rules,
      trades: trades ?? this.trades,
      dailyLogs: dailyLogs ?? this.dailyLogs,
      analytics: analytics ?? this.analytics,
      userModel: userModel ?? this.userModel,
      version: version ?? this.version,
    );
  }

  static List<Rule> defaultRules() => const [
        Rule(
          id: '1',
          text: 'Never risk more than 2% per trade',
          emoji: '🛡️',
          category: 'Risk Rules',
          isActive: true,
        ),
        Rule(
          id: '2',
          text: 'Always use a stop loss',
          emoji: '🛑',
          category: 'Risk Rules',
          isActive: true,
        ),
        Rule(
          id: '3',
          text: 'Wait for confirmation candle',
          emoji: '🕯️',
          category: 'Entry/Exit Rules',
          isActive: true,
        ),
        Rule(
          id: '4',
          text: 'No revenge trading',
          emoji: '🧠',
          category: 'Mindset Rules',
          isActive: true,
        ),
        Rule(
          id: '5',
          text: 'Max 3 trades per session',
          emoji: '🔢',
          category: 'Pre-Session Rules',
          isActive: true,
        ),
      ];
}
