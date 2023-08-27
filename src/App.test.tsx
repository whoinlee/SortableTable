import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.useFakeTimers();
describe('main page', () => {
  it('renders page heading', async () => {
    render(<App />);
    const heading = await screen.findByRole('heading', { name: 'City List' });
    expect(heading).toBeInTheDocument();
  });

  it('does a search correctly', async () => {
    render(<App />);
    expect(await screen.findByText(/Tokyo/)).toBeInTheDocument();
    //-- aria-label added in the search text input field
    const textInput = screen.getByRole('textbox', { name: 'search' }); 
    const callBack = async() => {
      await userEvent.type(textInput, 'osaka');
      expect(screen.queryByText(/Tokyo/)).not.toBeInTheDocument();
    }
    setTimeout(callBack, 200);  //200: any number larger than 150ms search delay
  });
});
