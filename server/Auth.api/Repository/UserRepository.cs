using Auth.api.Data;
using Auth.api.Dtos;
using Auth.api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Auth.api.Repository
{
    public class UserRepository(DatabaseContext context) : IUserRepository
    {
        private readonly DatabaseContext _context = context ?? throw new ArgumentNullException(nameof(context));

        public async Task<User?> Login(LoginDto loginDto)
        {
            // ArgumentNullException.ThrowIfNull(loginDto);
            return await _context.Users
                                 .SingleOrDefaultAsync(user => user.Email == loginDto.email && user.Password == loginDto.password);
        }

        public async Task<User> Register(RegisterDto registerDto)
        {
            ArgumentNullException.ThrowIfNull(registerDto);

            var user = new User()
            {
                Id = Guid.NewGuid().ToString(),
                Email = registerDto.email,
                Password = registerDto.password,
                UserName = registerDto.username
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            if (string.IsNullOrEmpty(email)) throw new ArgumentNullException(nameof(email));

            return await _context.Users
                                 .SingleOrDefaultAsync(user => user.Email == email);
        }

        public async Task<User?> GetUserById(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new ArgumentNullException(nameof(id));

            return await _context.Users
                                 .FindAsync(id);
        }
    }
}
