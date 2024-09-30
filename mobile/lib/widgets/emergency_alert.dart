import 'package:flutter/material.dart';

class EmergencyAlert extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      color: Theme.of(context).colorScheme.secondary,
      child: InkWell(
        onTap: () {
          // TODO: Implement emergency alert functionality
        },
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.warning, color: Colors.white),
              SizedBox(width: 8),
              Text(
                'Emergency Alert',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }
}