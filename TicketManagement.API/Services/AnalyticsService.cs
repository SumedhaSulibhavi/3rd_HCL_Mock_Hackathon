namespace TicketManagement.API.Services
{
    public class AnalyticsService
    {
        public int CalculateResolvedPercentage(int totalTickets, int resolvedTickets)
        {
            if (totalTickets == 0)
            {
                return 0;
            }

            return (resolvedTickets * 100) / totalTickets;
        }

        public int CalculateOpenTickets(int totalTickets, int resolvedTickets)
        {
            return totalTickets - resolvedTickets;
        }

        public double CalculateAverageResolutionHours(double totalHours, int resolvedCount)
        {
            if (resolvedCount == 0)
            {
                return 0;
            }

            return totalHours / resolvedCount;
        }
    }
}