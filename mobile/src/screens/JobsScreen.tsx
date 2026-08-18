import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text } from 'react-native';

import { getJobs, unwrapList } from '../api/endpoints';
import { ListRow } from '../components/ListRow';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { colors } from '../theme';

export function JobsScreen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['jobs'], queryFn: getJobs });
  const jobs = unwrapList(data);

  return (
    <Screen>
      <SectionHeader title="Jobs" subtitle="Matched roles and active opportunities." />
      {isLoading ? <ActivityIndicator color={colors.primarySoft} /> : null}
      {error ? <Text style={{ color: colors.amber }}>{error.message}</Text> : null}
      {jobs.map((job, index) => (
        <ListRow
          key={`${job.job_id || job.id || index}`}
          meta={job.match_score ? `${Math.round(job.match_score)}%` : job.work_mode}
          subtitle={[job.company, job.location || job.city].filter(Boolean).join(' / ')}
          title={job.title || 'Job role'}
        />
      ))}
    </Screen>
  );
}
