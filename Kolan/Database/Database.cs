
using System.Linq;
using Neo4jClient;
using Kolan.Controllers.Api;
using Kolan.Repositories;
using System;
using Neo4jClient.Transactions;
using Kolan.ViewModels;

namespace Kolan
{
    public class Database
    {
        public static ITransactionalGraphClient Client;

        public async void Init()
        {
            // Create graph client
            Client = new GraphClient(new Uri(Config.Values.DatabaseUrl),
                                     Config.Values.DatabaseUser,
                                     Config.Values.DatabasePassword);
            Client.Connect();

            // Check if empty, if so, start setup process
            var query = Client.Cypher.Match("(n)")
                                     .Return(n => n.As<object>())
                                     .Limit(1);
            if (query.Results.Count() == 0)
                Setup();

            // Debugging users
            new UserController(new UnitOfWork(Client)).Create(new RegisterViewModel() { Email = "email", Username = "bakk", Password = "pass" });
            new UserController(new UnitOfWork(Client)).Create(new RegisterViewModel() { Email = "email", Username = "domi", Password = "pass" });
            new UserController(new UnitOfWork(Client)).Create(new RegisterViewModel() { Email = "email", Username = "liv", Password = "pass" });
            new UserController(new UnitOfWork(Client)).Create(new RegisterViewModel() { Email = "email", Username = "bakk2", Password = "pass" });
        }

        public void Setup()
        {
            try
            {
                // Constraints
                Client.Cypher.CreateUniqueConstraint("u:User", "u.username")
                             .ExecuteWithoutResults();
                Client.Cypher.CreateUniqueConstraint("g:Group", "g.id")
                             .ExecuteWithoutResults();
                Client.Cypher.CreateUniqueConstraint("b:Board", "b.id")
                             .ExecuteWithoutResults();
            }
            catch (NeoException)
            {
                return;
            }
        }
    }
}
