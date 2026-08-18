import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text } from 'react-native';

import { getCareers, unwrapList } from '../api/endpoints';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors } from '../theme';

export function CareersScreen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['careers'], queryFn: getCareers });
  const careers = unwrapList(data);

  return (
    <Screen>
      <SectionHeader title="Careers" subtitle="Recommended paths from the backend career engine." />
      {isLoading ? <ActivityIndicator color={colors.primarySoft} /> : null}
      {error ? <Text style={{ color: colors.amber }}>{error.message}</Text> : null}
      {careers.map((career, index) => (
        <ListRow
          key={`${career.slug || career.career_id || career.id || index}`}
          meta={career.match_score ? `${Math.round(career.match_score)}%` : career.category}
          subtitle={career.description || career.category}
          title={career.title || career.name || 'Career path'}
        />
      ))}
    </Screen>
  );
}
