const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Beneficiary = require('../models/Beneficiary');
const jwt = require('jsonwebtoken');

// 中间件：验证管理员身份
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: '只有管理员可以访问' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: '无效的令牌' });
  }
};

// 获取所有用户
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取待审核的受赠者
router.get('/pending-beneficiaries', verifyAdmin, async (req, res) => {
  try {
    const beneficiaries = await User.find({ 
      role: 'beneficiary', 
      isVerified: false 
    }).select('-password');
    res.json(beneficiaries);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 审核受赠者
router.post('/verify-beneficiary/:id', verifyAdmin, async (req, res) => {
  try {
    const { verified } = req.body;
    
    // 更新 User 模型
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: verified },
      { new: true }
    ).select('-password');
    
    // 同时更新 Beneficiary 模型
    if (user) {
      await Beneficiary.findOneAndUpdate(
        { userId: req.params.id },
        { status: verified ? 'approved' : 'rejected' }
      );
    }
    
    res.json({ message: verified ? '已通过审核' : '已拒绝', user });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户已删除' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;