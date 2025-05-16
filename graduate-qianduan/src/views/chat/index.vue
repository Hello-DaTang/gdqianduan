<template>
    <div class="modern-page-container">
      <!-- 波浪背景动画 -->
      <div class="wave-container">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>
      
      <!-- 使用各个数据提供者组件 -->
      <device-data-provider ref="deviceProviderRef">
        <weather-data-provider ref="weatherProviderRef">
          <log-data-provider ref="logProviderRef">
            <div class="chat-container">
              <div class="chat-layout">
                <!-- 左侧边栏 -->
                <div class="chat-sidebar">
                  <div class="sidebar-header">
                    <div class="logo-container">
                      <img src="@/assets/images/login/logo.png" alt="Logo" class="mini-logo">
                      <h2>智能助手</h2>
              </div>
              <el-button type="primary" class="new-chat-btn" size="small" @click="startNewChat">
                <i class="el-icon-plus"></i>
                新对话
              </el-button>
            </div>
            
            <div class="history-list">
              <div v-for="(chat, index) in chatHistory" :key="index" 
                   class="history-item" 
                   :class="{ active: currentChatIndex === index }"
                   @click="selectChat(index)">
                <div class="history-icon">
                  <i class="el-icon-chat-dot-round"></i>
                </div>
                <div class="history-content">
                  <div class="history-title">{{ chat.title }}</div>
                  <div class="history-time">{{ chat.time }}</div>
                </div>
                <div class="history-actions">
                  <i class="el-icon-delete" @click.stop="deleteChat(index)"></i>
                </div>
              </div>
            </div>
            
            <div class="sidebar-footer">
              <div class="assistant-info">
                <div class="assistant-avatar">AI</div>
                <div class="assistant-name">智能助手</div>
              </div>
              <el-dropdown trigger="click" size="small">
                <i class="el-icon-more"></i>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>设置</el-dropdown-item>
                    <el-dropdown-item>查看帮助</el-dropdown-item>
                    <el-dropdown-item divided>关于</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <!-- 聊天主界面 -->
          <div class="chat-main">
            <div class="chat-header">
              <div class="current-chat-info">
                <h3>{{ currentChat ? currentChat.title : '新对话' }}</h3>
                <span class="chat-status">
                  <span class="status-dot"></span>
                  在线
                </span>
              </div>
              <div class="chat-actions">
                <el-button size="small" type="text" icon="el-icon-refresh" class="refresh-btn">刷新</el-button>
              </div>
            </div>
            
            <div class="chat-messages" ref="chatMessagesRef">
              <template v-if="!currentChat.messages || currentChat.messages.length === 0">
                <div class="welcome-container">
                  <div class="welcome-icon">
                    <i class="el-icon-service"></i>
                  </div>
                  <h2 class="welcome-title">欢迎使用智能助手</h2>
                  <p class="welcome-text">我可以帮您控制家中的设备，查询天气，或者回答您关于家居的问题</p>
                  <div class="suggestion-chips">
                    <div class="suggestion-chip" @click="useExample('打开客厅灯')">
                      <i class="el-icon-lightbulb"></i>
                      <span>打开客厅灯</span>
                    </div>
                    <div class="suggestion-chip" @click="useExample('今天天气如何')">
                      <i class="el-icon-partly-cloudy"></i>
                      <span>今天天气如何</span>
                    </div>
                    <div class="suggestion-chip" @click="useExample('调低卧室空调温度')">
                      <i class="el-icon-cold"></i>
                      <span>调低卧室空调温度</span>
                    </div>
                  </div>
                </div>
              </template>
              
              <template v-else>
                <div 
                  v-for="(message, index) in currentChat.messages" 
                  :key="index" 
                  :class="['message', message.type === 'user' ? 'user-message' : 'assistant-message']"
                >
                  <div class="message-avatar">
                    <div v-if="message.type === 'user'" class="user-avatar">
                      <i class="el-icon-user"></i>
                    </div>
                    <div v-else class="assistant-avatar">
                      <i class="el-icon-service"></i>
                    </div>
                  </div>
                  
                  <div class="message-content">                    <div class="message-header">
                      <span class="message-sender">{{ message.type === 'user' ? '您' : '智能助手' }}</span>
                      <span class="message-time">{{ message.time }}</span>
                    </div>
                    <div class="message-body">
                      <div v-if="message.type === 'assistant'" v-html="getFormattedContent(message)"></div>
                      <div v-else>{{ message.content }}</div>
                    </div>
                    
                    <div v-if="message.type === 'assistant'" class="message-actions">
                      <el-button type="text" size="small" icon="el-icon-copy-document" @click="copyMessageContent(message.content)">复制</el-button>
                      <el-button type="text" size="small" icon="el-icon-refresh" @click="regenerateResponse(message)" :disabled="loading">重新生成</el-button>
                    </div>
                  </div>
                </div>
                
                <div v-if="loading" class="typing-indicator">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </template>
            </div>
            
            <div class="chat-input-container">
              <div class="input-wrapper">
                <el-input
                  v-model="userInput"
                  type="textarea"
                  :rows="2"
                  placeholder="输入您的问题..."
                  :disabled="loading"
                  resize="none"
                  @keydown.enter.prevent="sendMessage"
                ></el-input>
                
                <div class="input-actions">
                  <el-button
                    circle
                    type="primary"
                    :icon="loading ? 'el-icon-loading' : 'el-icon-s-promotion'"
                    :disabled="!userInput.trim() || loading"
                    @click="sendMessage"
                    class="send-button"
                  ></el-button>
                </div>
              </div>
              
              <div class="input-info">
                <span>Shift + Enter 换行</span>
              </div>            </div>
          </div>            </div>
          </div>
        </log-data-provider>
      </weather-data-provider>
    </device-data-provider>
  </div>
