using System;

namespace Auth.api.Entities;

public class User
{

    public required string Id { get; set; }

    public required string UserName { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }

    public List<Todos>? Todos { get; set; }

}