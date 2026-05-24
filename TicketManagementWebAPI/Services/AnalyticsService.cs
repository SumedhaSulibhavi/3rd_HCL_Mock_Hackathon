namespace TicketManagementWebAPI.Services
{
    public class AnalyticsService
    {
        public int CalculateResolvedPercentage(int total, int resolved)
        {
            if (total == 0)
                return 0;

            return (resolved * 100) / total;
        }
    }
}