using System.ComponentModel.DataAnnotations;

namespace TicketManagement.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "Employee"; // Employee, SupportEngineer, Manager
    }
}
