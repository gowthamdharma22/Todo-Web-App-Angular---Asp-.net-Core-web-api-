namespace Auth.api.Dtos;

public record class TodoRequest(string? description, bool? isCompleted)
{
}
