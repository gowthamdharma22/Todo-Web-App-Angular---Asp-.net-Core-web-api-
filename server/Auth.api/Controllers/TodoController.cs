using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Auth.api.Entities;
using Auth.api.Mapping;
using Auth.api.Repository;
using Auth.api.Dtos;
using MongoDB.Bson;

namespace Auth.Api.Controllers;

[Route("api/todo")]
[ApiController]
[Authorize]
public class TodoController(ITodoRepository todoRepository, IUserRepository userRepository) : ControllerBase
{
    private readonly ITodoRepository _todoRepository = todoRepository;

    [HttpGet]
    public async Task<IActionResult> GetAllTodo()
    {
        var userId = User.FindFirst("UserId")?.Value;
        Console.Write("Hello" + " " + userId);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        var todos = await _todoRepository.GetAllTodo(userId);
        return Ok(todos.Select(todo => todo.ToDto()).ToList());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTodoById([FromRoute] string id)
    {
        var todo = await _todoRepository.GetTodoById(id);
        if (todo == null)
        {
            return NotFound("Todo not found");
        }
        return Ok(todo.ToDto());
    }

    [HttpPost]
    public async Task<IActionResult> AddTodo([FromBody] TodoRequest todoRequest)
    {
        var userId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        var user = await userRepository.GetUserById(userId)!;
        if (user != null)
        {
            var todo = new Todos
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Description = todoRequest.description!,
                IsCompleted = (bool)todoRequest.isCompleted!,
                UserId = userId,
                User = user,
            };
            await _todoRepository.AddTodo(todo);
            return Ok(new { data = todo.ToDto(), message = "Successfully Created" });
        }
        return Unauthorized(new { error = "User not Authorized" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTodo([FromRoute] string id, [FromBody] TodoRequest todoRequest)
    {
        var existingTodo = await _todoRepository.GetTodoById(id);
        if (existingTodo == null)
        {
            return NotFound("Todo not found");
        }
        if (!string.IsNullOrEmpty(todoRequest.description))
        {
            existingTodo.Description = todoRequest.description;
        }
        if (todoRequest.isCompleted.HasValue)
        {
            existingTodo.IsCompleted = !existingTodo.IsCompleted;
        }

        await _todoRepository.UpdateTodo(existingTodo);
        return Ok(new { data = existingTodo, message = "Successfully Updated" });
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTodo([FromRoute] string id)
    {
        var existingTodo = await _todoRepository.GetTodoById(id);
        if (existingTodo == null)
        {
            return NotFound("Todo not found");
        }
        await _todoRepository.DeleteTodo(id);
        return Ok(new { message = "Successfully Deleted" });
    }
}
