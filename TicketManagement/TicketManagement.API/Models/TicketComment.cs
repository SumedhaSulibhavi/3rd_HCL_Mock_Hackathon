using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TicketManagement.API.Models
{
    public class TicketComment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TicketId { get; set; }

        [ForeignKey("TicketId")]
        public virtual Ticket? Ticket { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [Required]
        public string CommentText { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}