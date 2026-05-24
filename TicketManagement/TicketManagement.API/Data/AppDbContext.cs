using Microsoft.EntityFrameworkCore;
using TicketManagement.API.Models;
using BCrypt.Net;
using System;

namespace TicketManagement.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketComment> TicketComments { get; set; }
        public DbSet<TicketAssignment> TicketAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Maintain Email String Uniqueness Constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // 2. Configure Non-Clustered Indexes on Foreign Key Columns for High-Speed LINQ Query Performance
            modelBuilder.Entity<Ticket>().HasIndex(t => t.EmployeeId);
            modelBuilder.Entity<Ticket>().HasIndex(t => t.AssignedEngineerId);
            modelBuilder.Entity<Ticket>().HasIndex(t => t.Status);
            modelBuilder.Entity<TicketComment>().HasIndex(c => c.TicketId);
            modelBuilder.Entity<TicketAssignment>().HasIndex(a => a.TicketId);

            // 3. Prevent Cascade Deletion Loop Failures
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Employee)
                .WithMany()
                .HasForeignKey(t => t.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.AssignedEngineer)
                .WithMany()
                .HasForeignKey(t => t.AssignedEngineerId)
                .OnDelete(DeleteBehavior.Restrict);

            // FIX: Added to prevent multiple cascade paths on the TicketAssignments table
            modelBuilder.Entity<TicketAssignment>()
                .HasOne(a => a.Assignee)
                .WithMany()
                .HasForeignKey(a => a.AssigneeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TicketAssignment>()
                .HasOne(a => a.AssignedBy)
                .WithMany()
                .HasForeignKey(a => a.AssignedById)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Robust In-Line Production Seeding Data Routines
            string commonPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123");

            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "Sanjana Patil", Email = "sanjana@hcl.com", PasswordHash = commonPasswordHash, Role = "Employee" },
                new User { Id = 2, Username = "Vikram Rathore", Email = "vikram@hcl.com", PasswordHash = commonPasswordHash, Role = "SupportEngineer" },
                new User { Id = 3, Username = "Ananya Iyer", Email = "ananya@hcl.com", PasswordHash = commonPasswordHash, Role = "Manager" }
            );

            modelBuilder.Entity<Ticket>().HasData(
                new Ticket { Id = 1, Title = "VPN Disconnecting Constantly", Description = "The Cisco AnyConnect profile drops outbound sessions every 10 minutes.", Category = "Network Incident", Priority = "High", Status = "Open", EmployeeId = 1, CreatedAt = DateTime.UtcNow.AddHours(-12), SlaDueDate = DateTime.UtcNow.AddHours(12) },
                new Ticket { Id = 2, Title = "Visual Studio License Blocked", Description = "Enterprise subscription shows invalid credentials on application launch.", Category = "Software Issue", Priority = "Medium", Status = "In Progress", EmployeeId = 1, AssignedEngineerId = 2, AssignedAt = DateTime.UtcNow.AddHours(-4), CreatedAt = DateTime.UtcNow.AddHours(-6), SlaDueDate = DateTime.UtcNow.AddHours(42) },
                new Ticket { Id = 3, Title = "SLA Breach - Memory Upgrade", Description = "System memory replacement request outstanding for hardware workspace deployment.", Category = "Hardware Complaint", Priority = "Critical", Status = "Escalated", EmployeeId = 1, CreatedAt = DateTime.UtcNow.AddDays(-3), SlaDueDate = DateTime.UtcNow.AddDays(-1) },
                new Ticket { Id = 4, Title = "Production Database Read Access", Description = "Requesting temporary DB authorization profile for analytical summary tracking.", Category = "Access Request", Priority = "Low", Status = "Resolved", EmployeeId = 1, AssignedEngineerId = 2, AssignedAt = DateTime.UtcNow.AddHours(-2), ResolvedAt = DateTime.UtcNow.AddHours(-1), CreatedAt = DateTime.UtcNow.AddHours(-5), SlaDueDate = DateTime.UtcNow.AddHours(120) },
                new Ticket { Id = 5, Title = "MS Teams Audio Peripheral Failure", Description = "The external headset microphone interface fails to trigger during inbound calls.", Category = "Hardware Complaint", Priority = "Low", Status = "Closed", EmployeeId = 1, AssignedEngineerId = 2, AssignedAt = DateTime.UtcNow.AddDays(-5), ResolvedAt = DateTime.UtcNow.AddDays(-4), CreatedAt = DateTime.UtcNow.AddDays(-5), SlaDueDate = DateTime.UtcNow.AddDays(2) },
                new Ticket { Id = 6, Title = "Outlook Archive Mailbox Quota Full", Description = "User cannot archive local mailbox profiles due to severe server-side limit configurations.", Category = "Software Issue", Priority = "Medium", Status = "Open", EmployeeId = 1, CreatedAt = DateTime.UtcNow.AddHours(-2), SlaDueDate = DateTime.UtcNow.AddHours(46) },
                new Ticket { Id = 7, Title = "Docker Desktop Engine Network Fail", Description = "WSL2 container bridge engine refuses to communicate outward to dependencies.", Category = "Software Issue", Priority = "High", Status = "In Progress", EmployeeId = 1, AssignedEngineerId = 2, AssignedAt = DateTime.UtcNow.AddHours(-1), CreatedAt = DateTime.UtcNow.AddHours(-3), SlaDueDate = DateTime.UtcNow.AddHours(21) },
                new Ticket { Id = 8, Title = "SLA Breach - Wi-Fi Token Renewal", Description = "Wireless network profile credentials expired without generating automatic renewal hooks.", Category = "Network Incident", Priority = "Critical", Status = "Escalated", EmployeeId = 1, CreatedAt = DateTime.UtcNow.AddDays(-4), SlaDueDate = DateTime.UtcNow.AddDays(-2) }
            );
        }
    }
}