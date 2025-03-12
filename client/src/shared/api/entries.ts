import axios from 'axios';
import type { JournalEntry } from '@shared/types/schema';

const API_URL = '/api';

export interface EntryFormData {
  title: string;
  content: string;
  location?: string;
  media?: string[];
}

export async function createEntry(data: EntryFormData): Promise<JournalEntry> {
  const response = await axios.post(`${API_URL}/entries`, data);
  return response.data;
}

export async function updateEntry(id: string, data: EntryFormData): Promise<JournalEntry> {
  const response = await axios.put(`${API_URL}/entries/${id}`, data);
  return response.data;
}

export async function getAllEntries(): Promise<JournalEntry[]> {
  const response = await axios.get(`${API_URL}/entries`);
  return response.data;
}

export async function getEntry(id: string): Promise<JournalEntry> {
  const response = await axios.get(`${API_URL}/entries/${id}`);
  return response.data;
}