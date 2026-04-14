using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Comment
{
    public int Id { get; set; }
    public int TaskId { get; set; }

    [Required, MaxLength(50)]
    public string Author { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(TaskId))]
    public ProjectTask? Task { get; set; }
}
