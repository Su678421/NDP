// 测试JavaScript是否正常执行
console.log('NDP捐赠平台 - JavaScript已加载');

// 全局变量定义
// 聊天记录存储
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || {};

// 验证手机号（11位数字，以1开头）
function validatePhone(phone) {
    const phonePattern = /^1[3-9]\d{9}$/;
    return phonePattern.test(phone);
}

// 验证身份证号（18位，支持末尾X）
function validateIdCard(idCard) {
    const idCardPattern = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (!idCardPattern.test(idCard)) return false;
    
    const coefficients = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += parseInt(idCard[i]) * coefficients[i];
    }
    const remainder = sum % 11;
    return checkCodes[remainder] === idCard[17].toUpperCase();
}

// 验证密码（6-20个字符）
function validatePassword(password) {
    if (password.length < 6 || password.length > 20) return false;
    return /^[a-zA-Z0-9@#$%^&*()_+\-=\[\]{}|;:,.<>?~]+$/.test(password);
}

// 验证姓名（2-20个字符，中文或英文）
function validateName(name) {
    return name.length >= 2 && name.length <= 20 && /^[\u4e00-\u9fa5a-zA-Z]+$/.test(name);
}

// 模拟用户数据库，存储所有注册用户的信息
let userDatabase = JSON.parse(localStorage.getItem('userDatabase')) || {};

// 后端API地址
const API_URL = window.location.origin;

// 清理默认测试数据
function cleanTestData() {
    // 清理userDatabase中的默认测试数据
    const userDatabase = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    const testUsers = ['13800138000', '13900139000', '13700137000', '张三', '李四', '王五'];
    
    let hasChanges = false;
    for (const key in userDatabase) {
        if (testUsers.includes(key) || testUsers.includes(userDatabase[key].name)) {
            delete userDatabase[key];
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
        console.log('清理了默认测试数据');
    }
    
    // 清理beneficiaries中的测试数据（如果有）
    const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    const cleanedBeneficiaries = beneficiaries.filter(b => !testUsers.includes(b.username));
    
    if (cleanedBeneficiaries.length !== beneficiaries.length) {
        localStorage.setItem('beneficiaries', JSON.stringify(cleanedBeneficiaries));
        console.log('清理了受赠者中的测试数据');
    }
}



// 初始化管理员用户
function initAdminUser() {
    const adminExists = Object.values(userDatabase).some(u => u.role === 'admin' || u.name === 'admin');
    
    if (!adminExists) {
        userDatabase['admin'] = {
            name: 'admin',
            role: 'admin',
            password: 'admin123',
            isAdmin: true
        };
        saveUserDatabase();
        console.log('已初始化管理员用户: admin/admin123');
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化管理员用户
    initAdminUser();
    
    // 清理默认测试数据
    cleanTestData();
    
    // 初始化所有功能
    initTabSwitching();
    initFaqAccordion();
    initProjectFilter();
    initSmoothScroll();
    initFormSubmission();
    initAnimations();
    initAmountButtons();
    initPaymentButtons();
    updateNavbar();
    loadBeneficiaries();
});

// 标签页切换功能
function initTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// FAQ手风琴功能
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            item.classList.toggle('active');
        });
    });
}

// 项目筛选功能
function initProjectFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const projectItems = document.querySelectorAll('.project-item');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // 移除所有活动状态
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 筛选项目
            projectItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// 平滑滚动功能
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // 避免使用无效的选择器
            if (targetId === '#') {
                // 滚动到页面顶部
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 表单提交处理
function initFormSubmission() {
    const moneyForm = document.getElementById('money-donate-form');
    const goodsForm = document.getElementById('goods-donate-form');
    const contactForm = document.querySelector('.contact-form');

    if (moneyForm) {
        moneyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('感谢您的爱心捐赠！我们会尽快处理您的捐赠请求。');
            this.reset();
        });
    }

    if (goodsForm) {
        goodsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('感谢您的爱心捐赠！我们会尽快联系您安排物品的邮寄事宜。');
            this.reset();
        });
    }

    }

// 提交问题反馈
function submitFeedback(form) {
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;
    
    // 获取当前登录用户信息
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userId = currentUser ? currentUser._id : null;
    const username = currentUser ? currentUser.username : null;
    
    // 保存反馈到本地存储
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push({
        id: Date.now().toString(),
        name: name,
        email: email,
        message: message,
        userId: userId,
        username: username,
        timestamp: new Date().toISOString(),
        status: 'pending'
    });
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    alert('感谢您的反馈！我们会尽快处理您的问题。');
    form.reset();
}

// 动画效果
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('section > div');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// 金额按钮功能
function initAmountButtons() {
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmount = document.getElementById('custom-amount');

    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            amountBtns.forEach(b => b.style.backgroundColor = '#f9f9f9');
            amountBtns.forEach(b => b.style.color = '#333');
            
            // 设置当前按钮为活动状态
            this.style.backgroundColor = '#ff7e5f';
            this.style.color = '#fff';
            
            // 清空自定义金额
            if (customAmount) {
                customAmount.value = '';
            }
        });
    });

    // 自定义金额输入时，重置按钮状态
    if (customAmount) {
        customAmount.addEventListener('input', function() {
            amountBtns.forEach(b => {
                b.style.backgroundColor = '#f9f9f9';
                b.style.color = '#333';
            });
        });
    }
}

// 支付按钮功能
function initPaymentButtons() {
    const paymentBtns = document.querySelectorAll('.payment-btn');

    paymentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            paymentBtns.forEach(b => b.style.backgroundColor = '#f9f9f9');
            paymentBtns.forEach(b => b.style.color = '#333');
            
            // 设置当前按钮为活动状态
            this.style.backgroundColor = '#ff7e5f';
            this.style.color = '#fff';
        });
    });
}

// 滚动时导航栏效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = '#fff';
        header.style.backdropFilter = 'none';
    }
});

// 捐赠类型切换
function initDonateTypeToggle() {
    const donateTypeRadios = document.querySelectorAll('input[name="donate-type"]');
    donateTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'monthly') {
                alert('感谢您选择定期捐赠，您的持续支持将给需要帮助的人带来更多希望！');
            }
        });
    });
}

// 物品捐赠类型选择
function initGoodsTypeSelect() {
    const goodsTypeSelect = document.getElementById('goods-type');
    if (goodsTypeSelect) {
        goodsTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            let message = '';
            
            switch(selectedType) {
                case 'clothes':
                    message = '请确保衣物干净整洁，适合穿着。';
                    break;
                case 'books':
                    message = '请确保书籍完好，内容积极健康。';
                    break;
                case 'food':
                    message = '请确保食品在保质期内，包装完好。';
                    break;
                case 'other':
                    message = '请详细描述物品的情况，确保物品适合捐赠。';
                    break;
            }
            
            if (message) {
                alert(message);
            }
        });
    }
}

// 初始化额外功能
setTimeout(function() {
    initDonateTypeToggle();
    initGoodsTypeSelect();
}, 1000);

// 加载更多项目功能（模拟）
function loadMoreProjects() {
    const projectList = document.querySelector('.project-list');
    if (projectList) {
        // 模拟加载更多项目
        for (let i = 0; i < 3; i++) {
            const projectItem = document.createElement('div');
            projectItem.className = 'project-item';
            projectItem.setAttribute('data-category', ['education', 'medical', 'poverty'][Math.floor(Math.random() * 3)]);
            
            projectItem.innerHTML = `
                <div class="project-info">
                    <h3>爱心捐赠项目 ${i + 1}</h3>
                    <p>帮助需要帮助的人，让世界充满爱。</p>
                    <div class="project-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.floor(Math.random() * 100)}%;"></div>
                        </div>
                        <span>${Math.floor(Math.random() * 100)}% 已完成</span>
                    </div>
                    <a href="#" class="btn-secondary">查看详情</a>
                </div>
            `;
            
            projectList.appendChild(projectItem);
        }
    }
}