</template>  
  <script>
  import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
  import { getChatStreamWithHistory } from '@/api/chat'
  import { ElMessage } from 'element-plus'
  import DeviceDataProvider from '@/components/data/DeviceDataProvider.vue'
  import WeatherDataProvider from '@/components/data/WeatherDataProvider.vue'
  import LogDataProvider from '@/components/data/LogDataProvider.vue'
  
  export default {
    name: 'ChatView',
    components: {
      DeviceDataProvider,
      WeatherDataProvider,
      LogDataProvider
    },    setup() {
      const userInput = ref('')
      const loading = ref(false)
      const chatMessagesRef = ref(null)
      const currentChatIndex = ref(0)
      
      // 引用数据提供者组件
      const deviceProviderRef = ref(null)
      const weatherProviderRef = ref(null)
      const logProviderRef = ref(null)
      
      // 添加会话ID和当前流连接变量
      const sessionID = ref('')
      let currentStreamConnection = null

      // 聊天历史记录
      const chatHistory = ref([
        {
          id: 1,
          title: '新对话',
          time: formatTime(new Date()),
          messages: [
            { 
              type: 'assistant', 
              content: '您好！我是您的智能家居助手。我可以帮您控制家中的设备，查询天气，或者回答您关于家居的问题。请问有什么可以帮您的吗？',
              time: formatTime(new Date())
            }
          ]
        }
      ])
      
      // 获取当前聊天记录
      const currentChat = computed(() => {
        return chatHistory.value[currentChatIndex.value] || { messages: [] }
      })
      
      // 格式化日期时间
      function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
      }
  
      // 简化Markdown格式化函数
      const formatMarkdown = (text) => {
        if (!text) return ''
        if (typeof text !== 'string') {
          return String(text)
        }
        
        return text
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
          .replace(/\*(.*)\*/gm, '<em>$1</em>')
          .replace(/- (.*)/gm, '<li>$1</li>')
          .replace(/\n/gm, '<br />')
      }      
      // 消息内容，支持Markdown格式化
      const getFormattedContent = (message) => {
        // 检查消息是否为对象且有内容
        if (!message || !message.content) return ''
        
        // 如果是助手消息，格式化为Markdown
        if (message.type === 'assistant') {
          return formatMarkdown(message.content)
        }
        
        // 用户消息保持原样
        return message.content
      }
      // 修改发送消息方法，使用流式接口
      const sendMessage = async () => {
        if (!userInput.value.trim() || loading.value) return
        
        // 添加用户消息
        chatHistory.value[currentChatIndex.value].messages.push({ 
          type: 'user', 
          content: userInput.value,
          time: formatTime(new Date())
        })
        
        // 如果是第一条消息，更新对话标题
        if (chatHistory.value[currentChatIndex.value].messages.length === 2) {
          chatHistory.value[currentChatIndex.value].title = userInput.value.slice(0, 20) + (userInput.value.length > 20 ? '...' : '')
        }
        
        // 滚动到底部
        await nextTick()
        scrollToBottom()
        
        // 记录当前输入并清空输入框
        const currentInput = userInput.value.trim()
        userInput.value = ''
        loading.value = true
        
        // 生成或获取会话ID（使用对话ID作为会话ID）
        if (!sessionID.value) {
          sessionID.value = `chat-${currentChat.value.id}-${Date.now()}`
        }
        
        // 先添加一个空的助手回复，用于流式更新
        chatHistory.value[currentChatIndex.value].messages.push({ 
          type: 'assistant', 
          content: '',
          time: formatTime(new Date())
        })
        
        try {
          // 确保没有活跃的连接
          if (currentStreamConnection) {
            currentStreamConnection.close()
            currentStreamConnection = null
          }

          // 准备上下文数据
          const contextData = {}
          
          // 获取设备数据
          if (deviceProviderRef.value && deviceProviderRef.value.fetchDevices) {
            try {
              const deviceData = await deviceProviderRef.value.fetchDevices()
              if (deviceData && deviceData.length > 0) {
                contextData.devices = deviceData
                console.log('已收集设备数据:', deviceData.length)
              }
            } catch (error) {
              console.error('获取设备数据失败:', error)
              ElMessage.warning('设备数据获取失败，可能影响智能助手的设备控制功能')
            }
          }
          
          // 获取天气数据
          if (weatherProviderRef.value && weatherProviderRef.value.fetchWeather) {
            try {
              const weatherData = await weatherProviderRef.value.fetchWeather()
              if (weatherData) {
                contextData.weather = weatherData
                console.log('已收集天气数据')
              }
            } catch (error) {
              console.error('获取天气数据失败:', error)
              ElMessage.warning('天气数据获取失败，可能影响智能助手的天气查询功能')
            }
          }
            // 获取操作日志数据
          if (logProviderRef.value && logProviderRef.value.fetchLogs) {
            try {
              const logData = await logProviderRef.value.fetchLogs()
              // 确保日志数据是有效的数组
              if (logData && Array.isArray(logData) && logData.length > 0) {
                contextData.operateLogs = logData
                console.log('已收集操作日志数据:', logData.length)
              } else {
                console.log('操作日志数据为空或非数组，跳过添加到上下文')
              }
            } catch (error) {
              console.error('获取操作日志数据失败:', error)
              ElMessage.warning('操作日志获取失败，可能影响智能助手的操作记录查询功能')
            }
          }
          
          // 获取最后添加的消息的引用
          const lastMessageIndex = chatHistory.value[currentChatIndex.value].messages.length - 1
          let responseContent = ''
          
          // 打印上下文数据大小，检查是否过大
          const contextSize = JSON.stringify(contextData).length
          console.log(`上下文数据大小: ${contextSize} 字节`)
          
          // 如果上下文过大，可以进行优化，例如限制操作日志条数
          if (contextSize > 1000000) { // 大于1MB
            console.warn('上下文数据过大，正在优化...')
            if (contextData.operateLogs && contextData.operateLogs.length > 20) {
              contextData.operateLogs = contextData.operateLogs.slice(0, 20)
            }
          }
          
          // 建立新的流式连接，传入上下文数据
          currentStreamConnection = getChatStreamWithHistory(currentInput, sessionID.value, contextData)
          
          // 开始获取流数据
          currentStreamConnection.fetch(
            // onMessage 回调
            (data) => {
              console.log('收到消息数据片段') // 避免记录可能太大的数据
              // 累积内容
              responseContent += data
              
              // 更新聊天消息内容
              chatHistory.value[currentChatIndex.value].messages[lastMessageIndex].content = responseContent
              
              // 滚动到底部
              nextTick(scrollToBottom)
            },
            // onError 回调
            (error) => {
              console.error('流式响应错误:', error)
              loading.value = false
              
              // 如果没有内容返回，添加错误消息
              if (!responseContent) {
                chatHistory.value[currentChatIndex.value].messages[lastMessageIndex].content = 
                  '很抱歉，我遇到了问题，无法回复您的问题。请检查网络连接或稍后再试。'
                ElMessage.error('连接服务器失败，请检查网络')
              }
            },
            // onComplete 回调
            () => {
              console.log('流式响应完成')
              loading.value = false
              currentStreamConnection = null
              
              // 如果响应内容为空，说明出现了问题
              if (!responseContent.trim()) {
                chatHistory.value[currentChatIndex.value].messages[lastMessageIndex].content = 
                  '很抱歉，我没有收到有效的回复。请稍后再试。'
                ElMessage.warning('未收到有效回复')
              }
              
              // 保存聊天历史到本地存储
              saveChatsToLocalStorage()
            }
          )
        } catch (error) {
          console.error('请求失败', error)
          const lastMessage = chatHistory.value[currentChatIndex.value].messages[
            chatHistory.value[currentChatIndex.value].messages.length - 1
          ]
          lastMessage.content = '很抱歉，我遇到了问题，无法回复您的问题。请检查网络连接或稍后再试。'
          loading.value = false
          ElMessage.error(error.message || '发送消息失败')
        }
        
      }

      // 保存聊天历史到本地存储
      const saveChatsToLocalStorage = () => {
        try {
          // 限制历史记录条数，避免存储过大
          const historyToSave = chatHistory.value.slice(0, 20).map(chat => {
            // 对于每个聊天，限制消息数量
            const limitedMessages = chat.messages.slice(-50) // 只保留最新的50条消息
            return {
              ...chat,
              messages: limitedMessages
            }
          })
          localStorage.setItem('chatHistory', JSON.stringify(historyToSave))
        } catch (error) {
          console.error('保存聊天历史失败:', error)
        }
      }

      // 从本地存储加载聊天历史
      const loadChatsFromLocalStorage = () => {
        try {
          const saved = localStorage.getItem('chatHistory')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              chatHistory.value = parsed
              return true
            }
          }
          return false
        } catch (error) {
          console.error('加载聊天历史失败:', error)
          return false
        }
      }

      // 开始新对话时重置会话ID
      const startNewChat = () => {
        // 关闭当前流连接
        if (currentStreamConnection) {
          currentStreamConnection.close()
          currentStreamConnection = null
        }
        
        // 重置会话ID
        sessionID.value = ''
        
        chatHistory.value.unshift({
          id: Date.now(),
          title: '新对话',
          time: formatTime(new Date()),
          messages: []
        })
        currentChatIndex.value = 0
      }
      
      
      // 滚动到底部
      const scrollToBottom = () => {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
        }
      }
      
      // 选择聊天
      const selectChat = (index) => {
        // 关闭当前流连接
        if (currentStreamConnection) {
          currentStreamConnection.close()
          currentStreamConnection = null
        }
        
        currentChatIndex.value = index
        // 切换对话时，重置会话ID，使每个对话有独立的会话上下文
        sessionID.value = `chat-${chatHistory.value[index].id}-${Date.now()}`
      }
      
      // 删除聊天
      const deleteChat = (index) => {
        if (chatHistory.value.length <= 1) {
          ElMessage.warning('至少保留一个对话')
          return
        }
        
        // 如果删除当前对话，需要切换到其他对话
        const isCurrentChat = index === currentChatIndex.value
        
        // 移除对话
        chatHistory.value.splice(index, 1)
        
        // 如果删除的是当前对话，切换到第一个对话
        if (isCurrentChat) {
          currentChatIndex.value = 0
        } 
        // 如果删除的对话索引小于当前对话索引，需要调整当前索引
        else if (index < currentChatIndex.value) {
          currentChatIndex.value--
        }
        
        // 保存更改到本地存储
        saveChatsToLocalStorage()
      }
      
      // 使用示例问题
      const useExample = (text) => {
        userInput.value = text
        nextTick(() => {
          sendMessage()
        })
      }

      // 复制消息内容到剪贴板
      const copyMessageContent = (content) => {
        if (!content) return
        
        // 创建一个不可见的textarea元素
        const textarea = document.createElement('textarea')
        textarea.value = content
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        
        // 选择文本并复制
        textarea.select()
        document.execCommand('copy')
        
        // 移除临时元素
        document.body.removeChild(textarea)
        
        // 显示成功提示
        ElMessage.success('已复制到剪贴板')
      }
        // 重新生成响应
      const regenerateResponse = async () => {
        // 获取当前对话的用户最后一条消息
        const messages = currentChat.value.messages
        let lastUserMessageIndex = -1
        
        // 从最后一条消息向前查找最近的用户消息
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].type === 'user') {
            lastUserMessageIndex = i
            break
          }
        }
        
        // 如果找不到用户消息，无法重新生成
        if (lastUserMessageIndex === -1) {
          ElMessage.warning('没有找到用户消息，无法重新生成')
          return
        }
        
        // 获取用户消息内容
        const userMessageContent = messages[lastUserMessageIndex].content
        
        // 删除当前对话中该用户消息后的所有消息
        chatHistory.value[currentChatIndex.value].messages = 
          chatHistory.value[currentChatIndex.value].messages.slice(0, lastUserMessageIndex + 1)
        
        // 重新设置用户输入并发送
        userInput.value = userMessageContent
        await nextTick()
        sendMessage()
      }

      // 组件卸载前关闭所有连接
      onBeforeUnmount(() => {
        if (currentStreamConnection) {
          currentStreamConnection.close()
          currentStreamConnection = null
        }
      })

      // 添加组件生命周期钩子
      onMounted(() => {
        // 尝试从本地存储加载聊天历史
        const loaded = loadChatsFromLocalStorage()
        
        // 如果没有历史或加载失败，创建一个默认对话
        if (!loaded) {
          chatHistory.value = [
            {
              id: Date.now(),
              title: '新对话',
              time: formatTime(new Date()),
              messages: [
                { 
                  type: 'assistant', 
                  content: '您好！我是您的智能家居助手。我可以帮您控制家中的设备，查询天气，或者回答您关于家居的问题。请问有什么可以帮您的吗？',
                  time: formatTime(new Date())
                }
              ]
            }
          ]
        }
        
        // 为当前对话创建会话ID
        if (currentChat.value && !sessionID.value) {
          sessionID.value = `chat-${currentChat.value.id}-${Date.now()}`
        }
        
        // 滚动到底部
        nextTick(scrollToBottom)
        
        // 添加窗口大小变化监听，确保滚动条始终在底部
        window.addEventListener('resize', scrollToBottom)
      })
      
      onBeforeUnmount(() => {
        // 关闭流连接
        if (currentStreamConnection) {
          currentStreamConnection.close()
          currentStreamConnection = null
        }
        
        // 保存聊天历史到本地存储
        saveChatsToLocalStorage()
        
        // 移除事件监听
        window.removeEventListener('resize', scrollToBottom)
      })
  
      return {
        userInput,
        loading,
        chatMessagesRef,
        currentChatIndex,
        chatHistory,
        currentChat,
        sendMessage,
        startNewChat,
        selectChat,
        deleteChat,
        useExample,
        formatMarkdown,
        getFormattedContent,
        copyMessageContent,
        regenerateResponse,
        deviceProviderRef,
        weatherProviderRef,
        logProviderRef
      }
    }
  }
  </script>
  
  <style scoped>
  /* 通用页面容器 - 可复用于其他视图 */
  .modern-page-container {
    min-height: calc(100vh - 84px);
    position: relative;
    background-color: #f5f6fa;
    overflow: hidden;
    padding: 20px;
  }
  
  /* 波浪动画背景 - 与登录页统一风格 */
  .wave-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
    overflow: hidden;
  }
  
  .wave {
    position: absolute;
    width: 200%;
    height: 200%;
    bottom: -100%;
    left: -50%;
    border-radius: 40%;
    animation: wave 15s infinite linear;
    opacity: 0.1;
  }
  
  .wave1 {
    background-color: rgba(66, 133, 244, 0.3);
    animation-duration: 15s;
  }
  
  .wave2 {
    background-color: rgba(52, 168, 83, 0.2);
    animation-duration: 18s;
    animation-delay: -2s;
  }
  
  .wave3 {
    background-color: rgba(234, 67, 53, 0.1);
    animation-duration: 20s;
    animation-delay: -5s;
  }
  
  @keyframes wave {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* 聊天容器样式 */
  .chat-container {
    position: relative;
    z-index: 1;
    height: calc(100vh - 120px);
  }
  
  .chat-layout {
    display: flex;
    height: 100%;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.7);
  }
  
  /* 左侧边栏样式 - 与菜单风格统一 */
  .chat-sidebar {
    width: 280px;
    background: rgba(48, 65, 86, 0.95);
    display: flex;
    flex-direction: column;
    position: relative;
    backdrop-filter: blur(8px);
    overflow: hidden;
  }
  
  /* 侧边栏背景渐变 */
  .chat-sidebar:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(66, 133, 244, 0.15), transparent);
    z-index: 0;
    pointer-events: none;
  }
  
  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  
  .logo-container {
    display: flex;
    align-items: center;
  }
  
  .mini-logo {
    width: 28px;
    height: 28px;
    margin-right: 10px;
    animation: pulse 2s infinite;
    border-radius: 50%;
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: white;
    background: linear-gradient(45deg, #fff 30%, #4285F4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .new-chat-btn {
    background: linear-gradient(45deg, #4285F4, #34A853) !important;
    border: none !important;
    transition: all 0.3s ease !important;
  }
  
  .history-list {
    overflow-y: auto;
    flex: 1;
    padding: 10px;
    position: relative;
    z-index: 1;
  }
  
  /* 滚动条美化 */
  .history-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .history-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  .history-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  .history-item {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .history-item:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: linear-gradient(90deg, rgba(66, 133, 244, 0.05), rgba(66, 133, 244, 0.2));
    transition: width 0.3s ease;
    z-index: -1;
  }
  
  .history-item:hover:before {
    width: 100%;
  }
  
  .history-item:hover {
    color: white;
  }
  
  .history-item.active {
    background: linear-gradient(90deg, rgba(66, 133, 244, 0.3), rgba(66, 133, 244, 0.1)) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    color: white;
  }
  
  .history-item.active:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: #4285F4;
    border-radius: 2px 0 0 2px;
  }
  
  .history-icon {
    margin-right: 12px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4285F4;
    transition: all 0.3s ease;
  }
  
  .history-item:hover .history-icon,
  .history-item.active .history-icon {
    background: rgba(66, 133, 244, 0.3);
    color: white;
    box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
  }
  
  .history-content {
    flex: 1;
    overflow: hidden;
  }
  
  .history-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.3s ease;
  }
  
  .history-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  .history-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .history-item:hover .history-actions {
    opacity: 1;
  }
  
  .history-actions i:hover {
    color: #F25056;
  }
  
  .sidebar-footer {
    padding: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  
  .sidebar-footer:before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  }
  
  .assistant-info {
    display: flex;
    align-items: center;
  }
  
  .assistant-avatar {
    width: 30px;
    height: 30px;
    background: #4285F4;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    margin-right: 10px;
    box-shadow: 0 0 10px rgba(66, 133, 244, 0.4);
  }
  
  .assistant-name {
    font-size: 14px;
    font-weight: 500;
    color: white;
  }
  
  /* 聊天主界面样式 */
  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    position: relative;
  }
  
  .chat-header {
    padding: 15px 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
  
  .current-chat-info {
    display: flex;
    align-items: center;
  }
  
  .current-chat-info h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .chat-status {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #4caf50;
    margin-left: 10px;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    background-color: #4caf50;
    border-radius: 50%;
    margin-right: 5px;
    animation: pulse 2s infinite;
  }
  
  .refresh-btn {
    color: #4285F4;
    transition: all 0.3s ease;
  }
  
  .refresh-btn:hover {
    color: #3367d6;
    transform: rotate(180deg);
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f8f9fa;
    position: relative;
  }
  
  /* 滚动条美化 */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }
  
  .chat-messages::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  .chat-messages::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  .welcome-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 20px;
  }
  
  .welcome-icon {
    width: 80px;
    height: 80px;
    background: #e7f1ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: #4285F4;
    font-size: 40px;
    box-shadow: 0 10px 20px rgba(66, 133, 244, 0.15);
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
  }
  
  .welcome-text {
    font-size: 16px;
    color: #666;
    max-width: 500px;
    line-height: 1.6;
    margin-bottom: 30px;
  }
  
  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .suggestion-chip {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
  }
  
  .suggestion-chip:hover {
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
    transform: translateY(-2px);
    border-color: #4285F4;
  }
  
  .suggestion-chip i {
    margin-right: 8px;
    color: #4285F4;
  }
  
  /* 消息样式 */
  .message {
    display: flex;
    margin-bottom: 20px;
    animation: fadeIn 0.5s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .message-avatar {
    margin-right: 15px;
    align-self: flex-start;
  }
  
  .user-avatar, .assistant-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .user-avatar {
    background: #e7f1ff;
    color: #4285F4;
  }
  
  .assistant-avatar {
    background: #4285F4;
    color: white;
    box-shadow: 0 0 10px rgba(66, 133, 244, 0.4);
  }
  
  .message-content {
    flex: 1;
    max-width: 80%;
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  
  .message-sender {
    font-weight: 500;
    color: #333;
  }
  
  .message-time {
    font-size: 12px;
    color: #999;
  }
  
  .message-body {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    line-height: 1.6;
  }
  
  .user-message .message-body {
    background: #e7f1ff;
    color: #333;
    border-top-right-radius: 4px;
  }
  
  .assistant-message .message-body {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-top-left-radius: 4px;
  }
  
  .message-actions {
    margin-top: 8px;
    display: flex;
    gap: 10px;
  }
  
  /* 打字指示器 */
  .typing-indicator {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    background: white;
    width: fit-content;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    background: #4285F4;
    border-radius: 50%;
    margin: 0 3px;
    animation: bounce 1.5s infinite ease-in-out;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }
  
  /* 输入区域 */
  .chat-input-container {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
    background: white;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
  }
  
  .input-wrapper .el-textarea {
    flex: 1;
  }
  
  .input-wrapper .el-textarea >>> .el-textarea__inner {
    border-radius: 12px;
    padding: 12px 15px;
    line-height: 1.6;
    resize: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }
  
  .input-wrapper .el-textarea >>> .el-textarea__inner:focus {
    box-shadow: 0 2px 15px rgba(66, 133, 244, 0.15);
    border-color: #4285F4;
  }
  
  .input-actions {
    margin-left: 15px;
    align-self: flex-end;
  }
  
  .send-button {
    background: linear-gradient(45deg, #4285F4, #34A853) !important;
    border: none !important;
    box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  .send-button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 15px rgba(66, 133, 244, 0.4) !important;
  }
    .send-button:active {
    transform: translateY(0) !important;
  }
  
  .input-info {
    margin-top: 8px;
    text-align: right;
    font-size: 12px;
    color: #999;
  }
  
  /* 动画效果 */
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
  }
  </style>