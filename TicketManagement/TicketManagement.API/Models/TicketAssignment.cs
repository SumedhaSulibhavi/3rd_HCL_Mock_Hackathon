using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TicketManagement.API.Models
{
    public class TicketAssignment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TicketId { get; set; }

        [ForeignKey("TicketId")]
        public virtual Ticket? Ticket { get; set; }

        [Required]
        public int AssigneeId { get; set; }

        [ForeignKey("AssigneeId")]
        public virtual User? Assignee { get; set; }

        [Required]
        public int AssignedById { get; set; }

        [ForeignKey("AssignedById")]
        public virtual User? AssignedBy { get; set; }

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}