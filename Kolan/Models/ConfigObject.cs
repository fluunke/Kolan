using System;
using Newtonsoft.Json;

namespace Kolan
{
   public class ConfigObject
   {
      public string DatabaseUrl          { get; set; }
      public string DatabaseUser         { get; set; }
      public string DatabasePassword     { get; set; }
      public string TestDatabaseUrl      { get; set; }
      public string TestDatabaseUser     { get; set; }
      public string TestDatabasePassword { get; set; }
      public string SecurityKey          { get; set; }
      public int    SaltLength           { get; set; }
      public int    HashIterations       { get; set; }
      public bool   AllowRegistrations   { get; set; }
      public string TaskColorSeed        { get; set; }
   }
}
