import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';
import { useQuery } from '@tanstack/react-query';
import { AppProviders } from '../AppProviders';

function Probe({ queryFn }: { queryFn: () => Promise<string> }) {
  const q = useQuery({ queryKey: ['probe'], queryFn });
  return <Text>{q.data ?? 'none'}</Text>;
}

describe('AppProviders waits for the persisted cache (T11.23)', () => {
  it('does not fetch before restore finishes, then reports restored', async () => {
    let finishRestore: (v: undefined) => void = () => {};
    const persister = {
      persistClient: jest.fn().mockResolvedValue(undefined),
      restoreClient: jest.fn(() => new Promise<undefined>((r) => (finishRestore = r))),
      removeClient: jest.fn().mockResolvedValue(undefined),
    };
    const queryFn = jest.fn().mockResolvedValue('fresh');
    const onRestored = jest.fn();

    await render(
      <AppProviders persister={persister} onRestored={onRestored}>
        <Probe queryFn={queryFn} />
      </AppProviders>,
    );

    expect(queryFn).not.toHaveBeenCalled();
    expect(onRestored).not.toHaveBeenCalled();

    await act(async () => finishRestore(undefined));

    await waitFor(() => expect(onRestored).toHaveBeenCalled());
    await waitFor(() => expect(queryFn).toHaveBeenCalled());
  });
});
