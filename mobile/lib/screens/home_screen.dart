import 'package:flutter/material.dart';
import 'package:mobile/widgets/task_reminder.dart';
import 'package:mobile/widgets/health_tracker.dart';
import 'package:mobile/widgets/emergency_alert.dart';
import 'package:mobile/services/api_service.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _tasks = [];

  @override
  void initState() {
    super.initState();
    _fetchTasks();
  }

  Future<void> _fetchTasks() async {
    final tasks = await _apiService.fetchTasks();
    setState(() {
      _tasks = tasks;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CareMate'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            TaskReminder(tasks: _tasks),
            HealthTracker(),
            EmergencyAlert(),
          ],
        ),
      ),
    );
  }
}
