import { useQuery } from '@tanstack/react-query';
import { fetchScheduleByDate } from '@/api';
import { todayVN, weekdayVN, addDays, WEEKLY_SCHEDULE, type DaySchedule } from '@/lib';

export const WEEKLY_SCHEDULE_QUERY_KEY = 'weekly-schedule' as const;

export function useWeeklySchedule(fallbackSchedule: DaySchedule[] = WEEKLY_SCHEDULE) {
  const today = todayVN();
  const currentWeekday = weekdayVN(today);
  const mondayDate = addDays(today, -(currentWeekday - 1));

  const query = useQuery<DaySchedule[], Error>({
    queryKey: [WEEKLY_SCHEDULE_QUERY_KEY, mondayDate],
    queryFn: async () => {
      const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mondayDate, i));
      const dailyResults = await Promise.all(
        dates.map(async (dateStr, index) => {
          try {
            const stations = await fetchScheduleByDate(dateStr);
            if (!stations || !Array.isArray(stations) || stations.length === 0) {
              return null;
            }
            return {
              dayOfWeek: index + 1,
              stations: stations
                .filter((s) => Boolean(s.code && s.name))
                .map((s) => ({
                  code: s.code!,
                  name: s.name!,
                })),
            };
          } catch {
            return null;
          }
        }),
      );

      return fallbackSchedule.map((day) => {
        const apiDay = dailyResults.find((r) => r?.dayOfWeek === day.dayOfWeek);
        if (apiDay && apiDay.stations.length > 0) {
          return {
            ...day,
            stations: apiDay.stations,
          };
        }
        return day;
      });
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    schedule: query.data ?? fallbackSchedule,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
}

