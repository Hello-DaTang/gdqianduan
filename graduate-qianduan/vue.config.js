const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 7000, // 修改为7000端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 后端服务器地址保持8080
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})
