﻿using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Kolan.Models;
using Kolan.Repositories;

namespace Kolan.Controllers
{
    [Authorize]
    public class BoardsController : Controller
    {
        [Authorize]
        public IActionResult Index()
        {
            ViewData["username"] = User.Identity.Name;

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
