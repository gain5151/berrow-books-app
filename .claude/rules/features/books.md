# Feature Rule: Book Management

## Overview
Covers book registration, listing, and rental status.

## Rules
- **Data Model**: Follow the `Book` model in `schema.prisma`.
- **Validation**:
  - ISBN must be validated (10 or 13 digits).
  - Title and Author are mandatory.
- **Images**: Use placeholder images if a cover is not available.
- **Search**: Implement server-side filtering for large book sets.
