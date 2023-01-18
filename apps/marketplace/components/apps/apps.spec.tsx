import { render } from '@testing-library/react';

import Apps from './apps';

describe('Apps', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Apps />);
    expect(baseElement).toBeTruthy();
  });
});
