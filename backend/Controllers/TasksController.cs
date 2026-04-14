using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
public class TasksController(ITaskService service) : ControllerBase
{
    [HttpGet("api/projects/{projectId:int}/tasks")]
    public async Task<ActionResult<PagedResponse<TaskDto>>> GetByProject(int projectId, [FromQuery] TaskQueryParams query)
        => Ok(await service.GetByProjectAsync(projectId, query));

    [HttpPost("api/projects/{projectId:int}/tasks")]
    public async Task<ActionResult<TaskDto>> Create(int projectId, TaskCreateUpdateDto dto)
    {
        var result = await service.CreateAsync(projectId, dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("api/tasks/{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("api/tasks/{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, TaskCreateUpdateDto dto)
    {
        var result = await service.UpdateAsync(id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("api/tasks/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        return await service.DeleteAsync(id) ? NoContent() : NotFound();
    }
}
