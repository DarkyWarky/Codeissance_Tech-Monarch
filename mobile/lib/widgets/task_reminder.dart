import 'package:flutter/material.dart';

class TaskReminder extends StatelessWidget {
  final List<Map<String, dynamic>> tasks;

  TaskReminder({required this.tasks});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Daily Tasks', style: Theme.of(context).textTheme.headlineLarge),
            SizedBox(height: 8),
            ListView.builder(
              shrinkWrap: true,
              itemCount: tasks.length,
              itemBuilder: (context, index) {
                return CheckboxListTile(
                  title: Text(tasks[index]['title']),
                  value: tasks[index]['completed'],
                  onChanged: (bool? value) {},
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}