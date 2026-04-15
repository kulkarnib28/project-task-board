using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AppException(string message, int statusCode = 400) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllAsync();
    Task<ProjectDto?> GetByIdAsync(int id);
    Task<ProjectDto> CreateAsync(ProjectCreateUpdateDto dto);
    Task<ProjectDto?> UpdateAsync(int id, ProjectCreateUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ITaskService
{
    Task<PagedResponse<TaskDto>> GetByProjectAsync(int projectId, TaskQueryParams query);
    Task<TaskDto?> GetByIdAsync(int id);
    Task<TaskDto> CreateAsync(int projectId, TaskCreateUpdateDto dto);
    Task<TaskDto?> UpdateAsync(int id, TaskCreateUpdateDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ICommentService
{
    Task<IEnumerable<CommentDto>> GetByTaskAsync(int taskId);
    Task<CommentDto> CreateAsync(int taskId, CommentCreateDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IDashboardService
{
    Task<DashboardDto> GetAsync();
}

public class ProjectService(AppDbContext db) : IProjectService
{
    public async Task<IEnumerable<ProjectDto>> GetAllAsync()
    {
        var projects = await db.Projects
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            }).ToListAsync();

        var projectIds = projects.Select(p => p.Id).ToList();
        var summaryRows = await db.Tasks
            .Where(t => projectIds.Contains(t.ProjectId))
            .GroupBy(t => new { t.ProjectId, t.Status })
            .Select(g => new { g.Key.ProjectId, g.Key.Status, Count = g.Count() })
            .ToListAsync();

        foreach (var project in projects)
        {
            project.TaskCount = summaryRows
                .Where(x => x.ProjectId == project.Id)
                .Sum(x => x.Count);

            project.TaskStatusSummary = summaryRows
                .Where(x => x.ProjectId == project.Id)
                .ToDictionary(x => x.Status, x => x.Count);
        }

        return projects;
    }

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        var project = await db.Projects.Where(p => p.Id == id).Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            CreatedAt = p.CreatedAt
        }).FirstOrDefaultAsync();

        if (project is null)
        {
            return null;
        }

        project.TaskStatusSummary = await db.Tasks
            .Where(t => t.ProjectId == id)
            .GroupBy(t => t.Status)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        project.TaskCount = project.TaskStatusSummary.Values.Sum();

        project.Tasks = await db.Tasks
            .Where(t => t.ProjectId == id)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Status = t.Status,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();

        return project;
    }

    public async Task<ProjectDto> CreateAsync(ProjectCreateUpdateDto dto)
    {
        if (await db.Projects.AnyAsync(p => p.Name == dto.Name))
            throw new AppException("Project name already exists.", 409);

        var project = new Project { Name = dto.Name, Description = dto.Description };
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return (await GetByIdAsync(project.Id))!;
    }

    public async Task<ProjectDto?> UpdateAsync(int id, ProjectCreateUpdateDto dto)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return null;

        if (await db.Projects.AnyAsync(p => p.Id != id && p.Name == dto.Name))
            throw new AppException("Project name already exists.", 409);

        project.Name = dto.Name;
        project.Description = dto.Description;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return false;
        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return true;
    }
}

