using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TicketManagementWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        [HttpPost]
        public IActionResult AddComment()
        {
            return Ok("Add comment endpoint working");
        }

        [HttpGet("ticket/{ticketId}")]
        public IActionResult GetComments(Guid ticketId)
        {
            return Ok($"Get comments for ticket: {ticketId}");
        }
    }
}