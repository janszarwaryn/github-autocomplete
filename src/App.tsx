import GitHubAutocomplete from './components/GitHubAutocomplete'
import type { AutocompleteResultItem } from './components/GitHubAutocomplete/types'

function App() {
  const handleSelect = (item: AutocompleteResultItem) => {
    console.log('Selected item:', item);
  };

  return (
    <div className="w-full">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-github-text mb-4">GitHub Autocomplete Component</h1>
        <p className="text-base text-github-secondary max-w-xl mx-auto">
          Start typing (minimum 3 characters) to search for GitHub users and repositories.
          Use arrow keys to navigate and Enter to select.
        </p>
      </header>

      <main className="flex flex-col gap-12">
        <div className="w-full max-w-2xl mx-auto">
          <GitHubAutocomplete 
            placeholder="Search GitHub users and repositories..."
            debounceTime={300}
            onSelect={handleSelect}
          />
        </div>
        
        <div className="max-w-2xl mx-auto p-8 bg-github-hover rounded-lg">
          <h2 className="text-xl font-semibold text-github-text mb-6 text-center">Implemented Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-center gap-2 text-github-text py-2">✓ Search triggered with 3+ characters</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Combined and sorted results</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Loading/No results/Error states</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Keyboard navigation support</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Debounced input (300ms)</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Result caching</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Text highlighting</li>
            <li className="flex items-center gap-2 text-github-text py-2">✓ Accessible with ARIA attributes</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
