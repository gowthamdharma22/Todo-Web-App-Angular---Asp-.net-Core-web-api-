using Auth.api.Dtos;
using Auth.api.Entities;

namespace Auth.api.Repository
{
    public interface IUserRepository
    {
        Task<User?> Login(LoginDto loginDto);
        Task<User> Register(RegisterDto registerDto);
        Task<User?> GetUserByEmail(string email);
        Task<User?> GetUserById(string id);
    }
}
