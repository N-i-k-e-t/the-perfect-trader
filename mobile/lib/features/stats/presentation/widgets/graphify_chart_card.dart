import 'package:flutter/material.dart';
import 'package:graphify/graphify.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';

/// Wraps [GraphifyView] with consistent card chrome and height.
class GraphifyChartCard extends StatefulWidget {
  const GraphifyChartCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.options,
    this.height = 260,
  });

  final String title;
  final String subtitle;
  final Map<String, dynamic> options;
  final double height;

  @override
  State<GraphifyChartCard> createState() => _GraphifyChartCardState();
}

class _GraphifyChartCardState extends State<GraphifyChartCard> {
  late final GraphifyController _controller;

  @override
  void initState() {
    super.initState();
    _controller = GraphifyController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              widget.subtitle,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                height: widget.height,
                width: double.infinity,
                child: GraphifyView(
                  controller: _controller,
                  initialOptions: widget.options,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
