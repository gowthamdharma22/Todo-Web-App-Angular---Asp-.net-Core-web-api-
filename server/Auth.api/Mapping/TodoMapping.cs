using Auth.api.Dtos;
using Auth.api.Entities;

namespace Auth.api.Mapping;

public static class TodoMapping
{
    public static TodoResponse ToDto(this Todos todo)
    {
        return new TodoResponse(id: todo.Id,
               userId: todo.UserId!,
               description: todo.Description,
               isCompleted: todo.IsCompleted);
    }


}
