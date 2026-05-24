using System.ComponentModel.DataAnnotations;

namespace TicketManagement.API.DTOs
{
    public class TicketCreateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 5)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string Description { get; set; } = string.Empty;

        [Required]
        // Categories: SoftwareIssue, HardwareComplaint, NetworkIncident, AccessRequest, Other
        public string Category { get; set; } = string.Empty;

        [Required]
        // Priorities: Low, Medium, High, Critical
        public string Priority { get; set; } = string.Empty;
    }

    public class TicketStatusUpdateDto
    {
        [Required]
        // Statuses: Open, InProgress, Escalated, Resolved, Closed
        public string Status { get; set; } = string.Empty;

        [StringLength(500)]
        public string ResolutionComment { get; set; } = string.Empty;
    }

    public class CommentCreateDto
    {
        [Required]
        [StringLength(500, MinimumLength = 1)]
        public string CommentText { get; set; } = string.Empty;
    }
}