// 倒计时功能（用于活动）
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7天后
        
        function updateCountdown() {
            const now = new Date();
            const distance = endDate - now;
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownElement.innerHTML = `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
            
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = '活动已结束';
            }
        }
        
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }
}

// 初始化所有功能
window.addEventListener('load', function() {
    // 页面完全加载后执行的功能
    console.log('NDP捐赠平台已加载完成！');
    
    // 模拟数据加载
    setTimeout(function() {
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
    }, 1000);
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('发生错误:', e.error);
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Alt + D 快速跳转到捐赠页面
    if (e.altKey && e.key === 'd') {
        e.preventDefault();
        document.querySelector('a[href="#donate"]').click();
    }
    
    // Alt + H 快速跳转到首页
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// 复制到剪贴板功能
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            alert('已复制到剪贴板');
        }).catch(function() {
            alert('复制失败，请手动复制');
        });
    } else {
        // 兼容旧浏览器
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('已复制到剪贴板');
    }
}

// 分享功能
function shareOnSocialMedia(platform) {
    const url = window.location.href;
    const title = 'NDP新捐赠平台 - 让爱心传递，让温暖延续';
    let shareUrl = '';
    
    switch(platform) {
        case 'wechat':
            shareUrl = `weixin://share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
            break;
        case 'weibo':
            shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
            break;
        case 'qq':
            shareUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// 捐赠成功提示
function showDonationSuccess() {
    const successModal = document.createElement('div');
    successModal.className = 'donation-success-modal';
    successModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        max-width: 500px;
        width: 90%;
    `;
    
    successModal.innerHTML = `
        <h3 style="color: #ff7e5f; margin-bottom: 20px;">捐赠成功！</h3>
        <p style="margin-bottom: 30px;">感谢您的爱心捐赠，您的善举将给需要帮助的人带来希望。</p>
        <button onclick="this.parentElement.remove()" style="
            padding: 12px 24px;
            background-color: #ff7e5f;
            color: #fff;
            border: none;
            border-radius: 50px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        ">关闭</button>
    `;
    
    document.body.appendChild(successModal);
    
    // 3秒后自动关闭
    setTimeout(function() {
        if (document.contains(successModal)) {
            successModal.remove();
        }
    }, 5000);
}

// 保存聊天记录
function saveChatMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

// 保存用户数据库到本地存储
function saveUserDatabase() {
    localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
}

// 清除所有受赠者数据（用于测试）
function clearBeneficiaries() {
    localStorage.removeItem('beneficiaries');
    // 同时清除userDatabase中的受赠者
    const updatedUserDatabase = {};
    for (const key in userDatabase) {
        if (userDatabase[key].role !== 'beneficiary') {
            updatedUserDatabase[key] = userDatabase[key];
        }
    }
    userDatabase = updatedUserDatabase;
    saveUserDatabase();
    alert('受赠者数据已清除');
    // 重新加载受赠者列表
    loadBeneficiaries();
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
}

// 更新导航栏
function updateNavbar() {
    const userArea = document.getElementById('user-area');
    if (!userArea) return;
    
    const loginBtn = userArea.querySelector('.login-btn');
    const userInfo = document.getElementById('user-info');
    
    if (checkLoginStatus()) {
        const user = JSON.parse(localStorage.getItem('user'));
        const userNameElement = document.getElementById('user-name');
        const userAvatarElement = document.querySelector('.user-avatar-small');
        
        if (userNameElement) {
            userNameElement.textContent = user.username;
        }
        if (userAvatarElement) {
            // 检查用户是否有保存的头像
            const avatarKey = 'avatar_' + user.username;
            const savedAvatar = localStorage.getItem(avatarKey);
            if (savedAvatar) {
                userAvatarElement.style.backgroundImage = `url(${savedAvatar})`;
                userAvatarElement.style.backgroundSize = 'cover';
                userAvatarElement.style.backgroundPosition = 'center';
                userAvatarElement.textContent = '';
            } else {
                // 设置默认头像：橙色背景 + 白色首字母
                userAvatarElement.style.backgroundImage = 'none';
                userAvatarElement.style.backgroundColor = '#ff7e5f';
                userAvatarElement.style.color = '#fff';
                userAvatarElement.style.display = 'flex';
                userAvatarElement.style.alignItems = 'center';
                userAvatarElement.style.justifyContent = 'center';
                userAvatarElement.style.fontWeight = 'bold';
                userAvatarElement.textContent = user.username.charAt(0).toUpperCase();
            }
        }
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        if (userInfo) {
            userInfo.style.display = 'flex';
        }
        
        const adminMenuItem = document.getElementById('admin-menu-item');
        if (adminMenuItem) {
            adminMenuItem.style.display = user.isAdmin ? 'block' : 'none';
        }
    } else {
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavbar();
    alert('已退出登录');
}

// 注销账号
async function deleteAccount() {
    if (!confirm('确定要注销账号吗？此操作不可恢复！')) {
        return;
    }
    
    if (!confirm('再次确认：账号注销后将无法找回，确定继续吗？')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + '/api/auth/delete-account', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateNavbar();
            alert('账号已注销');
        } else {
            alert('注销失败，请稍后重试');
        }
    } catch (error) {
        alert('注销失败，请稍后重试');
    }
}

// 登录函数
async function login(username, password) {
    try {
        const response = await fetch(API_URL + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
        throw new Error(data.message || '登录失败');
    } catch (error) {
        // 模拟环境下从本地数据库验证
        // 查找用户（支持手机号或用户名登录）
        let userData = null;
        let loginKey = null;
        
        // 检查是否是手机号登录
        if (userDatabase[username]) {
            userData = userDatabase[username];
            loginKey = username;
        } else {
            // 检查是否是用户名登录
            for (const key in userDatabase) {
                if (userDatabase[key].name === username) {
                    userData = userDatabase[key];
                    loginKey = key;
                    break;
                }
            }
        }
        
        if (userData && userData.password === password) {
            // 登录成功，创建用户对象
            const user = {
                _id: Date.now().toString(),
                username: userData.name,
                role: userData.role,
                isAdmin: userData.role === 'admin' || userData.isAdmin
            };
            
            // 如果是受赠者，从beneficiaries中获取更多信息
            if (userData.role === 'beneficiary') {
                const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
                const beneficiary = beneficiaries.find(b => b.username === userData.name);
                if (beneficiary) {
                    user.isVerified = beneficiary.isVerified;
                    user.isReviewed = beneficiary.isReviewed;
                    user.phone = beneficiary.phone;
                    user.address = beneficiary.address;
                    user.description = beneficiary.description;
                    user.image = beneficiary.image;
                }
            }
            
            // 如果是管理员，设置isAdmin为true
            if (userData.role === 'admin' || userData.isAdmin) {
                user.isAdmin = true;
                user.isVerified = true;
            }
            
            localStorage.setItem('token', 'mock-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } else {
            throw new Error('手机号或密码错误');
        }
    }
}

// 检查用户名是否可用
function isUsernameAvailable(username) {
    // 从本地存储重新加载用户数据库
    const latestUserDatabase = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    
    // 检查 userDatabase 中是否有该用户名
    for (const key in latestUserDatabase) {
        if (latestUserDatabase[key].name === username) {
            return false;
        }
    }
    
    // 检查 beneficiaries 中是否有该用户名
    const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    if (beneficiaries.some(b => b.username === username)) {
        return false;
    }
    
    // 检查当前登录用户（如果有）
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser && currentUser.username === username) {
        return true; // 当前用户可以使用自己的用户名
    }
    
    return true;
}

// 注册函数
async function register(username, password, role) {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
        throw new Error(data.message);
    } catch (error) {
        // 模拟注册成功
        // 假设注册时的username是用户名称，需要获取手机号
        // 这里简化处理，假设手机号是从表单中获取的
        // 实际项目中需要从注册表单中获取手机号
        const phoneNumber = document.querySelector('input[type="tel"]').value;
        
        if (!phoneNumber) {
            throw new Error('请输入手机号');
        }
        
        // 保存用户信息到数据库
        userDatabase[phoneNumber] = {
            name: username, // 保存用户名称
            role: role,
            password: password
        };
        
        // 保存数据库
        saveUserDatabase();
        
        const mockUser = {
            _id: '1',
            username: username,
            role: role
        };
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
    }
}

// 登录/注册功能
function openAuthModal(type) {
    if (type === 'register') {
        // 先显示角色选择
        openRoleSelectModal();
    } else {
        // 显示登录模态框
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        modal.innerHTML = `
            <div class="auth-modal-content" style="
                background-color: #fff;
                padding: 30px;
                border-radius: 10px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 25px rgba(0,0,0,0.25);
                position: relative;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                color: #333;
            ">
                <h3 style="text-align: center; margin-bottom: 25px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">登录</h3>
                <form class="auth-form" onsubmit="event.preventDefault(); handleLogin(this)" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="text" placeholder="用户名/手机号/邮箱" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                    <input type="password" placeholder="密码" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                    <button type="submit" style="
                        padding: 12px;
                        background-color: #ff7e5f;
                        color: #fff;
                        border: none;
                        border-radius: 6px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-family: 'Microsoft YaHei', Arial, sans-serif;
                        font-size: 14px;
                    ">登录</button>
                    <p style="text-align: center; margin-top: 15px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">
                        还没有账号？ <a href="#" onclick="event.preventDefault(); openAuthModal('register')" style="color: #ff7e5f; text-decoration: none; font-family: 'Microsoft YaHei', Arial, sans-serif;">
                            立即注册
                        </a>
                    </p>
                </form>
                <button onclick="this.closest('.auth-modal').remove()" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                ">&times;</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// 角色选择模态框
function openRoleSelectModal() {
    const modal = document.createElement('div');
    modal.className = 'role-select-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="role-select-content" style="
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 25px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">选择注册角色</h3>
            <div class="role-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                <button class="role-btn" onclick="event.preventDefault(); openDonorRegister()" style="
                    padding: 15px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                ">注册为捐赠者</button>
                <button class="role-btn" onclick="event.preventDefault(); openBeneficiaryRegister()" style="
                    padding: 15px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                ">注册为受赠者</button>
            </div>
            <p style="text-align: center; margin-top: 20px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">
                已有账号？ <a href="#" onclick="event.preventDefault(); openAuthModal('login')" style="color: #ff7e5f; text-decoration: none; font-family: 'Microsoft YaHei', Arial, sans-serif;">
                    立即登录
                </a>
            </p>
            <button onclick="this.closest('.role-select-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);

    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 管理员面板
function openAdminPanel() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isAdmin) {
        alert('只有管理员可以访问');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        background-color: #fff;
        padding: 30px;
        border-radius: 10px;
        max-width: 900px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        font-family: 'Microsoft YaHei', Arial, sans-serif;
        position: relative;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '管理员后台';
    title.style.cssText = 'text-align: center; color: #ff7e5f; margin-bottom: 20px;';
    
    const buttonDiv = document.createElement('div');
    buttonDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 20px;';
    
    const usersBtn = document.createElement('button');
    usersBtn.textContent = '用户列表';
    usersBtn.style.cssText = 'padding: 10px 20px; background-color: #ff7e5f; color: #fff; border: none; border-radius: 5px; cursor: pointer;';
    usersBtn.addEventListener('click', loadAllUsers);
    
    const pendingBtn = document.createElement('button');
    pendingBtn.textContent = '待审核受赠者';
    pendingBtn.style.cssText = 'padding: 10px 20px; background-color: #ff7e5f; color: #fff; border: none; border-radius: 5px; cursor: pointer;';
    pendingBtn.addEventListener('click', loadPendingBeneficiaries);
    
    const feedbackBtn = document.createElement('button');
    feedbackBtn.textContent = '问题反馈';
    feedbackBtn.style.cssText = 'padding: 10px 20px; background-color: #4CAF50; color: #fff; border: none; border-radius: 5px; cursor: pointer;';
    feedbackBtn.addEventListener('click', loadFeedbacks);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = 'padding: 10px 20px; background-color: #666; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-left: auto;';
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    const adminContent = document.createElement('div');
    adminContent.id = 'admin-content';
    adminContent.innerHTML = '<p style="text-align: center; color: #666;">请选择一个功能</p>';
    
    const closeXBtn = document.createElement('button');
    closeXBtn.textContent = '×';
    closeXBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;';
    closeXBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    buttonDiv.appendChild(usersBtn);
    buttonDiv.appendChild(pendingBtn);
    buttonDiv.appendChild(feedbackBtn);
    buttonDiv.appendChild(closeBtn);
    
    contentDiv.appendChild(title);
    contentDiv.appendChild(buttonDiv);
    contentDiv.appendChild(adminContent);
    contentDiv.appendChild(closeXBtn);
    
    modal.appendChild(contentDiv);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 加载所有用户
async function loadAllUsers() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    let apiUsers = [];
    try {
        const response = await fetch(API_URL + '/api/admin/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            apiUsers = await response.json();
        }
    } catch (error) {
        console.log('API加载失败，使用本地数据');
    }
    
    const localBeneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    const latestUserDatabase = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    
    const usersFromDatabase = Object.values(latestUserDatabase)
        .filter(d => d.name && d.password)
        .map(d => ({
            _id: d.id || Date.now().toString() + Math.random(),
            username: d.name,
            role: d.role,
            isVerified: d.role === 'donor' ? true : false
        }));
    
    let allUsers = [...apiUsers, ...usersFromDatabase];
    
    localBeneficiaries.forEach(b => {
        const existingUser = allUsers.find(u => u.username === b.username);
        if (existingUser) {
            existingUser.isVerified = b.isVerified;
            existingUser.isReviewed = b.isReviewed;
        } else {
            allUsers.push({
                _id: b._id || Date.now().toString() + Math.random(),
                username: b.username,
                role: 'beneficiary',
                isVerified: b.isVerified,
                isReviewed: b.isReviewed
            });
        }
    });
    
    if (currentUser && !allUsers.some(u => u.username === currentUser.username)) {
        allUsers.push({
            _id: currentUser._id,
            username: currentUser.username,
            role: currentUser.role,
            isVerified: currentUser.isVerified || true,
            isAdmin: currentUser.isAdmin
        });
    }
    
    const uniqueUsers = [];
    const seenUsernames = new Set();
    allUsers.forEach(user => {
        if (!seenUsernames.has(user.username)) {
            seenUsernames.add(user.username);
            uniqueUsers.push(user);
        }
    });
    
    displayUsers(uniqueUsers);
}

// 显示用户列表
function displayUsers(users) {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<h3>所有用户 (' + users.length + ')</h3>' +
        '<table style="width: 100%; border-collapse: collapse;">' +
        '<tr style="background-color: #f9f9f9;">' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">用户名</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">角色</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">状态</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">操作</th>' +
        '</tr>' +
        users.map(function(u) {
            var roleText = u.isAdmin ? '管理员' : u.role === 'donor' ? '捐赠者' : '受赠者';
            var statusText = u.role === 'beneficiary' ? (u.isVerified ? '已认证' : (u.isReviewed ? '未通过' : '审核中')) : '已认证';
            var buttons = '';
            if (u.role === 'beneficiary' && !u.isReviewed) {
                buttons = '<button onclick="verifyBeneficiary(\'' + u.username + '\', true)" style="padding: 5px 10px; background-color: #4CAF50; color: #fff; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">通过</button>' +
                    '<button onclick="verifyBeneficiary(\'' + u.username + '\', false)" style="padding: 5px 10px; background-color: #f44336; color: #fff; border: none; border-radius: 3px; cursor: pointer;">拒绝</button>';
            }
            if (!u.isAdmin) {
                buttons += '<button onclick="deleteUser(\'' + u.username + '\')" style="padding: 5px 10px; background-color: #666; color: #fff; border: none; border-radius: 3px; cursor: pointer;">删除</button>';
            }
            return '<tr>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + u.username + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + roleText + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + statusText + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + buttons + '</td>' +
                '</tr>';
        }).join('') +
        '</table>';
}

// 加载待审核受赠者
async function loadPendingBeneficiaries() {
    const token = localStorage.getItem('token');
    const localBeneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    
    let apiBeneficiaries = [];
    try {
        const response = await fetch(API_URL + '/api/admin/pending-beneficiaries', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            apiBeneficiaries = await response.json();
        }
    } catch (error) {
        console.log('API加载失败，使用本地数据');
    }
    
    const allPending = [...apiBeneficiaries];
    
    localBeneficiaries.forEach(b => {
        if (!b.isReviewed && !allPending.some(u => u.username === b.username)) {
            allPending.push(b);
        }
    });
    
    const content = document.getElementById('admin-content');
    if (allPending.length === 0) {
        content.innerHTML = '<h3>待审核受赠者 (0)</h3><p>没有待审核的受赠者</p>';
    } else {
        content.innerHTML = '<h3>待审核受赠者 (' + allPending.length + ')</h3>' +
            allPending.map(function(u) {
                return '<div style="padding: 15px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 5px;">' +
                    '<p><strong>用户名：</strong>' + u.username + '</p>' +
                    '<p><strong>手机号：</strong>' + (u.phone || '未填写') + '</p>' +
                    '<p><strong>地址：</strong>' + (u.address || '未填写') + '</p>' +
                    '<p><strong>描述：</strong>' + (u.description || '未填写') + '</p>' +
                    '<button onclick="verifyBeneficiary(\'' + u.username + '\', true)" style="padding: 8px 16px; background-color: #4CAF50; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">通过审核</button>' +
                    '<button onclick="verifyBeneficiary(\'' + u.username + '\', false)" style="padding: 8px 16px; background-color: #f44336; color: #fff; border: none; border-radius: 4px; cursor: pointer;">拒绝</button>' +
                    '</div>';
            }).join('');
    }
}

// 审核受赠者
async function verifyBeneficiary(username, verified) {
    const token = localStorage.getItem('token');
    
    // 先尝试通过API审核
    try {
        // 先获取用户ID
        const usersResponse = await fetch(API_URL + '/api/admin/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            const user = users.find(u => u.username === username);
            if (user && user._id) {
                await fetch(API_URL + '/api/admin/verify-beneficiary/' + user._id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ verified: verified })
                });
            }
        }
    } catch (error) {
        console.log('API审核失败，使用本地数据');
    }
    
    // 同时更新本地存储
    const localBeneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    const updatedBeneficiaries = localBeneficiaries.map(b => {
        if (b.username === username) {
            return { ...b, isVerified: verified, isReviewed: true };
        }
        return b;
    });
    localStorage.setItem('beneficiaries', JSON.stringify(updatedBeneficiaries));
    
    const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '{}');
    const messageKey = `admin_${username}`;
    const reverseKey = `${username}_admin`;
    
    if (!chatMessages[messageKey]) chatMessages[messageKey] = [];
    if (!chatMessages[reverseKey]) chatMessages[reverseKey] = [];
    
    const messageContent = verified 
        ? '您的受赠者申请已通过审核，现在可以接受捐赠了！' 
        : '您的受赠者申请未通过审核，如有疑问请重新注册申请。';
    
    const messageData = {
        sender: 'admin',
        receiver: username,
        message: messageContent,
        time: new Date().toLocaleTimeString()
    };
    
    chatMessages[messageKey].push(messageData);
    chatMessages[reverseKey].push(messageData);
    
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    
    alert(verified ? '已通过审核' : '已拒绝');
    loadPendingBeneficiaries();
}

