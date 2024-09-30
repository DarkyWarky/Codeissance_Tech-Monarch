import 'package:flutter/material.dart';

class HealthTracker extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Health Tracker', style: Theme.of(context).textTheme.headlineLarge),
            SizedBox(height: 8),
            ListTile(
              leading: Icon(Icons.favorite),
              title: Text('Heart Rate'),
              trailing: Text('72 bpm'),
            ),
            ListTile(
              leading: Icon(Icons.directions_walk),
              title: Text('Steps'),
              trailing: Text('3,500'),
            ),
          ],
        ),
      ),
    );
  }
}
