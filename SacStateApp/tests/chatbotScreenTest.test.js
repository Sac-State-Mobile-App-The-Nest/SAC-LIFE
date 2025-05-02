import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatbotScreen from '../src/screens/ChatbotScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('testuser')),
}));

jest.mock('@env', () => ({
  DEV_BACKEND_SERVER_IP: 'localhost',
}));

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockReset();
});
// test1 basic functionality 
test('renders ChatbotScreen and verifies HerkyBot response is shown', async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ std_id: 123 }),
    }) 
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [], 
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Some helpful info about Sac State!' }), 
    });

  const { getByPlaceholderText, getByTestId, findByText } = render(<ChatbotScreen />);

  const input = getByPlaceholderText('Ask me a question...');
  fireEvent.changeText(input, 'hi');

  const sendBtn = getByTestId('send-button');
  fireEvent.press(sendBtn);

  
  const herkyLabel = await findByText('HerkyBot');
  expect(herkyLabel).toBeTruthy();
  
});
// test2 chat history delete
test('clears chat history when delete button is pressed', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ std_id: 123 }), 
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { student_question: 'Hi?', bot_response: 'Hello from Sac State!' },
        ], // fetchChatHistory returns existing message
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Chat history cleared.' }), 
      });
  
    const { findByText, getByTestId, queryByText } = render(<ChatbotScreen />);
  
    const previousMsg = await findByText('Hello from Sac State!');
    expect(previousMsg).toBeTruthy();
  
    fireEvent.press(getByTestId('delete-button'));
  
    await waitFor(() => {
      expect(queryByText('Hello from Sac State!')).toBeNull();
    });
  });
  // test3 chat history display
  test('loads and displays chat history on mount', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ std_id: 123 }), 
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { student_question: 'Hi there!', bot_response: 'Welcome to Sac State!' },
          { student_question: 'What are today’s events?', bot_response: 'Here is the events calendar.' }
        ], 
      });
  
    const { findByText } = render(<ChatbotScreen />);
  
    // Check that both student and bot messages from history appear
    expect(await findByText('Hi there!')).toBeTruthy();
    expect(await findByText('Welcome to Sac State!')).toBeTruthy();
    expect(await findByText('What are today’s events?')).toBeTruthy();
    expect(await findByText('Here is the events calendar.')).toBeTruthy();
  });
  
  

