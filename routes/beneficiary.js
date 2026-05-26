const express = require('express');
const router = express.Router();
const Beneficiary = require('../models/Beneficiary');
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

// 创建受赠者申请
router.post('/', verifyUser, async (req, res) => {
  try {
    const { phone, idCard, address, description, needType, needAmount, needGoods } = req.body;
    
    const beneficiary = new Beneficiary({
      userId: req.user.id,
      username: req.body.username,
      phone,
      idCard,
      address,
      description,
      needType: needType || 'both',
      needAmount: needAmount || 0,
      needGoods: needGoods || '',
      status: 'pending'
    });
    
    await beneficiary.save();
    res.status(201).json({ message: '申请已提交', beneficiary });
  } catch (err) {
    console.error('创建受赠者错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有已审核的受赠者
router.get('/', async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ status: 'approved' })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(beneficiaries);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取我的受赠者申请
router.get('/my', verifyUser, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOne({ userId: req.user.id });
    res.json(beneficiary || null);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新受赠者信息
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!beneficiary) {
      return res.status(404).json({ message: '未找到受赠者信息' });
    }
    
    res.json({ message: '更新成功', beneficiary });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
