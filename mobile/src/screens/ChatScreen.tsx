import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { askCareerChat } from '../api/endpoints';
import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors, radii, spacing } from '../theme';

export function ChatScreen() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');

  const chatMutation = useMutation({
    mutationFn: () => askCareerChat(query),
    onSuccess: (payload) => {
      setAnswer(payload.answer || payload.response || 'No answer returned.');
      setQuery('');
    },
    onError: (error) => {
      Alert.alert('Chat unavailable', error instanceof Error ? error.message : 'Try again later.');
    },
  });

  return (
    <Screen>
      <SectionHeader title="AI Chat" subtitle="Ask the RAG assistant a career or skill question." />
      <TextInput
        multiline
        onChangeText={setQuery}
        placeholder="Ask about career paths, skills, resumes, or jobs"
        placeholderTextColor={colors.dim}
        style={styles.input}
        value={query}
      />
      <AppButton disabled={!query.trim() || chatMutation.isPending} onPress={() => chatMutation.mutate()}>
        {chatMutation.isPending ? 'Thinking...' : 'Ask CareerAI'}
      </AppButton>
      {answer ? (
        <View style={styles.answerBox}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 132,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  answerBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  answer: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});
