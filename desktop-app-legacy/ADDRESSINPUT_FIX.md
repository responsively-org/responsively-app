# AddressInput Race Condition Fix

## Problem
The AddressInput component had a race condition that could cause React state sync issues and crashes when:
1. User navigates to a new address (e.g., by pressing Enter or clicking a suggestion)
2. The `props.onChange()` callback is triggered, which updates the parent component's state
3. The parent component re-renders with the new address as a prop
4. `getDerivedStateFromProps` updates the local state with the new address
5. If another navigation happens before step 4 completes, the state updates can conflict

This race condition was particularly problematic when:
- Users quickly typed and pressed Enter multiple times
- Clicking suggestions while another navigation was in progress
- The address bar state and browser state got out of sync

## Solution
Added navigation flags and debouncing to prevent duplicate address changes:

### 1. Navigation Flag (`isNavigating`)
- Added `isNavigating` boolean to component state
- Set to `true` when navigation is initiated (Enter key or suggestion click)
- Set back to `false` after 100ms to allow props update to complete
- Used in `getDerivedStateFromProps` to prevent updating address from props during navigation

### 2. Debouncing
- Added `_debouncedOnChange` as a debounced version of `_onChange` (300ms delay)
- This can be used instead of `_onChange` in places where rapid successive calls need to be prevented
- Proper cleanup added in `componentWillUnmount` to cancel pending debounced calls

### 3. Cleanup
- Added cleanup for debounced functions in `componentWillUnmount`
- Prevents memory leaks and ensures proper cleanup when component is unmounted

## Implementation Details

### State Changes
```javascript
this.state = {
  userTypedAddress: props.address,
  previousAddress: props.address,
  suggestionList: [],
  canShowSuggestions: false,
  cursor: null,
  isNavigating: false,  // NEW: tracks navigation state
};
```

### getDerivedStateFromProps Enhancement
```javascript
static getDerivedStateFromProps(props, state) {
  // Only update from props if not actively navigating
  if (props.address !== state.previousAddress && !state.isNavigating) {
    return {
      userTypedAddress: props.address,
      previousAddress: props.address,
    };
  }
  return null;
}
```

### Navigation Methods
Both `_onChange` and `_onSearchedUrlClick` now:
1. Set `isNavigating: true` before calling `props.onChange()`
2. Call the parent's onChange handler
3. Reset `isNavigating: false` after 100ms

This ensures that:
- The address bar doesn't get overwritten by props updates during navigation
- Multiple rapid navigations don't interfere with each other
- State updates are properly synchronized

## Testing
The test suite validates:
- Navigation flag is set correctly during navigation
- Props updates are blocked when `isNavigating` is true
- Props updates work normally when `isNavigating` is false
- Debounced functions are properly cleaned up on unmount

## Benefits
1. Eliminates race conditions between user input and props updates
2. Prevents duplicate address changes
3. Fixes React state sync issues
4. Reduces crashes related to address bar navigation
5. Improves overall stability of the address bar component
