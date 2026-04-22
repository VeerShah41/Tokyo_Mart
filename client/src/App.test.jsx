import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from './App';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders the storefront catalog', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('/api/products/categories')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ categories: ['Footwear'] }),
          });
        }

        if (String(url).includes('/api/products')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                products: [
                  {
                    id: 1,
                    slug: 'test-shoe',
                    name: 'Test Shoe',
                    category: 'Footwear',
                    brand: 'Tokyo Mart',
                    price: 1999,
                    stock: 12,
                    imageUrl: 'https://example.com/shoe.png',
                    description: 'Sample product',
                    tags: ['shoe'],
                    colors: ['black'],
                    sizes: ['8'],
                    featured: true,
                  },
                ],
              }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /clean sports shopping, without the clutter/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Latest Arrivals/i)).toBeInTheDocument();
  });
});
