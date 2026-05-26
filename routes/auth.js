const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Beneficiary = require('../models/Beneficiary');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, phone, idCard, address, description } = req.body;
    
    // 检查用户名是否已存在
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: '该用户名已被使用，请重新选择用户名' });
    }
    
    // 检查邮箱是否已存在（仅当邮箱不为空时）
    if (email && email.trim()) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({ message: '邮箱已被注册' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'donor',
      isVerified: role === 'admin' ? true : false,
      phone,
      idCard,
      address,
      description
    });
    
    await user.save();
    
    // 如果是受赠者，同时创建 Beneficiary 记录
    if (role === 'beneficiary') {
      const beneficiary = new Beneficiary({
        userId: user._id,
        username: username,
        phone,
        idCard,
        address,
        description,
        status: 'pending'
      });
      await beneficiary.save();
    }
    
    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 支持通过用户名或邮箱登录
    let user;
    if (email && email.trim()) {
      user = await User.findOne({ email });
    } else if (username && username.trim()) {
      user = await User.findOne({ username });
    }
    
    if (!user) {
      return res.status(401).json({ message: '用户名/邮箱或密码错误' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名/邮箱或密码错误' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        phone: user.phone,
        idCard: user.idCard,
        address: user.address,
        description: user.description
      } 
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;