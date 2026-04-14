using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
public class CommentsController(ICommentService service) : ControllerBase
{
    [HttpGet("api/tasks/{taskId:int}/comments")]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetByTask(int taskId)
        => Ok(await service.GetByTaskAsync(taskId));

    [HttpPost("api/tasks/{taskId:int}/comments")]
    public async Task<ActionResult<CommentDto>> Create(int taskId, CommentCreateDto dto)
    {
        var result = await service.CreateAsync(taskId, dto);
        return CreatedAtAction(nameof(GetByTask), new { taskId }, result);
    }

    [HttpDelete("api/comments/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        return await service.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
