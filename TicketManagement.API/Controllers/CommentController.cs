using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TicketManagement.API.Data;
using TicketManagement.API.DTOs.Comments;
using TicketManagement.API.Models;

namespace TicketManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> AddComment(CreateCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var comment = new TicketComment
            {
                CommentId = Guid.NewGuid(),
                TicketId = dto.TicketId,
                AuthorId = Guid.Parse(userId!),
                Message = dto.Message,
                IsResolutionNote = dto.IsResolutionNote,
                CreatedAt = DateTime.UtcNow
            };

            _context.TicketComments.Add(comment);

            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        [HttpGet("ticket/{ticketId}")]
        public async Task<IActionResult> GetComments(Guid ticketId)
        {
            var comments = await _context.TicketComments
                .Where(c => c.TicketId == ticketId)
                .Include(c => c.Author)
                .AsNoTracking()
                .ToListAsync();

            return Ok(comments);
        }
    }
}