namespace TicketManagement.API.Services
{
    public class TicketService
    {
        public string GetSLATime(string priority)
        {
            return priority switch
            {
                "Critical" => "2 Hours",
                "High" => "8 Hours",
                "Medium" => "24 Hours",
                _ => "72 Hours"
            };
        }

        public bool IsEscalationRequired(bool slaBreached)
        {
            return slaBreached;
        }

        public string GetDefaultStatus()
        {
            return "Open";
        }
    }
}