// 删除用户
async function deleteUser(username) {
    if (!confirm('确定要删除这个用户吗？')) return;
    
    const token = localStorage.getItem('token');
    
    // 先尝试通过API删除
    try {
        const usersResponse = await fetch(API_URL + '/api/admin/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            const user = users.find(u => u.username === username);
            if (user && user._id) {
                await fetch(API_URL + '/api/admin/users/' + user._id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
            }
        }
    } catch (error) {
        console.log('API删除失败，使用本地数据');
    }
    
    // 同时删除本地存储中的用户
    const userDatabase = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    const updatedDatabase = Object.entries(userDatabase)
        .filter(([key, user]) => user.id !== username && user.name !== username)
        .reduce((acc, [key, user]) => {
            acc[key] = user;
            return acc;
        }, {});
    localStorage.setItem('userDatabase', JSON.stringify(updatedDatabase));
    
    const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    const updatedBeneficiaries = beneficiaries.filter(b => b._id !== username && b.username !== username);
    localStorage.setItem('beneficiaries', JSON.stringify(updatedBeneficiaries));
    
    alert('用户已删除');
    loadAllUsers();
}

// 加载问题反馈列表
function loadFeedbacks() {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const content = document.getElementById('admin-content');
    
    if (feedbacks.length === 0) {
        content.innerHTML = '<h3>问题反馈 (0)</h3><p style="text-align: center; color: #666; padding: 20px;">暂无问题反馈</p>';
        return;
    }
    
    content.innerHTML = '<h3>问题反馈 (' + feedbacks.length + ')</h3>' +
        '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">' +
        '<tr style="background-color: #f9f9f9;">' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">姓名</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">邮箱</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">用户名</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">问题内容</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">时间</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">状态</th>' +
        '<th style="padding: 10px; border: 1px solid #ddd; text-align: left;">操作</th>' +
        '</tr>' +
        feedbacks.map(function(f) {
            const date = new Date(f.timestamp).toLocaleString('zh-CN');
            const statusText = f.status === 'pending' ? '待处理' : (f.status === 'resolved' ? '已处理' : '处理中');
            const statusColor = f.status === 'pending' ? '#f44336' : (f.status === 'resolved' ? '#4CAF50' : '#ff9800');
            return '<tr>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + f.name + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + f.email + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + (f.username || '未登录') + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + f.message + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' + date + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd; color: ' + statusColor + ';">' + statusText + '</td>' +
                '<td style="padding: 10px; border: 1px solid #ddd;">' +
                '<button onclick="viewFeedbackDetail(\'' + f.id + '\')" style="padding: 5px 10px; background-color: #2196F3; color: #fff; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">查看详情</button>' +
                '<button onclick="updateFeedbackStatus(\'' + f.id + '\', \'resolved\')" style="padding: 5px 10px; background-color: #4CAF50; color: #fff; border: none; border-radius: 3px; cursor: pointer;">标记已处理</button>' +
                '<button onclick="deleteFeedback(\'' + f.id + '\')" style="padding: 5px 10px; background-color: #f44336; color: #fff; border: none; border-radius: 3px; cursor: pointer;">删除</button>' +
                '</td>' +
                '</tr>';
        }).join('') +
        '</table>';
}

// 查看反馈详情
function viewFeedbackDetail(feedbackId) {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const feedback = feedbacks.find(f => f.id === feedbackId);
    
    if (!feedback) {
        alert('反馈不存在');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'feedback-detail-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="color: #ff7e5f; margin-bottom: 20px;">问题反馈详情</h3>
            <div style="margin-bottom: 15px;">
                <strong>姓名：</strong>${feedback.name}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>邮箱：</strong>${feedback.email}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>用户名：</strong>${feedback.username || '未登录用户'}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>提交时间：</strong>${new Date(feedback.timestamp).toLocaleString('zh-CN')}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>状态：</strong><span style="color: ${feedback.status === 'pending' ? '#f44336' : '#4CAF50'};">${feedback.status === 'pending' ? '待处理' : '已处理'}</span>
            </div>
            <div style="margin-bottom: 20px;">
                <strong>问题描述：</strong><br>
                <p style="margin-top: 10px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">${feedback.message}</p>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="updateFeedbackStatus('${feedback.id}', 'resolved')" style="padding: 8px 16px; background-color: #4CAF50; color: #fff; border: none; border-radius: 4px; cursor: pointer;">标记已处理</button>
                <button onclick="this.closest('.feedback-detail-modal').remove()" style="padding: 8px 16px; background-color: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 更新反馈状态
function updateFeedbackStatus(feedbackId, status) {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const updatedFeedbacks = feedbacks.map(f => {
        if (f.id === feedbackId) {
            return { ...f, status: status };
        }
        return f;
    });
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
    alert('状态已更新');
    loadFeedbacks();
    
    const modal = document.querySelector('.feedback-detail-modal');
    if (modal) {
        modal.remove();
    }
}

// 删除反馈
function deleteFeedback(feedbackId) {
    if (!confirm('确定要删除这条反馈吗？')) {
        return;
    }
    
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const updatedFeedbacks = feedbacks.filter(f => f.id !== feedbackId);
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
    alert('反馈已删除');
    loadFeedbacks();
}

// 捐赠者注册
function openDonorRegister() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="auth-modal-content" style="
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 25px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">注册为捐赠者</h3>
            <form class="auth-form" onsubmit="event.preventDefault(); handleDonorRegister(this)" style="display: flex; flex-direction: column; gap: 15px;">
                <input type="text" placeholder="姓名（2-20个字符）" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <input type="tel" placeholder="手机号（11位数字）" required pattern="^1[3-9]\d{9}$" style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <input type="password" placeholder="密码（6-20个字符）" required pattern="^.{6,20}$" style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <div class="form-group" style="margin-top: 10px;">
                    <label style="display: block; margin-bottom: 10px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">头像设置：</label>
                    <label style="margin-right: 20px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;"><input type="radio" name="avatar" value="default" checked> 使用默认头像</label>
                    <label style="font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;"><input type="radio" name="avatar" value="custom"> 自定义头像</label>
                    <input type="file" placeholder="上传头像" style="margin-top: 10px; display: none; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">
                </div>
                <button type="submit" style="
                    padding: 12px;
                    background-color: #ff7e5f;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    font-size: 14px;
                ">注册</button>
                <p style="text-align: center; margin-top: 15px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">
                    已有账号？ <a href="#" onclick="event.preventDefault(); openAuthModal('login')" style="color: #ff7e5f; text-decoration: none; font-family: 'Microsoft YaHei', Arial, sans-serif;">
                        立即登录
                    </a>
                </p>
            </form>
            <button onclick="this.closest('.auth-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 头像选择逻辑
    const avatarRadios = modal.querySelectorAll('input[name="avatar"]');
    const fileInput = modal.querySelector('input[type="file"]');
    avatarRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'custom') {
                fileInput.style.display = 'block';
            } else {
                fileInput.style.display = 'none';
            }
        });
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 受赠者注册
function openBeneficiaryRegister() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="auth-modal-content" style="
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 25px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">注册为受赠者</h3>
            <form class="auth-form" onsubmit="event.preventDefault(); handleBeneficiaryRegister(this)" style="display: flex; flex-direction: column; gap: 15px;">
                <input type="text" placeholder="姓名" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <input type="tel" placeholder="手机号" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <input type="text" placeholder="身份证号" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <input type="text" placeholder="快递点信息" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <textarea placeholder="详细情况说明" required style="min-height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: 'Microsoft YaHei', Arial, sans-serif; color: #333;"></textarea>
                <div class="form-group" style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">上传图片（可选，用于证明情况）</label>
                    <input type="file" id="beneficiary-image" accept="image/*" style="font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">
                    <div id="beneficiary-image-preview" style="max-width: 200px; max-height: 150px; border-radius: 6px; overflow: hidden; display: none;">
                        <img src="" alt="预览" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                </div>
                <input type="password" placeholder="设置密码" required style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                <button type="submit" style="
                    padding: 12px;
                    background-color: #ff7e5f;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    font-size: 14px;
                ">注册</button>
                <p style="text-align: center; margin-top: 15px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px;">
                    已有账号？ <a href="#" onclick="event.preventDefault(); openAuthModal('login')" style="color: #ff7e5f; text-decoration: none; font-family: 'Microsoft YaHei', Arial, sans-serif;">
                        立即登录
                    </a>
                </p>
            </form>
            <button onclick="this.closest('.auth-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 添加图片预览功能
    const imageInput = document.getElementById('beneficiary-image');
    const imagePreview = document.getElementById('beneficiary-image-preview');
    const previewImg = imagePreview.querySelector('img');
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImg.src = event.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 修改登录处理函数
async function handleLogin(form) {
    const username = form.querySelector('input[type="text"]').value;
    const password = form.querySelector('input[type="password"]').value;
    try {
        const user = await login(username, password);
        alert('登录成功！');
        form.closest('.auth-modal').remove();
        updateNavbar(); // 更新导航栏
    } catch (error) {
        alert(error.message);
    }
}

