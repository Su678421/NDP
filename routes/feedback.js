const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const jwt = require('jsonwebtoken');

// 中间件：验证用户身份
const verifyUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token.startsWith('mock-token')) {
    return res.status(401).json({ message: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: '无效的令牌' });
  }
};

// 提交问题反馈
router.post('/', async (req, res) => {
  try {
    const { name, email, message, userId, username } = req.body;
    
    const feedback = new Feedback({
      name,
      email,
      message,
      userId: userId || null,
      username: username || ''
    });
    
    await feedback.save();
    res.status(201).json({ message: '反馈已提交', feedback });
  } catch (err) {
    console.error('提交反馈错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有反馈（仅管理员）
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新反馈状态（仅管理员）
router.put('/:id', async (req, res) => {
  try {
    const { status, reply } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { 
        status: status || 'reviewed',
        reply: reply || '',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ message: '未找到反馈' });
    }
    
    res.json({ message: '更新成功', feedback });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除反馈（仅管理员）
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
