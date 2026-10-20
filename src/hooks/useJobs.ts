import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreateJobPayload, Job } from '../types/job';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.getJobs(),
    refetchInterval: (query) => {
      // If there are pending or running jobs, poll every 4 seconds
      const data = query.state.data;
      const hasActive = data?.some((j: Job) => j.status === 'pending' || j.status === 'running');
      return hasActive ? 4000 : 15000;
    },
  });
};

export const useJobDetail = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required');
      return api.getJobById(jobId);
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job && (job.status === 'pending' || job.status === 'running')) {
        return 3000; // Poll while processing
      }
      return false;
    },
  });
};

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPayload) => api.createJob(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.job_id] });
    },
  });
};