// 修改捐赠者注册处理函数
async function handleDonorRegister(form) {
    const username = form.querySelector('input[type="text"]').value;
    const phoneNumber = form.querySelector('input[type="tel"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // 表单验证
    if (!validateName(username)) {
        alert('请输入有效的姓名（2-20个字符，中文或英文）');
        return;
    }
    
    if (!validatePhone(phoneNumber)) {
        alert('请输入有效的11位手机号');
        return;
    }
    
    if (!validatePassword(password)) {
        alert('请输入有效的密码（6-20个字符）');
        return;
    }
    
    if (!isUsernameAvailable(username)) {
        alert('该用户名已被使用，请重新选择用户名');
        return;
    }
    
    try {
        const response = await fetch(API_URL + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: '',
                password: password,
                role: 'donor'
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert(result.message || '注册失败');
            return;
        }
        
        // 同时保存到本地存储
        userDatabase[phoneNumber] = {
            name: username,
            role: 'donor',
            password: password
        };
        saveUserDatabase();
        
        const mockUser = {
            _id: Date.now().toString(),
            username: username,
            role: 'donor'
        };
        localStorage.setItem('token', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        const avatarKey = 'avatar_' + username;
        localStorage.removeItem(avatarKey);
        
        alert('注册成功！');
        form.closest('.auth-modal').remove();
        updateNavbar();
    } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请稍后重试');
    }
}

// 修改受赠者注册处理函数
async function handleBeneficiaryRegister(form) {
    const username = form.querySelector('input[type="text"]').value;
    const phoneNumber = form.querySelector('input[type="tel"]').value;
    const idCard = form.querySelector('input[type="text"]:nth-of-type(3)').value;
    const address = form.querySelector('input[type="text"]:nth-of-type(4)').value;
    const description = form.querySelector('textarea').value;
    const password = form.querySelector('input[type="password"]').value;
    
    // 表单验证
    if (!validateName(username)) {
        alert('请输入有效的姓名（2-20个字符，中文或英文）');
        return;
    }
    
    if (!validatePhone(phoneNumber)) {
        alert('请输入有效的11位手机号');
        return;
    }
    
    if (!validateIdCard(idCard)) {
        alert('请输入有效的18位身份证号');
        return;
    }
    
    if (!validatePassword(password)) {
        alert('请输入有效的密码（6-20个字符）');
        return;
    }
    
    if (!isUsernameAvailable(username)) {
        alert('该用户名已被使用，请重新选择用户名');
        return;
    }
    
    if (!address || address.trim().length < 5) {
        alert('请输入详细的地址信息');
        return;
    }
    
    if (!description || description.trim().length < 10) {
        alert('请详细描述您的情况（至少10个字符）');
        return;
    }
    
    try {
        const response = await fetch(API_URL + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: '',
                password: password,
                role: 'beneficiary',
                phone: phoneNumber,
                idCard: idCard,
                address: address,
                description: description
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            alert(result.message || '注册失败');
            return;
        }
        
        // 同时保存到本地存储
        userDatabase[phoneNumber] = {
            name: username,
            role: 'beneficiary',
            password: password
        };
        saveUserDatabase();
        
        const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
        beneficiaries.push({
            _id: Date.now().toString(),
            username: username,
            phone: phoneNumber,
            idCard: idCard,
            address: address,
            description: description,
            isVerified: false,
            isReviewed: false,
            registeredAt: new Date().toISOString()
        });
        localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
        
        const mockUser = {
            _id: Date.now().toString(),
            username: username,
            role: 'beneficiary',
            isVerified: false,
            isReviewed: false,
            phone: phoneNumber,
            address: address,
            description: description
        };
        localStorage.setItem('token', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '{}');
        const messageKey = `admin_${username}`;
        
        if (!chatMessages[messageKey]) {
            chatMessages[messageKey] = [];
        }
        
        chatMessages[messageKey].push({
            sender: 'admin',
            message: '您的受赠者身份正在审核中，请耐心等待。',
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
        
        alert('注册成功！您的信息已提交审核，审核通过后即可成为受赠者用户。');
        form.closest('.auth-modal').remove();
        updateNavbar();
    } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请稍后重试');
    }
}

// 打开用户个人资料
function openUserProfile() {
    if (!checkLoginStatus()) {
        alert('请先登录');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    const modal = document.createElement('div');
    modal.className = 'user-profile-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="user-profile-content" style="
            background-color: #fff;
            padding: 25px;
            border-radius: 10px;
            max-width: 380px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 25px; color: #ff7e5f; font-size: 18px; font-weight: 600;">个人主页</h3>
            <div class="user-profile-info" style="margin-bottom: 20px;">
                <div class="avatar-circle" id="profile-avatar-circle" style="
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background-color: #ff7e5f;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    font-weight: bold;
                    font-family: 'Microsoft YaHei', Arial, sans-serif;
                    margin: 0 auto 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    overflow: hidden;
                ">${user.username.charAt(0).toUpperCase()}</div>
                <div style="
                    text-align: center;
                    margin-bottom: 20px;
                ">
                    <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                    <label for="avatar-upload" style="
                        cursor: pointer;
                        color: #ff7e5f;
                        font-family: 'Microsoft YaHei', Arial, sans-serif;
                        font-size: 14px;
                        text-decoration: underline;
                    ">更换头像</label>
                </div>
                <div class="user-details" style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; font-family: 'Microsoft YaHei', Arial, sans-serif;">昵称</label>
                        <input type="text" id="nickname-input" value="${user.username}" style="width: 100%; padding: 7px 10px; border: 1px solid #ddd; border-radius: 4px; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #333;">
                        <button onclick="handleNicknameChange()" style="
                            margin-top: 6px;
                            padding: 4px 12px;
                            background-color: #ff7e5f;
                            color: #fff;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: 'Microsoft YaHei', Arial, sans-serif;
                            font-size: 13px;
                        ">修改</button>
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; font-family: 'Microsoft YaHei', Arial, sans-serif;">角色</label>
                        <input type="text" value="${user.isAdmin ? '管理员' : user.role === 'donor' ? '捐赠者' : '受赠者'}" readonly style="width: 100%; padding: 7px 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; color: #666;">
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; font-family: 'Microsoft YaHei', Arial, sans-serif;">${user.role === 'beneficiary' ? '受赠记录' : '捐赠记录'}</label>
                        <button onclick="${user.role === 'beneficiary' ? 'openBenefitHistory()' : 'openDonationHistory()'}" style="
                            padding: 7px 14px;
                            background-color: #f9f9f9;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: 'Microsoft YaHei', Arial, sans-serif;
                            font-size: 13px;
                            color: #333;
                        ">查看${user.role === 'beneficiary' ? '受赠' : '捐赠'}记录</button>
                    </div>
                    <div class="form-group" style="margin-top: 15px;">
                        <button onclick="deleteAccount()" style="
                            padding: 7px 14px;
                            background-color: #fff;
                            border: 1px solid #f44336;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: 'Microsoft YaHei', Arial, sans-serif;
                            font-size: 13px;
                            color: #f44336;
                            width: 100%;
                        ">注销账号</button>
                    </div>
                </div>
            </div>
            <button onclick="this.closest('.user-profile-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 加载已保存的头像
    const avatarKey = 'avatar_' + user.username;
    const savedAvatar = localStorage.getItem(avatarKey);
    if (savedAvatar) {
        setTimeout(() => {
            const avatarCircle = document.getElementById('profile-avatar-circle');
            if (avatarCircle) {
                avatarCircle.style.backgroundImage = `url(${savedAvatar})`;
                avatarCircle.style.backgroundSize = 'cover';
                avatarCircle.style.backgroundPosition = 'center';
                avatarCircle.textContent = '';
            }
        }, 100);
    } else {
        // 确保显示默认头像
        setTimeout(() => {
            const avatarCircle = document.getElementById('profile-avatar-circle');
            if (avatarCircle) {
                avatarCircle.style.backgroundImage = 'none';
                avatarCircle.style.backgroundColor = '#ff7e5f';
                avatarCircle.style.color = '#fff';
                avatarCircle.textContent = user.username.charAt(0).toUpperCase();
            }
        }, 100);
    }
    
    // 绑定头像上传事件
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 处理昵称修改
function handleNicknameChange() {
    const nicknameInput = document.getElementById('nickname-input');
    const newNickname = nicknameInput.value.trim();
    if (newNickname) {
        const user = JSON.parse(localStorage.getItem('user'));
        const oldUsername = user.username;
        user.username = newNickname;
        localStorage.setItem('user', JSON.stringify(user));
        
        // 如果用户有头像，将头像从旧用户名键转移到新用户名键
        const oldAvatarKey = 'avatar_' + oldUsername;
        const newAvatarKey = 'avatar_' + newNickname;
        const avatarData = localStorage.getItem(oldAvatarKey);
        if (avatarData) {
            localStorage.setItem(newAvatarKey, avatarData);
            localStorage.removeItem(oldAvatarKey);
        }
        
        updateNavbar();
        alert('昵称修改成功！');
    }
}

// 处理头像上传
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarData = e.target.result;
            const user = JSON.parse(localStorage.getItem('user'));
            
            // 使用用户名作为头像存储的键，确保每个用户有独立的头像
            const avatarKey = 'avatar_' + user.username;
            localStorage.setItem(avatarKey, avatarData);
            
            // 从user对象中移除avatar属性，避免localStorage存储限制问题
            delete user.avatar;
            localStorage.setItem('user', JSON.stringify(user));
            
            updateUserProfileAvatar(avatarData);
            updateNavbarAvatar(avatarData);
            alert('头像修改成功！');
        };
        reader.readAsDataURL(file);
    }
}

// 更新用户个人资料页面的头像
function updateUserProfileAvatar(avatarData) {
    const avatarCircle = document.getElementById('profile-avatar-circle');
    if (avatarCircle) {
        avatarCircle.style.backgroundImage = `url(${avatarData})`;
        avatarCircle.style.backgroundSize = 'cover';
        avatarCircle.style.backgroundPosition = 'center';
        avatarCircle.textContent = '';
    }
}

// 更新导航栏的头像
function updateNavbarAvatar(avatarData) {
    const userAvatarElement = document.querySelector('.user-avatar-small');
    if (userAvatarElement) {
        userAvatarElement.style.backgroundImage = `url(${avatarData})`;
        userAvatarElement.style.backgroundSize = 'cover';
        userAvatarElement.style.backgroundPosition = 'center';
        userAvatarElement.textContent = '';
    }
}

// 打开消息中心
function openMessageCenter() {
    if (!checkLoginStatus()) {
        alert('请先登录');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    const modal = document.createElement('div');
    modal.className = 'message-center-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="message-center-content" style="
            background-color: #fff;
            padding: 25px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 25px; color: #ff7e5f; font-size: 18px; font-weight: 600;">消息中心</h3>
            <div id="message-list" style="margin-bottom: 20px;">
                ${loadUserMessages()}
            </div>
            <button onclick="this.closest('.message-center-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 加载用户消息
function loadUserMessages() {
    const user = JSON.parse(localStorage.getItem('user'));
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '{}');
    let messageHtml = '';
    const processedUsers = new Set();
    
    // 查找与当前用户相关的消息
    for (const [key, msgList] of Object.entries(messages)) {
        if (key.includes(user.username)) {
            const otherUser = key.split('_').find(name => name !== user.username);
            if (otherUser && !processedUsers.has(otherUser)) {
                // 标记该用户已处理
                processedUsers.add(otherUser);
                
                // 获取与该用户相关的所有消息
                let allMessages = [];
                // 检查两种可能的键格式
                const key1 = `${user.username}_${otherUser}`;
                const key2 = `${otherUser}_${user.username}`;
                
                if (messages[key1]) {
                    allMessages = allMessages.concat(messages[key1]);
                }
                if (messages[key2]) {
                    allMessages = allMessages.concat(messages[key2]);
                }
                
                // 按时间排序
                allMessages.sort((a, b) => {
                    return new Date(a.time) - new Date(b.time);
                });
                
                messageHtml += `
                    <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="color: #333;">与 ${otherUser} 的对话</h4>
                            <button onclick="deleteChatHistory('${user.username}', '${otherUser}')" style="
                                padding: 4px 10px;
                                background-color: #f44336;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 12px;
                            ">删除消息</button>
                        </div>
                        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                            ${allMessages.slice(-3).map(msg => `
                                <p style="margin: 5px 0; ${msg.sender === user.username ? 'text-align: right; color: #ff7e5f;' : 'text-align: left; color: #333;'}">
                                    ${msg.message}
                                </p>
                            `).join('')}
                        </div>
                        <button onclick="openChat('${otherUser}', '${otherUser}')" style="
                            padding: 6px 12px;
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">继续聊天</button>
                    </div>
                `;
            }
        }
    }
    
    if (!messageHtml) {
        messageHtml = '<p style="text-align: center; color: #666; padding: 40px 0;">暂无消息</p>';
    }
    
    return messageHtml;
}

// 删除聊天记录
function deleteChatHistory(user1, user2) {
    if (!confirm('确定要删除与 ' + user2 + ' 的所有聊天记录吗？此操作不可恢复。')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '{}');
    const key1 = `${user1}_${user2}`;
    const key2 = `${user2}_${user1}`;
    
    delete messages[key1];
    delete messages[key2];
    
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    
    alert('聊天记录已删除');
    // 刷新消息列表
    const messageList = document.getElementById('message-list');
    if (messageList) {
        messageList.innerHTML = loadUserMessages();
    }
}

// 打开捐赠记录
async function openDonationHistory() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录');
        return;
    }
    
    let donations = [];
    try {
        const response = await fetch(API_URL + '/api/auth/my-donations', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        donations = await response.json();
    } catch (error) {
        console.error('获取捐赠记录失败:', error);
    }
    
    const modal = document.createElement('div');
    modal.className = 'donation-history-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const donationItems = donations.length === 0 ? '<p style="text-align: center; padding: 30px; color: #666;">暂无捐赠记录</p>' : 
        donations.map(function(d) {
            const date = new Date(d.createdAt).toLocaleString('zh-CN');
            const amount = d.type === 'money' ? '¥' + d.amount : d.goods;
            const typeText = d.type === 'money' ? '金钱捐赠' : '物品捐赠';
            return '<div class="donation-item" style="padding: 15px; border-bottom: 1px solid #ddd; margin-bottom: 12px;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">' +
                '<h4 style="font-size: 14px; font-weight: 500; font-family: \'Microsoft YaHei\', Arial, sans-serif;">向 ' + (d.beneficiary ? d.beneficiary.username : '未知') + ' ' + typeText + '</h4>' +
                '<span style="color: #ff7e5f; font-weight: bold; font-size: 14px; font-family: \'Microsoft YaHei\', Arial, sans-serif;">' + amount + '</span>' +
                '</div>' +
                '<p style="color: #666; font-size: 13px; font-family: \'Microsoft YaHei\', Arial, sans-serif;">' + date + '</p>' +
                '</div>';
        }).join('');
    
    modal.innerHTML = `
        <div class="donation-history-content" style="
            background-color: #fff;
            padding: 25px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 20px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">捐赠记录</h3>
            <div class="donation-history-list" style="max-height: 350px; overflow-y: auto;">
                ${donationItems}
            </div>
            <button onclick="this.closest('.donation-history-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 打开受赠记录
async function openBenefitHistory() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录');
        return;
    }
    
    let benefits = [];
    try {
        const response = await fetch(API_URL + '/api/auth/my-benefits', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        benefits = await response.json();
    } catch (error) {
        console.error('获取受赠记录失败:', error);
    }
    
    const modal = document.createElement('div');
    modal.className = 'benefit-history-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const benefitItems = benefits.length === 0 ? '<p style="text-align: center; padding: 30px; color: #666;">暂无受赠记录</p>' : 
        benefits.map(function(b) {
            const date = new Date(b.createdAt).toLocaleString('zh-CN');
            const amount = b.type === 'money' ? '¥' + b.amount : b.goods;
            const typeText = b.type === 'money' ? '金钱捐赠' : '物品捐赠';
            return '<div class="benefit-item" style="padding: 15px; border-bottom: 1px solid #ddd; margin-bottom: 12px;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">' +
                '<h4 style="font-size: 14px; font-weight: 500; font-family: \'Microsoft YaHei\', Arial, sans-serif;">来自 ' + (b.donor ? b.donor.username : '未知') + ' 的 ' + typeText + '</h4>' +
                '<span style="color: #ff7e5f; font-weight: bold; font-size: 14px; font-family: \'Microsoft YaHei\', Arial, sans-serif;">' + amount + '</span>' +
                '</div>' +
                '<p style="color: #666; font-size: 13px; font-family: \'Microsoft YaHei\', Arial, sans-serif;">' + date + '</p>' +
                '</div>';
        }).join('');
    
    modal.innerHTML = `
        <div class="benefit-history-content" style="
            background-color: #fff;
            padding: 25px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 20px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">受赠记录</h3>
            <div class="benefit-history-list" style="max-height: 350px; overflow-y: auto;">
                ${benefitItems}
            </div>
            <button onclick="this.closest('.benefit-history-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 加载受赠者列表
async function loadBeneficiaries() {
    let beneficiaries = [];
    
    // 尝试从API加载
    try {
        const response = await fetch(API_URL + '/api/auth/beneficiaries');
        const apiBeneficiaries = await response.json();
        if (apiBeneficiaries && apiBeneficiaries.length > 0) {
            beneficiaries = beneficiaries.concat(apiBeneficiaries);
        }
    } catch (error) {
        console.log('API加载失败，使用本地数据');
    }
    
    // 加载本地存储的受赠者数据
    const localBeneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    if (localBeneficiaries.length > 0) {
        // 只添加已通过审核的受赠者
        const verifiedBeneficiaries = localBeneficiaries.filter(b => b.isVerified === true);
        beneficiaries = beneficiaries.concat(verifiedBeneficiaries);
    }
    
    const container = document.getElementById('beneficiary-list');
    if (!container) return;
    
    // 如果没有数据，显示默认提示
    if (beneficiaries.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">暂无受赠者信息</p>';
        return;
    }
    
    container.innerHTML = beneficiaries.map(function(b) {
        // 如果有自定义图片则使用，否则使用默认图片
        const imageSrc = b.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=poor%20person%20in%20rural%20area%2C%20realistic%20photo&image_size=portrait_4_3';
        return '<div class="beneficiary-item">' +
            '<div class="beneficiary-image">' +
            '<img src="' + imageSrc + '" alt="受赠者图片">' +
            '</div>' +
            '<div class="beneficiary-info">' +
            '<h3>' + b.username + '</h3>' +
            '<p class="beneficiary-need">需要援助：' + (b.description || '需要帮助') + '</p>' +
            '<p class="beneficiary-desc">' + (b.description || '暂无详细描述') + '</p>' +
            '<div class="beneficiary-contact">' +
            '<p><strong>电话：</strong>' + (b.phone ? b.phone.substring(0, 3) + '****' + b.phone.substring(7) : '未填写') + '</p>' +
            '<p><strong>地址：</strong>' + (b.address || '未填写') + '</p>' +
            '</div>' +
            '<a href="#" onclick="event.preventDefault(); openBeneficiaryDetailByData(' + JSON.stringify(b).replace(/"/g, '&quot;') + ')" class="donate-btn">捐赠</a>' +
            '</div>' +
            '</div>';
    }).join('');
}

// 通过数据打开受赠者详情页面
function openBeneficiaryDetailByData(beneficiary) {
    const data = {
        account: beneficiary.username,
        name: beneficiary.username,
        need: beneficiary.description || '需要帮助',
        contact: beneficiary.phone || '',
        address: beneficiary.address || '',
        desc: beneficiary.description || '暂无详细描述'
    };
    
    const detailPage = document.createElement('div');
    detailPage.className = 'beneficiary-detail';
    detailPage.innerHTML = `
        <div class="container">
            <div class="beneficiary-header">
                <div class="beneficiary-account">
                    <h3>${data.name} <button onclick="event.preventDefault(); openChat('${data.account}', '${data.name}')" style="
                        margin-left: 10px;
                        padding: 5px 12px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">发消息</button></h3>
                    <p>需要援助：${data.need}</p>
                </div>
            </div>
            
            <div class="beneficiary-detail-tabs">
                <button class="beneficiary-tab-btn active" onclick="switchBeneficiaryTab(this, 'money')">金钱捐赠</button>
                <button class="beneficiary-tab-btn" onclick="switchBeneficiaryTab(this, 'goods')">物品捐赠</button>
            </div>
            
            <div class="beneficiary-tab-content active" id="money">
                <form class="beneficiary-detail-form" onsubmit="event.preventDefault(); handleMoneyDonation(this, '${data.name}', '${beneficiary._id}')">
                    <div class="form-group">
                        <label>捐赠金额</label>
                        <input type="number" placeholder="请输入捐赠金额" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>支付方式</label>
                        <select required>
                            <option value="wechat">微信支付</option>
                            <option value="alipay">支付宝</option>
                            <option value="bank">银行卡</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">确认捐赠</button>
                </form>
            </div>
            
            <div class="beneficiary-tab-content" id="goods">
                <form class="beneficiary-detail-form" onsubmit="event.preventDefault(); handleGoodsDonation(this, '${data.name}', '${data.address}', '${beneficiary._id}')">
                    <div class="form-group">
                        <label>捐赠物品</label>
                        <input type="text" placeholder="请输入物品名称" required>
                    </div>
                    <div class="form-group">
                        <label>物品描述</label>
                        <textarea placeholder="请详细描述捐赠物品的情况" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>收货地址</label>
                        <input type="text" value="${data.address}" readonly>
                    </div>
                    <button type="submit" class="btn-primary">确认捐赠</button>
                </form>
            </div>
            
            <div class="beneficiary-detail-desc">
                <h3>详细情况说明</h3>
                <p>${data.desc}</p>
            </div>
        </div>
    `;
    
    const mainContent = document.querySelector('main') || document.body;
    mainContent.innerHTML = '';
    mainContent.appendChild(detailPage);
    
    const backButton = document.createElement('button');
    backButton.innerText = '返回';
    backButton.style.cssText = 'position: fixed; top: 110px; left: 20px; padding: 10px 20px; background: linear-gradient(135deg, #ff7e5f, #feb47b); color: #fff; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; z-index: 1000;';
    backButton.onclick = function() { location.reload(); };
    document.body.appendChild(backButton);
}

// 打开受赠者详情页面
function openBeneficiaryDetail(name) {
    // 模拟受赠者详情页面
    const beneficiaryData = {
        '李小明': {
            account: 'beneficiary_001',
            name: '李小明',
            need: '金钱（学费、生活费）、文具用品、书籍',
            contact: '138****5678',
            address: '贵州省毕节市威宁彝族回族苗族自治县中水镇邮政支局',
            desc: '李小明，12岁，来自贵州山区，家庭贫困，父母务农，收入微薄。他学习成绩优异，但因家庭经济困难，面临辍学风险。他希望能够继续上学，将来成为一名教师回报家乡。\n\n家庭情况：全家四口人，父母和一个 younger sister，居住在土坯房中，家中没有像样的家具和电器。父母靠种植玉米和土豆为生，年收入不足1万元。\n\n学习情况：在学校成绩排名前三，特别喜欢数学和英语，梦想成为一名教师。\n\n需要的帮助：学费、生活费、文具用品、书籍、保暖衣物。'
        },
        '王奶奶': {
            account: 'beneficiary_002',
            name: '王奶奶',
            need: '金钱（医疗费用）、营养品',
            contact: '139****1234',
            address: '河南省周口市太康县常营镇邮政支局',
            desc: '王奶奶，68岁，来自河南农村，患有慢性疾病，需要长期服药治疗。儿子在外打工，收入不稳定，无法承担高额医疗费用。她独自生活，生活困难，需要社会的帮助。\n\n健康情况：患有高血压、糖尿病等慢性疾病，需要长期服药。\n\n生活情况：独自居住在农村老宅，房屋破旧，基本生活设施简陋。\n\n需要的帮助：医疗费用、营养品、生活必需品。'
        },
        '张大山': {
            account: 'beneficiary_003',
            name: '张大山',
            need: '金钱（生活补贴）、轮椅、生活必需品',
            contact: '137****9876',
            address: '云南省昭通市鲁甸县龙头山镇邮政支局',
            desc: '张大山，45岁，来自云南农村，因意外事故导致下肢残疾，无法正常工作。妻子离家出走，留下他和两个未成年的孩子。他靠政府低保维持生活，生活非常困难。\n\n家庭情况：独自抚养两个孩子，一个10岁，一个8岁，都在上学。\n\n身体情况：下肢残疾，需要轮椅辅助行动。\n\n需要的帮助：生活补贴、轮椅、孩子的学费和文具、生活必需品。'
        }
    };
    
    const data = beneficiaryData[name];
    if (!data) return;
    
    // 创建详情页面
    const detailPage = document.createElement('div');
    detailPage.className = 'beneficiary-detail';
    detailPage.innerHTML = `
        <div class="container">
            <div class="beneficiary-header">
                <div class="beneficiary-account">
                    <h3><a href="#" onclick="event.preventDefault(); openBeneficiaryProfile('${data.account}', '${data.name}')">${data.name} (${data.account})</a></h3>
                    <p>需要援助：${data.need}</p>
                </div>
                <div class="beneficiary-contact-info">
                    <a href="#" onclick="event.preventDefault(); openChat('${data.account}', '${data.name}')">发消息</a>
                </div>
            </div>
            
            <div class="beneficiary-detail-tabs">
                <button class="beneficiary-tab-btn active" onclick="switchBeneficiaryTab(this, 'money')">金钱捐赠</button>
                <button class="beneficiary-tab-btn" onclick="switchBeneficiaryTab(this, 'goods')">物品捐赠</button>
            </div>
            
            <div class="beneficiary-tab-content active" id="money">
                <form class="beneficiary-detail-form" onsubmit="event.preventDefault(); handleMoneyDonation(this, '${data.name}')">
                    <div class="form-group">
                        <label>捐赠金额</label>
                        <input type="number" placeholder="请输入捐赠金额" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>支付方式</label>
                        <select required>
                            <option value="wechat">微信支付</option>
                            <option value="alipay">支付宝</option>
                            <option value="bank">银行卡</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-primary">确认捐赠</button>
                </form>
            </div>
            
            <div class="beneficiary-tab-content" id="goods">
                <form class="beneficiary-detail-form" onsubmit="event.preventDefault(); handleGoodsDonation(this, '${data.name}', '${data.address}')">
                    <div class="form-group">
                        <label>捐赠物品</label>
                        <input type="text" placeholder="请输入物品名称" required>
                    </div>
                    <div class="form-group">
                        <label>物品描述</label>
                        <textarea placeholder="请详细描述捐赠物品的情况" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>收货地址</label>
                        <input type="text" value="${data.address}" readonly>
                    </div>
                    <button type="submit" class="btn-primary">确认捐赠</button>
                </form>
            </div>
            
            <div class="beneficiary-detail-desc">
                <h3>详细情况说明</h3>
                <p>${data.desc}</p>
            </div>
        </div>
    `;
    
    // 替换当前内容
    const mainContent = document.querySelector('main') || document.body;
    mainContent.innerHTML = '';
    mainContent.appendChild(detailPage);
    
    // 添加返回按钮
    const backButton = document.createElement('button');
    backButton.innerText = '返回';
    backButton.style.cssText = `
        position: fixed;
        top: 110px;
        left: 20px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #ff7e5f, #feb47b);
        color: #fff;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
    `;
    backButton.onclick = function() {
        location.reload();
    };
    document.body.appendChild(backButton);
}

// 切换受赠者详情标签
function switchBeneficiaryTab(btn, tabId) {
    // 移除所有活动状态
    document.querySelectorAll('.beneficiary-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.beneficiary-tab-content').forEach(c => c.classList.remove('active'));
    
    // 添加当前活动状态
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// 处理金钱捐赠
async function handleMoneyDonation(form, beneficiaryName, beneficiaryId) {
    const amount = form.querySelector('input[type="number"]').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + '/api/auth/donations', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ 
                beneficiaryId: beneficiaryId, 
                amount: amount, 
                type: 'money' 
            })
        });
        
        if (response.ok) {
            alert('捐赠成功！感谢您的爱心！');
            openInvoiceCertificateModal();
        } else {
            alert('捐赠失败，请稍后重试');
        }
    } catch (error) {
        alert('捐赠成功！感谢您的爱心！（离线模式）');
        openInvoiceCertificateModal();
    }
}

