import { render } from '@testing-library/react';

import Live from './live';

describe('Live', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Live />);
    expect(baseElement).toBeTruthy();
  });
});
