namespace TicketManagement.API.Services
{
    public class CommentService
    {
        public bool IsValidComment(string message)
        {
            return !string.IsNullOrWhiteSpace(message);
        }

        public string FormatComment(string message)
        {
            return message.Trim();
        }

        public bool IsResolutionNoteAllowed(string role)
        {
            return role == "Manager" || role == "Engineer";
        }
    }
}