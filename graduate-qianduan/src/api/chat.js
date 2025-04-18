import request from '@/utils/request'
import { getToken } from '@/utils/auth'

// 调用大模型获取智能回复
export function getAiResponse(prompt) {
  return request({
    url: '/chat',
    method: 'get',
    params: { prompt }
  })
}

// 调用流式大模型获取智能回复
export function getChatStreamWithHistory(prompt, sessionID) {
  // 从auth.js获取token
  const token = getToken()
  
  // 创建一个可控的流式响应处理器
  const controller = new AbortController()
  const { signal } = controller
  
  // 使用fetch API替代EventSource
  const fetchStream = async (onMessage, onError, onComplete) => {
    try {
      const response = await fetch(
        `http://localhost:8080/chatStream/history?prompt=${encodeURIComponent(prompt)}&sessionID=${encodeURIComponent(sessionID || '')}`, 
        {
          headers: {
            'token': token || '',
            'Accept': 'text/event-stream'
          },
          signal
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      // 获取响应的reader
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      // 读取流数据 - 禁用ESLint警告，因为处理流数据需要循环直到完成
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete && onComplete()
          break
        }
        
        // 解码并处理数据
        const text = decoder.decode(value)
        console.log('原始响应数据:', text) // 添加调试日志查看实际返回数据
        
        // 更灵活的数据处理逻辑，处理不同格式的返回
        const lines = text.split('\n')
        
        lines.forEach(line => {
          // 检查是否为SSE格式数据（以data:开头）
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim()
            if (data && data !== '[DONE]') {
              onMessage && onMessage(data)
            }
          } 
          // 如果不是SSE格式但有内容，也尝试处理
          else if (line.trim()) {
            onMessage && onMessage(line.trim())
          }
        })
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted')
      } else {
        console.error('Stream error:', error)
        onError && onError(error)
      }
    }
  }
  
  return {
    fetch: fetchStream,
    close() {
      controller.abort()
    }
  }
}