// 处理物品捐赠
async function handleGoodsDonation(form, beneficiaryName, address, beneficiaryId) {
    const goods = form.querySelector('input[type="text"]').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + '/api/auth/donations', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ 
                beneficiaryId: beneficiaryId, 
                type: 'goods',
                goods: goods 
            })
        });
        
        if (response.ok) {
            alert('捐赠成功！感谢您的爱心！');
            openInvoiceCertificateModal();
        } else {
            alert('捐赠失败，请稍后重试');
        }
    } catch (error) {
        alert('捐赠成功！感谢您的爱心！（离线模式）');
        openInvoiceCertificateModal();
    }
}

// 发票和证书模态框
function openInvoiceCertificateModal() {
    const modal = document.createElement('div');
    modal.className = 'invoice-certificate-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="invoice-certificate-content" style="
            background-color: #fff;
            padding: 40px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
        ">
            <h3 style="text-align: center; margin-bottom: 30px; color: #ff7e5f;">发票和证书</h3>
            <div class="invoice-certificate-options" style="margin-bottom: 30px;">
                <label style="display: block; margin-bottom: 10px;"><input type="checkbox" name="invoice"> 需要开具发票</label>
                <label style="display: block;"><input type="checkbox" name="certificate"> 需要捐赠证书</label>
            </div>
            <button class="btn-primary" onclick="handleInvoiceCertificate(this)" style="
                width: 100%;
                padding: 15px;
                background-color: #ff7e5f;
                color: #fff;
                border: none;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            ">确定</button>
            <button onclick="this.closest('.invoice-certificate-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 处理发票和证书
function handleInvoiceCertificate(btn) {
    const modal = btn.closest('.invoice-certificate-modal');
    const invoiceChecked = modal.querySelector('input[name="invoice"]').checked;
    const certificateChecked = modal.querySelector('input[name="certificate"]').checked;
    
    if (invoiceChecked) {
        alert('发票已生成，将发送到您的邮箱。');
    }
    if (certificateChecked) {
        alert('捐赠证书已生成，您可以在个人中心查看。');
    }
    
    modal.remove();
}

// 打开聊天窗口
function openChat(account, name) {
    if (!checkLoginStatus()) {
        alert('请先登录');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('user')).username;
    const chatKey = `${currentUser}_${account}`;
    
    // 检查是否已经有打开的聊天窗口
    const existingModal = document.querySelector(`.chat-modal[data-chat-with="${account}"]`);
    if (existingModal) {
        // 如果已经有打开的聊天窗口，聚焦到该窗口
        existingModal.style.zIndex = '10001';
        setTimeout(() => {
            existingModal.style.zIndex = '10000';
        }, 100);
        return;
    }
    
    // 确保聊天记录存在（不添加自动回复消息）
    if (!chatMessages[chatKey]) {
        chatMessages[chatKey] = [];
        saveChatMessages();
    }
    
    // 创建聊天模态框
    const chatModal = document.createElement('div');
    chatModal.className = 'chat-modal';
    chatModal.setAttribute('data-chat-with', account);
    chatModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    chatModal.innerHTML = `
        <div class="chat-modal-content" style="
            background-color: #fff;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            height: 80%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        ">
            <div class="chat-modal-header" style="
                padding: 20px;
                border-bottom: 1px solid #ddd;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h3>与 ${name} 聊天</h3>
                <button class="chat-modal-close" onclick="this.closest('.chat-modal').remove()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages-${account}" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background-color: #f9f9f9;
            ">
                ${chatMessages[chatKey].map(msg => {
                    if (msg.type === 'image') {
                        return `<div class="message ${msg.sender === currentUser ? 'sent' : 'received'}" style="
                            max-width: 70%;
                            margin-bottom: 15px;
                            padding: 10px;
                            border-radius: 18px;
                        ">
                            <img src="${msg.content}" alt="图片消息" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                            <div class="message-time" style="
                                font-size: 12px;
                                color: #999;
                                margin-top: 5px;
                                text-align: ${msg.sender === currentUser ? 'right' : 'left'};
                            ">${msg.time}</div>
                        </div>`;
                    } else if (msg.type === 'video') {
                        return `<div class="message ${msg.sender === currentUser ? 'sent' : 'received'}" style="
                            max-width: 70%;
                            margin-bottom: 15px;
                            padding: 10px;
                            border-radius: 18px;
                        ">
                            <video src="${msg.content}" controls style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                                您的浏览器不支持视频播放
                            </video>
                            <div class="message-time" style="
                                font-size: 12px;
                                color: #999;
                                margin-top: 5px;
                                text-align: ${msg.sender === currentUser ? 'right' : 'left'};
                            ">${msg.time}</div>
                        </div>`;
                    } else {
                        return `<div class="message ${msg.sender === currentUser ? 'sent' : 'received'}" style="
                            max-width: 70%;
                            margin-bottom: 15px;
                            padding: 10px 15px;
                            border-radius: 18px;
                        ">
                            <p style="margin: 0;">${msg.message}</p>
                            <div class="message-time" style="
                                font-size: 12px;
                                color: #999;
                                margin-top: 5px;
                                text-align: ${msg.sender === currentUser ? 'right' : 'left'};
                            ">${msg.time}</div>
                        </div>`;
                    }
                }).join('')}
            </div>
            <div class="chat-input-area" style="
                padding: 20px;
                border-top: 1px solid #ddd;
                display: flex;
                gap: 10px;
                align-items: center;
            ">
                <label class="chat-attach-btn" style="
                    padding: 10px;
                    background-color: #f0f0f0;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                ">📎
                    <input type="file" class="chat-attach-input" accept="image/*,video/*" style="display: none;" onchange="handleChatFileSelect(this, '${account}')">
                </label>
                <input type="text" class="chat-input" placeholder="输入消息..." style="
                    flex: 1;
                    padding: 10px 15px;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    font-size: 16px;
                ">
                <button class="chat-send-btn" onclick="sendChatMessage(this, '${account}', '${name}')" style="
                    padding: 10px 20px;
                    background-color: #ff7e5f;
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                ">发送</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(chatModal);
    
    // 滚动到底部
    const messagesContainer = chatModal.querySelector('.chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 发送聊天消息
function sendChatMessage(button, account, name) {
    const chatModal = button.closest('.chat-modal');
    const input = chatModal.querySelector('.chat-input');
    const messagesContainer = chatModal.querySelector('.chat-messages');
    const message = input.value.trim();
    
    if (message) {
        const currentUser = JSON.parse(localStorage.getItem('user')).username;
        const chatKey = `${currentUser}_${account}`;
        const reverseChatKey = `${account}_${currentUser}`;
        
        // 添加消息到聊天窗口
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.style.cssText = `
            max-width: 70%;
            margin-left: auto;
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 18px;
            background-color: #ff7e5f;
            color: #fff;
        `;
        messageElement.innerHTML = `
            <p style="margin: 0;">${message}</p>
            <div class="message-time" style="
                font-size: 12px;
                color: rgba(255,255,255,0.8);
                margin-top: 5px;
                text-align: right;
            ">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // 保存消息到本地存储（双向存储，确保同步）
        if (!chatMessages[chatKey]) {
            chatMessages[chatKey] = [];
        }
        if (!chatMessages[reverseChatKey]) {
            chatMessages[reverseChatKey] = [];
        }
        
        const messageData = {
            sender: currentUser,
            receiver: account,
            message: message,
            time: new Date().toLocaleTimeString()
        };
        
        chatMessages[chatKey].push(messageData);
        chatMessages[reverseChatKey].push(messageData);
        
        saveChatMessages();
        
        // 清空输入框
        input.value = '';
    }
}

