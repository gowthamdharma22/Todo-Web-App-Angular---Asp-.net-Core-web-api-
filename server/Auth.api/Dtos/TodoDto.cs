namespace Auth.api.Dtos;

public record class TodoDto(string id, string description, bool isCompleted = false);
