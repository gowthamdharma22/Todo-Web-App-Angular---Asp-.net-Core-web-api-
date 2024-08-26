using System;

namespace Auth.api.Dtos;


public record class LoginDto(string email, string password);
