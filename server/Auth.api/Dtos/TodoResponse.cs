namespace Auth.api.Dtos;

public record class TodoResponse(string id, string description, bool isCompleted, string userId);
