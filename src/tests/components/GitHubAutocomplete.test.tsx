import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import GitHubAutocomplete from '../../components/GitHubAutocomplete';

describe('GitHubAutocomplete', () => {

  it('renders the component with the search input', () => {
    render(<GitHubAutocomplete />);
    

    const inputElement = screen.getByRole('combobox');
    expect(inputElement).toBeInTheDocument();
  });


  it('has the correct accessibility attributes', () => {
    render(<GitHubAutocomplete />);
    

    const searchElement = screen.getByRole('search');
    expect(searchElement).toBeInTheDocument();
    

    const inputElement = screen.getByRole('combobox');
    expect(inputElement).toHaveAttribute('aria-autocomplete', 'list');
  });
});
