using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TicketManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAllTickets()
        {
            return Ok("Get all tickets working");
        }

        [HttpGet("{id}")]
        public IActionResult GetTicketById(Guid id)
        {
            return Ok($"Get ticket by id: {id}");
        }

        [HttpPost]
        public IActionResult CreateTicket()
        {
            return Ok("Create ticket endpoint working");
        }

        [HttpPatch("{id}/assign")]
        [Authorize(Roles = "Manager,Engineer")]
        public IActionResult AssignTicket(Guid id)
        {
            return Ok($"Assign ticket: {id}");
        }

        [HttpPatch("{id}/escalate")]
        [Authorize(Roles = "Manager")]
        public IActionResult EscalateTicket(Guid id)
        {
            return Ok($"Escalate ticket: {id}");
        }
    }
}