package com.example.cocosuku.service;

import com.example.cocosuku.dao.UserDao;
import com.example.cocosuku.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    public boolean login(String email, String password) {
        User user = userDao.findByEmail(email);
        if (user == null) return false;

        // パスワード検証（BCrypt）
        return BCrypt.checkpw(password, user.getPasswordHash());
    }
}
