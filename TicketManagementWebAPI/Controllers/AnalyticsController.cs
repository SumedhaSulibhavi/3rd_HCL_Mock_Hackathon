using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TicketManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        [HttpGet("dashboard")]
        [Authorize(Roles = "Manager")]
        public IActionResult GetDashboardAnalytics()
        {
            var data = new
            {
                TotalTickets = 25,
                OpenTickets = 10,
                ResolvedTickets = 12,
                EscalatedTickets = 3
            };

            return Ok(data);
        }

        [HttpGet("trends")]
        [Authorize(Roles = "Manager")]
        public IActionResult GetTicketTrends()
        {
            return Ok("Ticket trends analytics working");
        }

        [HttpGet("engineer-performance")]
        [Authorize(Roles = "Manager")]
        public IActionResult GetEngineerPerformance()
        {
            return Ok("Engineer performance analytics working");
        }
    }
}