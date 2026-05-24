using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Security.Claims;
using TicketManagement.API.Data;
using TicketManagement.API.DTOs.Tickets;
using TicketManagement.API.Models;

namespace TicketManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            IQueryable<Ticket> query = _context.Tickets
                .Include(t => t.RaisedBy)
                .Include(t => t.AssignedTo);

            if (role != "Manager")
            {
                query = query.Where(t => t.RaisedById.ToString() == userId);
            }

            var tickets = await query
                .AsNoTracking()
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTicket(Guid id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.TicketId == id);

            if (ticket == null)
                return NotFound();

            return Ok(ticket);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTicket(CreateTicketDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var slaHours = dto.Priority switch
            {
                Priority.Critical => 2,
                Priority.High => 8,
                Priority.Medium => 24,
                _ => 72
            };

            var ticket = new Ticket
            {
                TicketId = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Category = dto.Category,
                Priority = dto.Priority,
                Status = Status.Open,
                RaisedById = Guid.Parse(userId!),
                CreatedAt = DateTime.UtcNow,
                SLADeadline = DateTime.UtcNow.AddHours(slaHours),
                IsSLABreached = false
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(ticket);
        }

        [HttpPatch("{id}/assign")]
        [Authorize(Roles = "Manager,Engineer")]
        public async Task<IActionResult> AssignTicket(Guid id, UpdateTicketDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return NotFound();

            ticket.AssignedToId = dto.AssignedToId;
            ticket.AssignedAt = DateTime.UtcNow;
            ticket.Status = Status.InProgress;

            await _context.SaveChangesAsync();

            return Ok(ticket);
        }

        [HttpPatch("{id}/escalate")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> EscalateTicket(Guid id)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
                return NotFound();

            ticket.Status = Status.Escalated;

            await _context.SaveChangesAsync();

            return Ok(ticket);
        }
    }
}