import React from 'react';
import { render, screen } from '@testing-library/react';
import InstructorAssignmentsGrid from '../pages/InstructorAssignmentsGrid';

describe('InstructorAssignmentsGrid', () => {
  it('renders analytics summary', () => {
    render(<InstructorAssignmentsGrid />);
    expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
  });
});
