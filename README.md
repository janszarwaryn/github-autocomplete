# GitHub Autocomplete Component

![GitHub Autocomplete Component](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue) ![Tests](https://img.shields.io/badge/Tests-Vitest-green)

A reusable and self-contained GitHub search autocomplete component built with React and TypeScript. This component allows users to search for GitHub users and repositories with a clean, modern interface and robust functionality.

## Features

- **Live GitHub Search**: Search for users and repositories as you type (triggers with 3+ characters)
- **Combined Results**: Merges and alphabetically sorts users and repositories in a single dropdown
- **Keyboard Navigation**: Full keyboard support with arrow keys and Enter key selection
- **Responsive States**:
  - Loading indicator while fetching results
  - Clear error messages for API failures
  - "No results found" message when appropriate
- **Performance Optimized**:
  - Debounced input to prevent excessive API calls
  - Result caching to avoid redundant requests
- **Enhanced UX**:
  - Text highlighting for matched query terms
  - Visual feedback for different interaction states
- **Fully Accessible**: ARIA attributes and keyboard support for accessibility compliance

## Installation

```bash
npm install github-autocomplete
```

Or clone this repository:

```bash
git clone https://github.com/your-username/github-autocomplete.git
cd github-autocomplete
npm install
```

## Usage

```jsx
import { GitHubAutocomplete } from 'github-autocomplete';

function App() {
  const handleSelect = (item) => {
    console.log('Selected:', item);
    // Do something with the selected item
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub Search</h1>
      
      <GitHubAutocomplete 
        placeholder="Search GitHub users and repositories..." 
        debounceTime={300}
        onSelect={handleSelect}
      />
    </div>
  );
}
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Search GitHub..." | Placeholder text for the input field |
| `className` | string | "" | Additional CSS classes to apply to the container |
| `debounceTime` | number | 300 | Delay in milliseconds before triggering search |
| `onSelect` | function | undefined | Callback function when an item is selected |

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

The component includes comprehensive tests covering:

- Component rendering
- API trigger with 3+ characters
- State handling (loading, no results, errors)
- Keyboard navigation
- Result selection behavior

Run tests with:

```bash
npm test
```

Or watch mode:

```bash
npm run test:watch
```

## Implementation Details

This component leverages several modern React patterns:

- **Custom Hooks**: Separates search logic and keyboard navigation
- **Compound Components**: Modular design with separate input and results components
- **Render Props**: Flexible rendering of search results
- **TypeScript**: Full type safety throughout
- **Tailwind CSS**: Utility-first styling approach

## API Rate Limits

Be aware that GitHub's API has rate limits (typically 60 requests per hour for unauthenticated requests). The component includes debouncing and caching to optimize API usage.

## License

MIT
