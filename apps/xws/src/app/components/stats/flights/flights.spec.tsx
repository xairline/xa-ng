import { render } from '@testing-library/react';

import Flights from './flights';

describe('Flights', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Flights />);
    expect(baseElement).toBeTruthy();
  });
});
