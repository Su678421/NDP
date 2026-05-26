const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
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

// 发送消息
router.post('/', verifyUser, async (req, res) => {
  try {
    const { receiver, content, type, mediaUrl, roomId } = req.body;
    
    const message = new Message({
      sender: req.user.username,
      receiver,
      content,
      type: type || 'text',
      mediaUrl: mediaUrl || '',
      roomId: roomId || ''
    });
    
    await message.save();
    res.status(201).json({ message: '发送成功', data: message });
  } catch (err) {
    console.error('发送消息错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取与某个用户的所有聊天记录
router.get('/:otherUsername', verifyUser, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.username, receiver: req.params.otherUsername },
        { sender: req.params.otherUsername, receiver: req.user.username }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error('获取消息错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有聊天会话列表
router.get('/', verifyUser, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.username },
        { receiver: req.user.username }
      ]
    }).sort({ createdAt: -1 });
    
    // 提取对话用户列表
    const conversations = {};
    messages.forEach(msg => {
      const otherUser = msg.sender === req.user.username ? msg.receiver : msg.sender;
      if (!conversations[otherUser]) {
        conversations[otherUser] = {
          username: otherUser,
          lastMessage: msg.content || (msg.type === 'image' ? '[图片]' : '[视频]'),
          lastTime: msg.createdAt,
          unread: msg.receiver === req.user.username && !msg.isRead ? 1 : 0
        };
      }
    });
    
    res.json(Object.values(conversations));
  } catch (err) {
    console.error('获取会话列表错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 标记消息为已读
router.put('/read/:otherUsername', verifyUser, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.otherUsername, receiver: req.user.username, isRead: false },
      { isRead: true }
    );
    res.json({ message: '已标记为已读' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
