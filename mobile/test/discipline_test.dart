import 'package:flutter_test/flutter_test.dart';
import 'package:perfect_trader_mobile/core/discipline.dart';

void main() {
  test('calculateRuleChecklistScore', () {
    expect(calculateRuleChecklistScore(5, 5), 100);
    expect(calculateRuleChecklistScore(4, 2), 50);
    expect(calculateRuleChecklistScore(0, 0), 0);
  });

  test('scoreToGrade', () {
    expect(scoreToGrade(95), 'A');
    expect(scoreToGrade(85), 'B');
    expect(scoreToGrade(75), 'C');
    expect(scoreToGrade(65), 'D');
    expect(scoreToGrade(50), 'F');
    expect(scoreToGrade(0), 'None');
  });

  test('calculateDailyComplianceScore', () {
    expect(
      calculateDailyComplianceScore(
        activeRuleCount: 4,
        rulesCheckedCount: 4,
        hasPrePlan: true,
        hasPostNote: true,
      ),
      100,
    );
  });
}
