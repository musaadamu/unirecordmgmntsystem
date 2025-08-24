import React from 'react';
import { render, screen } from '@testing-library/react';
import AssignmentDetail from '../pages/AssignmentDetail';
import { BrowserRouter } from 'react-router-dom';

describe('AssignmentDetail', () => {
  it('renders loading state', () => {
    render(
      <BrowserRouter>
        <AssignmentDetail />
      </BrowserRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
