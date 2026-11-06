# Security Specification for ForeverUs Couple Spaces

## 1. Data Invariants
- A couple space document ID must be a valid alphanumeric string up to 64 characters (e.g. `LOVE-8822`).
- Sub-collections (`messages`, `memories`, `date_places`, `schedules`) must belong to an existing couple space.
- Timestamps such as `createdAt` must be server timestamps on creation and immutable on updates.
- All string inputs (names, messages, notes, titles) have strict upper-bound size checks to prevent Denial-of-Wallet / resource abuse.
- Anonymous and secret whisper messages are capped at 2,000 characters and require sender and content.
- Photos and memories cannot exceed maximum character lengths and must include title and date.
- Coordinates for date places must be valid numeric floating point coordinates.

## 2. The Dirty Dozen Payloads
1. **Oversized Space ID**: ID with 200 characters -> `PERMISSION_DENIED`
2. **Missing required space fields**: Space document without `partner1Name` -> `PERMISSION_DENIED`
3. **Massive string injection**: Space title with 5,000 characters -> `PERMISSION_DENIED`
4. **Invalid space passcode modification**: Sub-collection update attempt to forge arbitrary parent fields -> `PERMISSION_DENIED`
5. **Orphan message write**: Writing a message to a non-existent couple space -> `PERMISSION_DENIED`
6. **Oversized message content**: Anonymous message with 50,000 characters payload -> `PERMISSION_DENIED`
7. **Tampered createdAt timestamp**: Creating a memory with a forged client timestamp rather than request.time -> `PERMISSION_DENIED`
8. **Invalid memory latitude/longitude type**: Sending a string for latitude -> `PERMISSION_DENIED`
9. **Unbounded reactions array**: Array with 500 items -> `PERMISSION_DENIED`
10. **Malicious script tag in category**: Path traversal or invalid characters -> `PERMISSION_DENIED`
11. **Negative or out-of-range day of week**: Schedule with `dayOfWeek: 99` -> `PERMISSION_DENIED`
12. **Catch-all unauthorized probe**: Read or write to arbitrary `/_system_metadata` -> `PERMISSION_DENIED`

## 3. Test Runner
Verified against Firestore Security Rules compiler with strict typed assertions and default deny.
