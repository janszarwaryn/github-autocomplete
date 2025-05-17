import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import GitHubAutocomplete from '../../components/GitHubAutocomplete';

describe('GitHubAutocomplete', () => {
  // Test 1: Component rendering
  it('renders the component correctly', () => {
    render(<GitHubAutocomplete />);
    
    // Check if the input field is rendered
    const inputElement = screen.getByRole('combobox');
    expect(inputElement).toBeInTheDocument();
    
    // Dropdown should not be visible initially
    expect(screen.queryByTestId('dropdown-container')).not.toBeInTheDocument();
  });

  // Test 2: API trigger with 3+ characters
  it('triggers search when 3+ characters are entered', async () => {
    const user = userEvent.setup();
    render(<GitHubAutocomplete />);
    
    const inputElement = screen.getByRole('combobox');
    
    // Type less than 3 characters - should not trigger search
    await user.type(inputElement, 'te');
    expect(screen.queryByTestId('dropdown-container')).not.toBeInTheDocument();
    
    // Type 3 characters - should trigger search and show loading state
    await user.type(inputElement, 's');
    
    // Wait for the dropdown to appear
    await waitFor(() => {
      expect(screen.getByTestId('dropdown-container')).toBeInTheDocument();
    });
    
    // Wait for the results to load
    await waitFor(() => {
      expect(screen.getAllByTestId(/result-item/)).toHaveLength(4); // 2 users + 2 repos
    });
  });

  // Test 3: State handling - loading state
  it('shows loading state while fetching data', async () => {
    const user = userEvent.setup();
    render(<GitHubAutocomplete />);
    
    const inputElement = screen.getByRole('combobox');
    await user.clear(inputElement);
    
    // Type a search query that will trigger the API
    await user.type(inputElement, 'tes');
    
    // The loading state should be displayed initially
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
  });

  // Test 4: State handling - error state
  it('shows error message when API request fails', async () => {
    const user = userEvent.setup();
    render(<GitHubAutocomplete />);
    
    const inputElement = screen.getByRole('combobox');
    await user.clear(inputElement);
    
    // Type a search query that will cause an error
    await user.type(inputElement, 'error');
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(/API rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  // Test 5: State handling - no results state
  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup();
    render(<GitHubAutocomplete />);
    
    const inputElement = screen.getByRole('combobox');
    await user.clear(inputElement);
    
    // Type a search query that will return no results
    await user.type(inputElement, 'xyz');
    
    // Wait for the no results message to appear
    await waitFor(() => {
      expect(screen.getByTestId('no-results-state')).toBeInTheDocument();
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  // Test 6: Keyboard navigation
  it('supports keyboard navigation through results', async () => {
    const user = userEvent.setup();
    render(<GitHubAutocomplete />);
    
    const inputElement = screen.getByRole('combobox');
    await user.type(inputElement, 'test');
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.getAllByTestId(/result-item/)).toHaveLength(4);
    });
    
    // Press arrow down to select first item
    await user.keyboard('{ArrowDown}');
    
    // Check if first item is selected
    const items = screen.getAllByTestId(/result-item/);
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
    
    // Press arrow down again to select second item
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(items[1]).toHaveAttribute('aria-selected', 'true');
    });
    
    // Press arrow up to go back to first item
    await user.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  // Test 7: Result selection
  it('opens the selected item in a new tab when clicked or Enter pressed', async () => {
    // Mock window.open
    const windowOpenMock = vi.fn();
    window.open = windowOpenMock;
    
    const user = userEvent.setup();
    render(<GitHubAutocomplete />);
    
    const inputElement = screen.getByRole('combobox');
    await user.type(inputElement, 'test');
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.getAllByTestId(/result-item/)).toHaveLength(4);
    });
    
    // Click on the first result
    const items = screen.getAllByTestId(/result-item/);
    await user.click(items[0]);
    
    // Check if window.open was called with the correct URL
    expect(windowOpenMock).toHaveBeenCalledWith('https://github.com/testuser1', '_blank', expect.any(String));
    
    windowOpenMock.mockReset();
    
    // Test keyboard navigation and Enter key
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    // Check if window.open was called again
    expect(windowOpenMock).toHaveBeenCalled();
  });

  // Test 8: onSelect callback
  it('calls onSelect callback when item is selected', async () => {
    const onSelectMock = vi.fn();
    const user = userEvent.setup();
    
    render(<GitHubAutocomplete onSelect={onSelectMock} />);
    
    const inputElement = screen.getByRole('combobox');
    await user.type(inputElement, 'test');
    
    // Wait for results to load
    await waitFor(() => {
      expect(screen.getAllByTestId(/result-item/)).toHaveLength(4);
    });
    
    // Click on the first result
    const items = screen.getAllByTestId(/result-item/);
    await user.click(items[0]);
    
    // Check if onSelect was called with the correct data
    expect(onSelectMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'user-1',
      name: 'testuser1',
      type: 'user'
    }));
  });
});
