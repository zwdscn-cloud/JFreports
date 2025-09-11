// 简单的性能测试脚本
console.log("开始测试拖动性能...");

// 模拟鼠标移动事件来测试性能
function simulateMouseMove() {
  const startTime = performance.now();
  let count = 0;
  
  // 模拟100次鼠标移动
  const interval = setInterval(() => {
    if (count >= 100) {
      clearInterval(interval);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      console.log(`完成100次鼠标移动模拟，耗时: ${totalTime.toFixed(2)}ms`);
      console.log(`平均每帧: ${(totalTime / 100).toFixed(2)}ms`);
      return;
    }
    
    // 模拟鼠标移动事件
    const event = new MouseEvent('mousemove', {
      clientX: Math.random() * 1000,
      clientY: Math.random() * 1000
    });
    
    // 这里可以添加实际的性能测试逻辑
    count++;
  }, 16); // 约60fps
}

// 运行测试
simulateMouseMove();