// 处理聊天文件选择
function handleChatFileSelect(input, account) {
    const file = input.files[0];
    if (!file) return;
    
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
        alert('请选择图片或视频文件');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = e.target.result;
        sendChatFile(account, fileData, fileType);
    };
    reader.readAsDataURL(file);
    
    // 清空文件输入
    input.value = '';
}

// 发送文件消息
function sendChatFile(account, fileData, fileType) {
    const currentUser = JSON.parse(localStorage.getItem('user')).username;
    const chatKey = `${currentUser}_${account}`;
    const reverseChatKey = `${account}_${currentUser}`;
    
    // 获取聊天模态框
    const chatModal = document.querySelector(`.chat-modal[data-chat-with="${account}"]`);
    const messagesContainer = chatModal ? chatModal.querySelector('.chat-messages') : null;
    
    // 显示文件消息
    if (messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        messageElement.style.cssText = `
            max-width: 70%;
            margin-left: auto;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 18px;
            background-color: #ff7e5f;
        `;
        
        if (fileType === 'image') {
            messageElement.innerHTML = `
                <img src="${fileData}" alt="图片消息" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <div class="message-time" style="
                    font-size: 12px;
                    color: rgba(255,255,255,0.8);
                    margin-top: 5px;
                    text-align: right;
                ">${new Date().toLocaleTimeString()}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <video src="${fileData}" controls style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                    您的浏览器不支持视频播放
                </video>
                <div class="message-time" style="
                    font-size: 12px;
                    color: rgba(255,255,255,0.8);
                    margin-top: 5px;
                    text-align: right;
                ">${new Date().toLocaleTimeString()}</div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 保存消息到本地存储（双向存储，确保同步）
    if (!chatMessages[chatKey]) {
        chatMessages[chatKey] = [];
    }
    if (!chatMessages[reverseChatKey]) {
        chatMessages[reverseChatKey] = [];
    }
    
    const messageData = {
        sender: currentUser,
        receiver: account,
        type: fileType,
        content: fileData,
        time: new Date().toLocaleTimeString()
    };
    
    chatMessages[chatKey].push(messageData);
    chatMessages[reverseChatKey].push(messageData);
    
    saveChatMessages();
}

// 打开受赠者个人资料
function openBeneficiaryProfile(account, name) {
    const modal = document.createElement('div');
    modal.className = 'beneficiary-profile-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    modal.innerHTML = `
        <div class="beneficiary-profile-content" style="
            background-color: #fff;
            padding: 25px;
            border-radius: 10px;
            max-width: 380px;
            width: 90%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25);
            position: relative;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            color: #333;
        ">
            <h3 style="text-align: center; margin-bottom: 20px; color: #ff7e5f; font-size: 18px; font-weight: 600; font-family: 'Microsoft YaHei', Arial, sans-serif;">受赠者资料</h3>
            <div class="beneficiary-profile-info" style="margin-bottom: 20px;">
                <div class="beneficiary-account-info" style="margin-bottom: 15px;">
                    <h4 style="font-size: 14px; font-weight: 500; margin-bottom: 10px; font-family: 'Microsoft YaHei', Arial, sans-serif;">账号信息</h4>
                    <p style="margin-bottom: 8px; font-size: 14px; font-family: 'Microsoft YaHei', Arial, sans-serif;"><strong>账号：</strong>${account}</p>
                    <p style="margin-bottom: 8px; font-size: 14px; font-family: 'Microsoft YaHei', Arial, sans-serif;"><strong>姓名：</strong>${name}</p>
                </div>
                <div class="beneficiary-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="openChat('${account}', '${name}')" style="
                        padding: 8px 16px;
                        background-color: #ff7e5f;
                        color: #fff;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-family: 'Microsoft YaHei', Arial, sans-serif;
                        font-size: 13px;
                    ">发送消息</button>
                    <button onclick="this.closest('.beneficiary-profile-modal').remove()" style="
                        padding: 8px 16px;
                        background-color: #f9f9f9;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        cursor: pointer;
                        font-family: 'Microsoft YaHei', Arial, sans-serif;
                        font-size: 13px;
                        color: #333;
                    ">关闭</button>
                </div>
            </div>
            <button onclick="this.closest('.beneficiary-profile-modal').remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #666;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
            ">&times;</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
