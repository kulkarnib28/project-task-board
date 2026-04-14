using System.ComponentModel.DataAnnotations;
using backend.Models;
using TaskStatusEnum = backend.Models.TaskStatus;

namespace backend.DTOs;

public class PagedResponse<T>
{
    public required IEnumerable<T> Data { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

public class ProjectCreateUpdateDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(300)]
    public string? Description { get; set; }
}

public class ProjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public Dictionary<TaskStatusEnum, int> TaskStatusSummary { get; set; } = new();
    public List<TaskDto> Tasks { get; set; } = new();
}

public class TaskCreateUpdateDto
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(1000)]
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; }
    public TaskStatusEnum Status { get; set; }
    public DateTime? DueDate { get; set; }
}

public class TaskDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; }
    public TaskStatusEnum Status { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<CommentDto> Comments { get; set; } = new();
}

public class TaskQueryParams
{
    public TaskStatusEnum? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public string? SortBy { get; set; }
    public string SortDir { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class CommentCreateDto
{
    [Required, MaxLength(50)]
    public string Author { get; set; } = string.Empty;
    [Required, MaxLength(500)]
    public string Body { get; set; } = string.Empty;
}

public class CommentDto
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public string Author { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class DashboardDto
{
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public Dictionary<TaskStatusEnum, int> TasksByStatus { get; set; } = new();
    public int OverdueTasks { get; set; }
    public int TasksDueNext7Days { get; set; }
}
