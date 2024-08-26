using System;

namespace Auth.api.Dtos;

public record class RegisterDto(string username, string email, string password);
