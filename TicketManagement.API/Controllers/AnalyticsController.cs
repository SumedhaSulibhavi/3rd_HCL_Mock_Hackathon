using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TicketManagement.API.Data;

namespace TicketManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> GetDashboard()
        {
            var totalTickets = await _context.Tickets.CountAsync();

            var openTickets = await _context.Tickets
                .CountAsync(t => t.Status.ToString() == "Open");

            var resolvedTickets = await _context.Tickets
                .CountAsync(t => t.Status.ToString() == "Resolved");

            var slaBreached = await _context.Tickets
                .CountAsync(t => t.IsSLABreached);

            var categoryStats = await _context.Tickets
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    Category = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                TotalTickets = totalTickets,
                OpenTickets = openTickets,
                ResolvedTickets = resolvedTickets,
                SLABreached = slaBreached,
                CategoryStats = categoryStats
            });
        }

        [HttpGet("my-stats")]
        public async Task<IActionResult> GetMyStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var myTickets = await _context.Tickets
                .Where(t => t.RaisedById.ToString() == userId)
                .CountAsync();

            return Ok(new
            {
                MyTickets = myTickets
            });
        }
    }
}