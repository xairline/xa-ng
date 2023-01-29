import { render } from '@testing-library/react';

import Headquarter from './headquarter';

describe('Headquarter', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Headquarter />);
    expect(baseElement).toBeTruthy();
  });
});
