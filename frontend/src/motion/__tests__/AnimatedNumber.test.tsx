import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedNumber } from '../AnimatedNumber';
import '@testing-library/jest-dom';
import React from 'react';

describe('AnimatedNumber', () => {
  it('renders initial value', () => {
    render(<AnimatedNumber value={100} />);
    // @ts-expect-error jest-dom types mismatch
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
