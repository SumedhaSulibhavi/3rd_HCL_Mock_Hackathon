using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TicketManagement.API.Models;

namespace TicketManagement.API.Models
{
    public class Ticket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = "Other"; // Software Issue, Hardware Complaint, Network Incident, Access Request, Other

        [Required]
        [StringLength(50)]
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Open"; // Open, In Progress, Escalated, Resolved, Closed

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? AssignedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime SlaDueDate { get; set; }

        // Foreign Key mappings
        [Required]
        public int EmployeeId { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual User? Employee { get; set; }

        public int? AssignedEngineerId { get; set; }

        [ForeignKey("AssignedEngineerId")]
        public virtual User? AssignedEngineer { get; set; }

        // Navigation relationships
        public virtual ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
        public virtual ICollection<TicketAssignment> Assignments { get; set; } = new List<TicketAssignment>();
    }
}