using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Kolan
{
   public class User
   {
      [JsonProperty("id")]
      public string Id { get; set; }

      [JsonProperty("username")]
      public string Username { get; set; }

      [JsonProperty("password")]
      public string Password { get; set; }
   }
}
