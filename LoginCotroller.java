package com.example.cocosuku.controller;

import com.example.cocosuku.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    @ResponseBody
    public String login(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session) {

        boolean success = userService.login(email, password);
        if (success) {
            session.setAttribute("email", email);
            return "OK";
        } else {
            return "NG";
        }
    }
}
