using Microsoft.EntityFrameworkCore;
using Auth.api.Data;
using Auth.api.Entities;
using Auth.api.Repository;
using MongoDB.Bson;

namespace Todo.api.Repository;

public class TodoRepository(DatabaseContext dbContext, IUserRepository userRepository) : ITodoRepository
{
    private readonly DatabaseContext dbContext = dbContext;
    private readonly IUserRepository userRepository = userRepository;
    public async Task AddTodo(Todos todoData)
    {
        dbContext.Todos.Add(todoData);
        await dbContext.SaveChangesAsync();
    }

    public async Task DeleteTodo(string id)
    {
        await dbContext.Todos
                        .Where(todo => todo.Id == id)
                        .ExecuteDeleteAsync();
    }

    public async Task<List<Todos>> GetAllTodo(string userId)
    {
        return await dbContext.Todos
                               .Where(t => t.UserId == userId)
                               .Include(t => t.User)
                               .AsNoTracking()
                               .ToListAsync();
    }

    public async Task<Todos?> GetTodoById(string id)
    {
        return await dbContext.Todos.FindAsync(id);
    }

    public async Task UpdateTodo(Todos todo)
    {
        dbContext.Todos.Update(todo);
        await dbContext.SaveChangesAsync();
    }
}
