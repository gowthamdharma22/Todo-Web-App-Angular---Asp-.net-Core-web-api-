using Auth.api.Entities;

namespace Auth.api.Repository;

public interface ITodoRepository
{
    Task<List<Todos>> GetAllTodo(string id);
    Task<Todos?> GetTodoById(string id);
    Task AddTodo(Todos todo);
    Task UpdateTodo(Todos todo);
    Task DeleteTodo(string id);
}
