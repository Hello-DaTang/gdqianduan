<template>
    <div class="modern-page-container">
      <!-- 波浪背景动画 -->
      <div class="wave-container">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>
      
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
                  
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-sender">{{ message.type === 'user' ? '您' : '智能助手' }}</span>
                      <span class="message-time">{{ message.time }}</span>
                    </div>
                    <div class="message-body">
                      <div v-if="message.type === 'assistant' && message.content" v-html="formatMarkdown(message.content)"></div>
                      <div v-else>{{ message.content }}</div>
                    </div>
                    
                    <div v-if="message.type === 'assistant'" class="message-actions">
                      <el-button type="text" size="small" icon="el-icon-copy-document">复制</el-button>
                      <el-button type="text" size="small" icon="el-icon-refresh">重新生成</el-button>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // 保持原有的script部分不变
  import { ref, computed, nextTick, onMounted ,onBeforeUnmount} from 'vue'
  import { getChatStreamWithHistory } from '@/api/chat'
  import { ElMessage } from 'element-plus'
  export default {
    name: 'ChatView',
    setup() {
      const userInput = ref('')
      const loading = ref(false)
      const chatMessagesRef = ref(null)
      const currentChatIndex = ref(0)
      
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
          
          // 获取最后添加的消息的引用
          const lastMessageIndex = chatHistory.value[currentChatIndex.value].messages.length - 1
          let responseContent = ''
          
          // 建立新的流式连接
          currentStreamConnection = getChatStreamWithHistory(currentInput, sessionID.value)
          
          // 开始获取流数据
          currentStreamConnection.fetch(
            // onMessage 回调
            (data) => {
              console.log('收到消息数据:', data) // 添加此行查看接收到的数据
              // 累积内容
              responseContent += data
              
              // 更新聊天消息内容
              chatHistory.value[currentChatIndex.value].messages[lastMessageIndex].content = responseContent
              console.log('更新后的内容:', responseContent.length) // 添加长度检查
              
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
                  '很抱歉，我遇到了问题，无法回复您的问题。'
              }
            },
            // onComplete 回调
            () => {
              console.log('流式响应完成')
              loading.value = false
              currentStreamConnection = null
            }
          )
        } catch (error) {
          console.error('请求失败', error)
          const lastMessage = chatHistory.value[currentChatIndex.value].messages[
            chatHistory.value[currentChatIndex.value].messages.length - 1
          ]
          lastMessage.content = '很抱歉，我遇到了问题，无法回复您的问题。'
          loading.value = false
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
        currentChatIndex.value = index
      }
      
      // 删除聊天
      const deleteChat = (index) => {
        if (chatHistory.value.length <= 1) {
          ElMessage.warning('至少保留一个对话')
          return
        }
        
        chatHistory.value.splice(index, 1)
        
        // 如果删除的是当前聊天，则选择第一个聊天
        if (index === currentChatIndex.value) {
          currentChatIndex.value = 0
        } else if (index < currentChatIndex.value) {
          // 如果删除的是当前聊天之前的聊天，则当前聊天索引减1
          currentChatIndex.value--
        }
      }
      
      // 使用示例问题
      const useExample = (example) => {
        userInput.value = example
        sendMessage()
      }

      // 组件卸载前关闭所有连接
      onBeforeUnmount(() => {
        if (currentStreamConnection) {
          currentStreamConnection.close()
          currentStreamConnection = null
        }
      })
      
      onMounted(() => {
        scrollToBottom()
      })
  
      return {
        userInput,
        loading,
        chatHistory,
        currentChatIndex,
        currentChat,
        chatMessagesRef,
        formatMarkdown,
        sendMessage,
        startNewChat,
        selectChat,
        deleteChat,
        useExample
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