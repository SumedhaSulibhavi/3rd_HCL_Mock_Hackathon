namespace TicketManagementWebAPI.Services
{
    public class TicketService
    {
        public string CalculateSLA(string priority)
        {
            return priority switch
            {
                "Critical" => "2 Hours",
                "High" => "8 Hours",
                "Medium" => "24 Hours",
                _ => "72 Hours"
            };
        }
    }
}