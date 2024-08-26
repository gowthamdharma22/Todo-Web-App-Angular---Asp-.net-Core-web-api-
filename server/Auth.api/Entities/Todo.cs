namespace Auth.api.Entities;

public class Todos
{
    public required string Id { get; set; }
    public required string Description { get; set; }
    public bool IsCompleted { get; set; }

    public required string UserId { get; set; }

    public required User User { get; set; }
}
