import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { ROOMS } from '@/rooms';

afterEach(() => cleanup());

describe('App — integration', () => {
  it('selects a room, enters a valid time, and shows Available', async () => {
    const user = userEvent.setup();
    render(<App />);

    // B-204 has a single booking 720-780 (12:00-13:00); 11:00-11:30 is free.
    const roomB = ROOMS.find((r) => r.id === 'B-204')!;
    const roomLabel = await screen.findByText(roomB.name);
    await user.click(roomLabel);

    await user.type(screen.getByLabelText('Start time (HH:MM)'), '11:00');
    await user.type(screen.getByLabelText('End time (HH:MM)'), '11:30');
    await user.click(screen.getByRole('button', { name: 'Check availability' }));

    expect(await screen.findByText('Available')).toBeInTheDocument();
  });

  it('shows the empty state when attendees exceed every room capacity', async () => {
    const user = userEvent.setup();
    render(<App />);

    const maxCapacity = Math.max(...ROOMS.map((r) => r.capacity));
    await user.type(
      screen.getByLabelText('Number of attendees'),
      String(maxCapacity + 1),
    );

    expect(
      await screen.findByText(
        'No rooms match your requirements. Try fewer attendees or less equipment.',
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Check availability' }),
      ).not.toBeInTheDocument();
    });
  });
});
