// 示例新文件
// 这个文件演示了如何在项目中添加新文件

function exampleFunction() {
  console.log('这是一个示例函数');
  return 'Hello from new file!';
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { exampleFunction };
}
