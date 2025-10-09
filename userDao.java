package com.example.cocosuku.dao;

import com.example.cocosuku.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.ResultSet;
import java.util.List;

@Repository
public class UserDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        List<User> users = jdbcTemplate.query(sql, (ResultSet rs, int rowNum) -> {
            User u = new User();
            u.setUserId(rs.getInt("user_id"));
            u.setEmail(rs.getString("email"));
            u.setPasswordHash(rs.getString("password_hash"));
            u.setName(rs.getString("name"));
            return u;
        }, email);
        return users.isEmpty() ? null : users.get(0);
    }
}
