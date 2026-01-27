# Feature Rule: Room Management

## Overview
Manages physical locations/rooms where books are stored.

## Rules
- **Room Identification**: Each room must have a unique name or code.
- **Inventory Tracking**: 
  - Ensure book location updates are atomic.
  - Room capacity checks should be performed before moving books.
- **UI**: Display room status (Full, Available, Empty) clearly in the management dashboard.
