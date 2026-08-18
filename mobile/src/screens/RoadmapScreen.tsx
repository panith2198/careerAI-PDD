import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text } from 'react-native';

import { getRoadmaps, unwrapList } from '../api/endpoints';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors } from '../theme';

export function RoadmapScreen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['roadmaps'], queryFn: getRoadmaps });
  const roadmaps = unwrapList(data);

  return (
    <Screen>
      <SectionHeader title="Roadmap" subtitle="Active learning plans generated for your career target." />
      {isLoading ? <ActivityIndicator color={colors.primarySoft} /> : null}
      {error ? <Text style={{ color: colors.amber }}>{error.message}</Text> : null}
      {roadmaps.map((roadmap, index) => (
        <ListRow
          key={`${roadmap.roadmap_id || roadmap.id || index}`}
          meta={roadmap.progress ? `${Math.round(roadmap.progress)}%` : roadmap.status}
          subtitle={roadmap.career_title}
          title={roadmap.title || 'Learning roadmap'}
        />
      ))}
    </Screen>
  );
}
