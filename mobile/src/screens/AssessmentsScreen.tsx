import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text } from 'react-native';

import { getAssessments, unwrapList } from '../api/endpoints';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors } from '../theme';

export function AssessmentsScreen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['assessments'], queryFn: getAssessments });
  const assessments = unwrapList(data);

  return (
    <Screen>
      <SectionHeader title="Assessments" subtitle="Mobile entry point for quizzes and skill-gap checks." />
      {isLoading ? <ActivityIndicator color={colors.primarySoft} /> : null}
      {error ? <Text style={{ color: colors.amber }}>{error.message}</Text> : null}
      {assessments.map((assessment, index) => (
        <ListRow
          key={`${assessment.assessment_id || assessment.id || index}`}
          meta={assessment.difficulty}
          subtitle={assessment.skill_name || `${assessment.question_count || 0} questions`}
          title={assessment.title || assessment.name || 'Assessment'}
        />
      ))}
    </Screen>
  );
}
