import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';
import 'package:uuid/uuid.dart';

class AddTradeScreen extends ConsumerStatefulWidget {
  const AddTradeScreen({super.key});

  @override
  ConsumerState<AddTradeScreen> createState() => _AddTradeScreenState();
}

class _AddTradeScreenState extends ConsumerState<AddTradeScreen> {
  final _pair = TextEditingController();
  final _entry = TextEditingController();
  final _exit = TextEditingController();
  final _pnl = TextEditingController();
  final _notes = TextEditingController();
  String _type = 'Long';

  @override
  void dispose() {
    _pair.dispose();
    _entry.dispose();
    _exit.dispose();
    _pnl.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_pair.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pair / symbol is required')),
      );
      return;
    }

    final today = DateTime.now().toIso8601String();
    final trade = Trade(
      id: const Uuid().v4(),
      date: today,
      pair: _pair.text.trim(),
      type: _type,
      entry: _entry.text.trim(),
      exit: _exit.text.trim(),
      pnl: double.tryParse(_pnl.text.trim()),
      notes: _notes.text.trim(),
      emotion: BaselineState.neutral,
    );

    await ref.read(traderSnapshotProvider.notifier).update((s) {
      return s.copyWith(
        trades: [trade, ...s.trades],
        session: s.session.copyWith(tradesTaken: s.session.tradesTaken + 1),
      );
    });

    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Log trade')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _pair,
            decoration: const InputDecoration(labelText: 'Pair / symbol'),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _type,
            decoration: const InputDecoration(labelText: 'Direction'),
            items: const [
              DropdownMenuItem(value: 'Long', child: Text('Long')),
              DropdownMenuItem(value: 'Short', child: Text('Short')),
            ],
            onChanged: (v) => setState(() => _type = v ?? 'Long'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _entry,
            decoration: const InputDecoration(labelText: 'Entry'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _exit,
            decoration: const InputDecoration(labelText: 'Exit'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _pnl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'PnL (optional)'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notes,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Notes'),
          ),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: _save, child: const Text('Save trade')),
        ],
      ),
    );
  }
}