public class TaskService(AppDbContext db) : ITaskService
{
    public async Task<PagedResponse<TaskDto>> GetByProjectAsync(int projectId, TaskQueryParams query)
    {
        if (!await db.Projects.AnyAsync(x => x.Id == projectId))
            throw new AppException("Project not found.", 404);

        var isDesc = !string.Equals(query.SortDir, "asc", StringComparison.OrdinalIgnoreCase);
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : Math.Min(query.PageSize, 50);

        var q = db.Tasks.Where(t => t.ProjectId == projectId).AsQueryable();
        if (query.Status.HasValue) q = q.Where(t => t.Status == query.Status.Value);
        if (query.Priority.HasValue) q = q.Where(t => t.Priority == query.Priority.Value);

        q = (query.SortBy?.ToLower()) switch
        {
            "duedate" => isDesc ? q.OrderByDescending(x => x.DueDate) : q.OrderBy(x => x.DueDate),
            "priority" => isDesc ? q.OrderByDescending(x => x.Priority) : q.OrderBy(x => x.Priority),
            _ => isDesc ? q.OrderByDescending(x => x.CreatedAt) : q.OrderBy(x => x.CreatedAt)
        };

        var totalCount = await q.CountAsync();
        var data = await q.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                Status = t.Status,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToListAsync();

        return new PagedResponse<TaskDto>
        {
            Data = data,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<TaskDto?> GetByIdAsync(int id)
    {
        var task = await db.Tasks.Where(t => t.Id == id).Select(t => new TaskDto
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            Title = t.Title,
            Description = t.Description,
            Priority = t.Priority,
            Status = t.Status,
            DueDate = t.DueDate,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).FirstOrDefaultAsync();

        if (task is null)
        {
            return null;
        }

        task.Comments = await db.Comments
            .Where(c => c.TaskId == id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                TaskId = c.TaskId,
                Author = c.Author,
                Body = c.Body,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return task;
    }

    public async Task<TaskDto> CreateAsync(int projectId, TaskCreateUpdateDto dto)
    {
        if (!await db.Projects.AnyAsync(x => x.Id == projectId))
            throw new AppException("Project not found.", 404);
        ValidateDueDate(dto.DueDate);

        var task = new ProjectTask
        {
            ProjectId = projectId,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = dto.Status,
            DueDate = dto.DueDate?.Date
        };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return (await GetByIdAsync(task.Id))!;
    }

    public async Task<TaskDto?> UpdateAsync(int id, TaskCreateUpdateDto dto)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return null;
        ValidateDueDate(dto.DueDate);

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.DueDate = dto.DueDate?.Date;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return false;
        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return true;
    }

    private static void ValidateDueDate(DateTime? dueDate)
    {
        if (dueDate.HasValue && dueDate.Value.Date < DateTime.UtcNow.Date)
            throw new AppException("DueDate must be today or a future date.", 400);
    }
}

public class CommentService(AppDbContext db) : ICommentService
{
    public async Task<IEnumerable<CommentDto>> GetByTaskAsync(int taskId)
    {
        if (!await db.Tasks.AnyAsync(x => x.Id == taskId))
            throw new AppException("Task not found.", 404);

        return await db.Comments.Where(c => c.TaskId == taskId).OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                TaskId = c.TaskId,
                Author = c.Author,
                Body = c.Body,
                CreatedAt = c.CreatedAt
            }).ToListAsync();
    }

    public async Task<CommentDto> CreateAsync(int taskId, CommentCreateDto dto)
    {
        if (!await db.Tasks.AnyAsync(x => x.Id == taskId))
            throw new AppException("Task not found.", 404);
        var comment = new Comment { TaskId = taskId, Author = dto.Author, Body = dto.Body };
        db.Comments.Add(comment);
        await db.SaveChangesAsync();
        return new CommentDto
        {
            Id = comment.Id, TaskId = comment.TaskId, Author = comment.Author, Body = comment.Body, CreatedAt = comment.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var comment = await db.Comments.FindAsync(id);
        if (comment is null) return false;
        db.Comments.Remove(comment);
        await db.SaveChangesAsync();
        return true;
    }
}

public class DashboardService(AppDbContext db) : IDashboardService
{
    public async Task<DashboardDto> GetAsync()
    {
        var today = DateTime.UtcNow.Date;
        var nextWeek = today.AddDays(7);
        var grouped = await db.Tasks.GroupBy(t => t.Status).Select(g => new { g.Key, Count = g.Count() }).ToListAsync();

        return new DashboardDto
        {
            TotalProjects = await db.Projects.CountAsync(),
            TotalTasks = await db.Tasks.CountAsync(),
            TasksByStatus = grouped.ToDictionary(x => x.Key, x => x.Count),
            OverdueTasks = await db.Tasks.CountAsync(t => t.DueDate.HasValue && t.DueDate.Value.Date < today && t.Status != Models.TaskStatus.Done),
            TasksDueNext7Days = await db.Tasks.CountAsync(t => t.DueDate.HasValue && t.DueDate.Value.Date >= today && t.DueDate.Value.Date <= nextWeek)
        };
    }
}
