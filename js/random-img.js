document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('banner');
    if (!banner) return;
  
    // 配置项（可按需修改）
    const config = {
      debounceTime: 300,    // 防抖时间(ms)
      maxRetry: 1,          // 最大重试次数
      cacheBuster: true,    // 启用缓存清理
      transition: '1s ease' // 背景过渡动画
    };
  
    // API列表
    const APIs = [
      // 参考https://zichen.zone/archives/acg-api.html
      // 横图
      'https://api.mtyqx.cn/api/random.php',
      'https://api.r10086.com/樱道随机图片api接口.php?图片系列=动漫综合2',
      'https://api.tomys.top/api/acgimg',
      'https://www.loliapi.com/acg/pc/',
      'https://t.alcy.cc/pc',
      'https://t.alcy.cc/moe',
      // 自适应
      'https://www.loliapi.com/acg/',
      'https://t.alcy.cc/ycy',
      'https://t.alcy.cc/moez',
      // 竖图
      'https://www.loliapi.com/acg/pe/',
      'https://t.alcy.cc/moemp',
      'https://t.alcy.cc/mp'
      
    ];
  
    // 状态管理
    let currentLoader = null;
    let retryCount = 0;
    let isPortrait = checkOrientation();
  
    // 智能选择API
    function selectAPI() {
      return isPortrait ? APIs.slice(-6) : APIs.slice(0, 9);
    }
  
    // 方向检测
    function checkOrientation() {
      return window.matchMedia("(orientation: portrait)").matches;
    }
  
    // 防抖函数
    function debounce(fn, delay) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  
    // 设置背景（带过渡动画）
    function setBackground(url) {
      banner.style.transition = `background-image ${config.transition}`;
      banner.style.backgroundImage = `url('${url}')`;
    }
  
    // 加载新图片
    function loadNewImage() {
      if (currentLoader) {
        currentLoader.onload = null;
        currentLoader.onerror = null;
      }
  
      const apiPool = selectAPI();
      const randomAPI = apiPool[Math.floor(Math.random() * apiPool.length)];
      const finalURL = config.cacheBuster 
        ? `${randomAPI}?r=${Date.now()}`
        : randomAPI;
  
      currentLoader = new Image();
      currentLoader.onload = () => {
        retryCount = 0;
        setBackground(finalURL);
      };
      currentLoader.onerror = () => {
        if (retryCount < config.maxRetry) {
          retryCount++;
          loadNewImage();
        } else {
          setBackground(theme.banner.default_bg);
        }
      };
      currentLoader.src = finalURL;
    }
  
    // 方向变化处理
    const handleOrientationChange = debounce(() => {
      const newOrientation = checkOrientation();
      if (newOrientation !== isPortrait) {
        isPortrait = newOrientation;
        loadNewImage();
      }
    }, config.debounceTime);
  
    // 事件监听
    window.addEventListener('resize', handleOrientationChange);
    
    // 清理监听（防止内存泄漏）
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('resize', handleOrientationChange);
    });
  
    // 初始化加载
    loadNewImage();
  });