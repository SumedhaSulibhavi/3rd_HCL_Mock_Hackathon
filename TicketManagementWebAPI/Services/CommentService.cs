namespace TicketManagementWebAPI.Services
{
    public class CommentService
    {
        public bool ValidateComment(string message)
        {
            return !string.IsNullOrWhiteSpace(message);
        }
    }
}